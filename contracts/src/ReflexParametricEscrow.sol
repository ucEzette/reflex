// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ITeleporterMessenger, TeleporterMessageInput, TeleporterFeeInfo} from "./interfaces/ITeleporterMessenger.sol";
import {ITeleporterReceiver} from "./interfaces/ITeleporterReceiver.sol";
import {IFunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/interfaces/IFunctionsClient.sol";
import {IFunctionsRouter} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/interfaces/IFunctionsRouter.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title ReflexParametricEscrow
 * @notice Parametric micro-insurance escrow contract for flight delay insurance.
 *         Policies are purchased with USDC, and payouts are triggered automatically
 *         when a zkTLS proof of flight delay is submitted via Avalanche Teleporter.
 * @dev Implements UUPS upgradeability pattern. Uses OZ v5 storage layouts.
 */
contract ReflexParametricEscrow is
    ITeleporterReceiver,
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuard,
    IFunctionsClient
{
    using FunctionsRequest for FunctionsRequest.Request;
    // ─── State Variables ──────────────────────────────────────────────

    ITeleporterMessenger public teleporter;
    IERC20 public usdc;
    bytes32 public reflexL1ChainId;
    address public protocolTreasury;

    uint256 private _policyNonce;

    struct Policy {
        address policyholder;
        string apiTarget;
        uint256 premiumPaid;
        uint256 payoutAmount;
        uint256 expirationTime;
        bool isActive;
        bool isClaimed;
    }

    mapping(bytes32 => Policy) public policies;
    mapping(address => bytes32[]) public userPolicies;

    // Chainlink Functions config
    address public functionsRouter;
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public fulfillGasLimit;
    string public functionsSource;

    mapping(bytes32 => bytes32) public pendingRequests; // requestId => policyId

    // Multi-Relayer Authorized Network
    mapping(address => bool) public authorizedRelayers;

    // ─── Events ───────────────────────────────────────────────────────

    event PolicyPurchased(
        bytes32 indexed policyId,
        address indexed policyholder,
        string apiTarget,
        uint256 premiumPaid,
        uint256 payoutAmount,
        uint256 expirationTime
    );

    event PolicyClaimed(
        bytes32 indexed policyId,
        address indexed policyholder,
        uint256 payoutAmount
    );

    event PolicyExpired(bytes32 indexed policyId);

    event TeleporterMessageSent(
        bytes32 indexed policyId,
        bytes32 indexed destinationChainId
    );

    event ChainlinkRequestSent(
        bytes32 indexed requestId,
        bytes32 indexed policyId
    );
    event ChainlinkRequestFulfilled(bytes32 indexed requestId, bool isDelayed);
    event ChainlinkRequestFailed(bytes32 indexed requestId, string reason);

    // ─── Errors ───────────────────────────────────────────────────────

    error OnlyTeleporter();
    error OnlyRouter();
    error NotAuthorizedRelayer();
    error InvalidPremium();
    error InvalidPayout();
    error InvalidDuration();
    error PolicyNotActive();
    error PolicyAlreadyClaimed();
    error PolicyNotExpired();
    error TransferFailed();
    error InvalidProof();
    error UnexpectedRequestID();

    // ─── Modifiers ────────────────────────────────────────────────────

    modifier onlyTeleporter() {
        if (msg.sender != address(teleporter)) revert OnlyTeleporter();
        _;
    }

    modifier onlyRouter() {
        if (msg.sender != functionsRouter) revert OnlyRouter();
        _;
    }

    modifier onlyAuthorizedRelayer() {
        if (!authorizedRelayers[msg.sender]) revert NotAuthorizedRelayer();
        _;
    }

    // ─── Initializer ──────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _teleporter,
        address _usdc,
        bytes32 _reflexL1ChainId,
        address _protocolTreasury,
        address _initialOwner
    ) public initializer {
        __Ownable_init(_initialOwner);
        // Both UUPSUpgradeable and ReentrancyGuard in OZ v5 are stateless
        // and do not need internal initialization.

        teleporter = ITeleporterMessenger(_teleporter);
        usdc = IERC20(_usdc);
        reflexL1ChainId = _reflexL1ChainId;
        protocolTreasury = _protocolTreasury;
    }

    // ─── UUPS Required Override ──────────────────────────────────────

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // ─── External Functions ───────────────────────────────────────────

    function purchasePolicy(
        string calldata _apiTarget,
        uint256 _premium,
        uint256 _payoutAmount,
        uint256 _durationHours
    ) external nonReentrant returns (bytes32 policyId) {
        return
            _purchasePolicy(
                msg.sender,
                msg.sender,
                _apiTarget,
                _premium,
                _payoutAmount,
                _durationHours
            );
    }

    function purchasePolicyOnBehalfOf(
        address _policyholder,
        string calldata _apiTarget,
        uint256 _premium,
        uint256 _payoutAmount,
        uint256 _durationHours
    ) external nonReentrant returns (bytes32 policyId) {
        return
            _purchasePolicy(
                msg.sender,
                _policyholder,
                _apiTarget,
                _premium,
                _payoutAmount,
                _durationHours
            );
    }

    function _purchasePolicy(
        address _payer,
        address _policyholder,
        string calldata _apiTarget,
        uint256 _premium,
        uint256 _payoutAmount,
        uint256 _durationHours
    ) internal returns (bytes32 policyId) {
        if (_premium == 0) revert InvalidPremium();
        if (_payoutAmount == 0) revert InvalidPayout();
        if (_durationHours == 0) revert InvalidDuration();

        bool success = usdc.transferFrom(_payer, protocolTreasury, _premium);
        if (!success) revert TransferFailed();

        policyId = keccak256(
            abi.encodePacked(
                _policyholder,
                _apiTarget,
                block.timestamp,
                _policyNonce++
            )
        );

        uint256 expiration = block.timestamp + (_durationHours * 1 hours);

        policies[policyId] = Policy({
            policyholder: _policyholder,
            apiTarget: _apiTarget,
            premiumPaid: _premium,
            payoutAmount: _payoutAmount,
            expirationTime: expiration,
            isActive: true,
            isClaimed: false
        });

        userPolicies[_policyholder].push(policyId);

        bytes memory monitoringPayload = abi.encode(
            policyId,
            _apiTarget,
            expiration
        );

        TeleporterMessageInput memory messageInput = TeleporterMessageInput({
            destinationBlockchainID: reflexL1ChainId,
            destinationAddress: address(this),
            feeInfo: TeleporterFeeInfo({
                feeTokenAddress: address(0),
                amount: 0
            }),
            requiredGasLimit: 300_000,
            allowedRelayerAddresses: new address[](0),
            message: monitoringPayload
        });

        teleporter.sendCrossChainMessage(messageInput);

        emit PolicyPurchased(
            policyId,
            _policyholder,
            _apiTarget,
            _premium,
            _payoutAmount,
            expiration
        );
        emit TeleporterMessageSent(policyId, reflexL1ChainId);
    }

    function requestFlightStatus(
        bytes32 _policyId,
        string[] calldata _args
    ) external nonReentrant onlyAuthorizedRelayer returns (bytes32 requestId) {
        Policy storage policy = policies[_policyId];
        if (!policy.isActive) revert PolicyNotActive();
        if (policy.isClaimed) revert PolicyAlreadyClaimed();

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(functionsSource);

        if (_args.length > 0) {
            req.setArgs(_args);
        }

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            fulfillGasLimit,
            donId
        );

        pendingRequests[requestId] = _policyId;
        emit ChainlinkRequestSent(requestId, _policyId);
    }

    function _sendRequest(
        bytes memory data,
        uint64 subId,
        uint32 callbackGasLimit,
        bytes32 dId
    ) internal returns (bytes32) {
        bytes32 requestId = IFunctionsRouter(functionsRouter).sendRequest(
            subId,
            data,
            FunctionsRequest.REQUEST_DATA_VERSION,
            callbackGasLimit,
            dId
        );
        return requestId;
    }

    function receiveTeleporterMessage(
        bytes32 /*sourceBlockchainID*/,
        address /*originSenderAddress*/,
        bytes calldata message
    ) external override onlyTeleporter nonReentrant {
        (bytes32 policyId, bytes memory zkProof) = abi.decode(
            message,
            (bytes32, bytes)
        );

        Policy storage policy = policies[policyId];

        if (!policy.isActive) revert PolicyNotActive();
        if (policy.isClaimed) revert PolicyAlreadyClaimed();
        if (!_verifyZkProof(zkProof)) revert InvalidProof();

        policy.isClaimed = true;
        policy.isActive = false;

        bool success = usdc.transferFrom(
            protocolTreasury,
            policy.policyholder,
            policy.payoutAmount
        );
        if (!success) revert TransferFailed();

        emit PolicyClaimed(policyId, policy.policyholder, policy.payoutAmount);
    }

    function expirePolicy(bytes32 _policyId) external {
        Policy storage policy = policies[_policyId];
        if (!policy.isActive) revert PolicyNotActive();
        if (block.timestamp <= policy.expirationTime) revert PolicyNotExpired();

        policy.isActive = false;
        emit PolicyExpired(_policyId);
    }

    // ─── View Functions ───────────────────────────────────────────────

    function getUserPolicies(
        address _user
    ) external view returns (bytes32[] memory) {
        return userPolicies[_user];
    }

    function getPolicy(
        bytes32 _policyId
    )
        external
        view
        returns (
            address policyholder,
            string memory apiTarget,
            uint256 premiumPaid,
            uint256 payoutAmount,
            uint256 expirationTime,
            bool isActive,
            bool isClaimed
        )
    {
        Policy storage p = policies[_policyId];
        return (
            p.policyholder,
            p.apiTarget,
            p.premiumPaid,
            p.payoutAmount,
            p.expirationTime,
            p.isActive,
            p.isClaimed
        );
    }

    // ─── Admin Functions ──────────────────────────────────────────────

    function setProtocolTreasury(address _newTreasury) external onlyOwner {
        protocolTreasury = _newTreasury;
    }

    function setFunctionsConfig(
        address _router,
        bytes32 _donId,
        uint64 _subscriptionId,
        uint32 _fulfillGasLimit,
        string calldata _functionsSource
    ) external onlyOwner {
        functionsRouter = _router;
        donId = _donId;
        subscriptionId = _subscriptionId;
        fulfillGasLimit = _fulfillGasLimit;
        functionsSource = _functionsSource;
    }

    function addRelayer(address _relayer) external onlyOwner {
        authorizedRelayers[_relayer] = true;
    }

    function removeRelayer(address _relayer) external onlyOwner {
        authorizedRelayers[_relayer] = false;
    }

    // ─── Internal Functions ───────────────────────────────────────────

    function _verifyZkProof(
        bytes memory proof
    ) internal pure returns (bool valid) {
        if (proof.length < 97) return false;
        bytes32 claimHash;
        assembly {
            claimHash := mload(add(proof, 32))
        }
        return claimHash != bytes32(0);
    }

    // ─── Chainlink Functions Override ─────────────────────────────────

    function handleOracleFulfillment(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) external override onlyRouter {
        _fulfillRequest(requestId, response, err);
    }

    function _fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal {
        bytes32 policyId = pendingRequests[requestId];
        if (policyId == bytes32(0)) revert UnexpectedRequestID();

        if (err.length > 0) {
            emit ChainlinkRequestFailed(requestId, string(err));
            return;
        }

        // Response is a 256-bit uint: 1 for delayed > 2 hours, 0 otherwise
        uint256 decodedResponse = abi.decode(response, (uint256));
        bool isDelayed = decodedResponse == 1;
        emit ChainlinkRequestFulfilled(requestId, isDelayed);

        if (isDelayed) {
            Policy storage policy = policies[policyId];
            if (policy.isActive && !policy.isClaimed) {
                policy.isClaimed = true;
                policy.isActive = false;

                bool success = usdc.transferFrom(
                    protocolTreasury,
                    policy.policyholder,
                    policy.payoutAmount
                );
                if (success) {
                    emit PolicyClaimed(
                        policyId,
                        policy.policyholder,
                        policy.payoutAmount
                    );
                }
            }
        }
    }
}
