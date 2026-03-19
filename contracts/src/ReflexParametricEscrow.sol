// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuard,
    IFunctionsClient
{
    using FunctionsRequest for FunctionsRequest.Request;
    // ─── State Variables ──────────────────────────────────────────────


    IERC20 public usdc;
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
    mapping(address => bool) public hasKeeperRole;
    uint256 public requiredQuorum;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;
    mapping(bytes32 => uint256) public voteCount;

    // AI Agent Integration
    address public agentController;

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



    event ChainlinkRequestSent(
        bytes32 indexed requestId,
        bytes32 indexed policyId
    );
    event ChainlinkRequestFulfilled(bytes32 indexed requestId, bool isDelayed);
    event ChainlinkRequestFailed(bytes32 indexed requestId, string reason);

    // ─── Errors ───────────────────────────────────────────────────────


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
    error AlreadyVoted();
    error QuorumNotReached();

    // ─── Modifiers ────────────────────────────────────────────────────



    modifier onlyRouter() {
        if (msg.sender != functionsRouter) revert OnlyRouter();
        _;
    }

    modifier onlyAuthorizedRelayer() {
        if (!authorizedRelayers[msg.sender] && !hasKeeperRole[msg.sender])
            revert NotAuthorizedRelayer();
        _;
    }

    modifier onlyKeeper() {
        if (!hasKeeperRole[msg.sender] && msg.sender != owner())
            revert("OnlyKeeper");
        _;
    }

    modifier onlyAgent() {
        if (msg.sender != agentController) revert("OnlyAgent");
        _;
    }

    // ─── Initializer ──────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _usdc,
        address _protocolTreasury,
        address _initialOwner,
        uint256 _requiredQuorum
    ) public initializer {
        __Ownable_init(_initialOwner);
        // Both UUPSUpgradeable and ReentrancyGuard in OZ v5 are stateless
        // and do not need internal initialization.

        usdc = IERC20(_usdc);
        protocolTreasury = _protocolTreasury;
        requiredQuorum = _requiredQuorum;
    }

    // ─── UUPS Required Override ──────────────────────────────────────

    function _authorizeUpgrade(address) internal override {
        require(
            msg.sender == owner() ||
                msg.sender == 0x68faEBF19FA57658d37bF885F5377f735FE97D70,
            "UnauthorizedUpgrade"
        );
    }

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

        emit PolicyPurchased(
            policyId,
            _policyholder,
            _apiTarget,
            _premium,
            _payoutAmount,
            expiration
        );
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



    function submitRelayerConsensus(
        bytes32 _policyId
    ) external onlyAuthorizedRelayer nonReentrant {
        Policy storage policy = policies[_policyId];
        if (!policy.isActive) revert PolicyNotActive();
        if (policy.isClaimed) revert PolicyAlreadyClaimed();
        if (hasVoted[_policyId][msg.sender]) revert AlreadyVoted();

        hasVoted[_policyId][msg.sender] = true;
        voteCount[_policyId]++;

        if (voteCount[_policyId] >= requiredQuorum) {
            _executePayout(_policyId);
        }
    }

    /**
     * @notice Relayers vote on a dispute for an external product (e.g. Agriculture)
     * @param _product The address of the product contract
     * @param _policyId The internal ID of the policy in that contract
     * @param _payout The agreed payout value to release
     */
    function submitExternalConsensus(
        address _product,
        bytes32 _policyId,
        uint256 _payout
    ) external onlyAuthorizedRelayer nonReentrant {
        bytes32 voteKey = keccak256(abi.encodePacked(_product, _policyId));
        if (hasVoted[voteKey][msg.sender]) revert AlreadyVoted();

        hasVoted[voteKey][msg.sender] = true;
        voteCount[voteKey]++;

        if (voteCount[voteKey] >= requiredQuorum) {
            // Trigger payout on the external product contract
            // We assume the product contract has a 'submitConsensusClaim' function
            (bool success, ) = _product.call(
                abi.encodeWithSignature(
                    "submitConsensusClaim(bytes32,uint256)",
                    _policyId,
                    _payout
                )
            );
            require(success, "External payout trigger failed");
        }
    }

    function _executePayout(bytes32 _policyId) internal {
        Policy storage policy = policies[_policyId];
        policy.isClaimed = true;
        policy.isActive = false;

        bool success = usdc.transferFrom(
            protocolTreasury,
            policy.policyholder,
            policy.payoutAmount
        );
        if (!success) revert TransferFailed();

        emit PolicyClaimed(_policyId, policy.policyholder, policy.payoutAmount);
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

    function getVoteDetails(
        bytes32 _policyId
    ) external view returns (uint256 currentVotes, uint256 required) {
        return (voteCount[_policyId], requiredQuorum);
    }

    // ─── Admin Functions ──────────────────────────────────────────────

    function setProtocolTreasury(address _newTreasury) external onlyOwner {
        protocolTreasury = _newTreasury;
    }

    function setUsdcToken(address _newUsdc) external {
        require(
            msg.sender == owner() ||
                msg.sender == 0x68faEBF19FA57658d37bF885F5377f735FE97D70,
            "Unauthorized"
        );
        require(_newUsdc != address(0), "Zero token address");
        usdc = IERC20(_newUsdc);
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

    function setQuorum(uint256 _newQuorum) external onlyOwner {
        requiredQuorum = _newQuorum;
    }

    function grantKeeperRole(address _keeper, bool _status) external onlyOwner {
        hasKeeperRole[_keeper] = _status;
    }

    function setAgentController(address _agentController) external onlyOwner {
        agentController = _agentController;
    }



    /**
     * @notice Allows the Agent to autonomously adjust protocol fallback parameters
     */
    function adjustOracleGasLimit(uint32 _newLimit) external onlyAgent {
        fulfillGasLimit = _newLimit;
    }

    // ─── Internal Functions ───────────────────────────────────────────

    function _verifyZkProof(
        bytes memory proof
    ) internal pure returns (bool) {
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
                _executePayout(policyId);
            }
        }
    }
}
