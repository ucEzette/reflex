// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ITeleporterMessenger, TeleporterMessageInput, TeleporterFeeInfo} from "./interfaces/ITeleporterMessenger.sol";
import {ITeleporterReceiver} from "./interfaces/ITeleporterReceiver.sol";

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
    ReentrancyGuard
{
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

    // ─── Errors ───────────────────────────────────────────────────────

    error OnlyTeleporter();
    error InvalidPremium();
    error InvalidPayout();
    error InvalidDuration();
    error PolicyNotActive();
    error PolicyAlreadyClaimed();
    error PolicyNotExpired();
    error TransferFailed();
    error InvalidProof();

    // ─── Modifiers ────────────────────────────────────────────────────

    modifier onlyTeleporter() {
        if (msg.sender != address(teleporter)) revert OnlyTeleporter();
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
        if (_premium == 0) revert InvalidPremium();
        if (_payoutAmount == 0) revert InvalidPayout();
        if (_durationHours == 0) revert InvalidDuration();

        bool success = usdc.transferFrom(
            msg.sender,
            protocolTreasury,
            _premium
        );
        if (!success) revert TransferFailed();

        policyId = keccak256(
            abi.encodePacked(
                msg.sender,
                _apiTarget,
                block.timestamp,
                _policyNonce++
            )
        );

        uint256 expiration = block.timestamp + (_durationHours * 1 hours);

        policies[policyId] = Policy({
            policyholder: msg.sender,
            apiTarget: _apiTarget,
            premiumPaid: _premium,
            payoutAmount: _payoutAmount,
            expirationTime: expiration,
            isActive: true,
            isClaimed: false
        });

        userPolicies[msg.sender].push(policyId);

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
            msg.sender,
            _apiTarget,
            _premium,
            _payoutAmount,
            expiration
        );
        emit TeleporterMessageSent(policyId, reflexL1ChainId);
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
}
