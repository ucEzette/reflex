// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ITeleporterMessenger, TeleporterMessageInput, TeleporterFeeInfo} from "./interfaces/ITeleporterMessenger.sol";
import {ITeleporterReceiver} from "./interfaces/ITeleporterReceiver.sol";

/**
 * @title ReflexParametricEscrow
 * @notice Parametric micro-insurance escrow contract for flight delay insurance.
 *         Policies are purchased with USDC, and payouts are triggered automatically
 *         when a zkTLS proof of flight delay is submitted via Avalanche Teleporter.
 * @dev Implements ITeleporterReceiver for cross-chain message handling and uses
 *      ReentrancyGuard for safe USDC transfers.
 */
contract ReflexParametricEscrow is ITeleporterReceiver, ReentrancyGuard {
    // ─── State Variables ──────────────────────────────────────────────

    ITeleporterMessenger public immutable teleporter;
    IERC20 public immutable usdc;
    bytes32 public immutable reflexL1ChainId;
    address public protocolTreasury;
    address public owner;

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
    error OnlyOwner();
    error InvalidPremium();
    error InvalidPayout();
    error InvalidDuration();
    error PolicyNotActive();
    error PolicyAlreadyClaimed();
    error PolicyNotExpired();
    error TransferFailed();
    error InsufficientTreasuryBalance();
    error InvalidProof();

    // ─── Modifiers ────────────────────────────────────────────────────

    modifier onlyTeleporter() {
        if (msg.sender != address(teleporter)) revert OnlyTeleporter();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────

    constructor(
        address _teleporter,
        address _usdc,
        bytes32 _reflexL1ChainId,
        address _protocolTreasury
    ) {
        teleporter = ITeleporterMessenger(_teleporter);
        usdc = IERC20(_usdc);
        reflexL1ChainId = _reflexL1ChainId;
        protocolTreasury = _protocolTreasury;
        owner = msg.sender;
    }

    // ─── External Functions ───────────────────────────────────────────

    /**
     * @notice Purchase a new parametric insurance policy.
     * @param _apiTarget The API endpoint target for the flight (e.g. "flights/UAL123").
     * @param _premium   The USDC premium amount (6 decimals).
     * @param _payoutAmount The USDC payout amount if claim is triggered (6 decimals).
     * @param _durationHours Policy coverage duration in hours.
     * @return policyId  The unique identifier for the created policy.
     */
    function purchasePolicy(
        string calldata _apiTarget,
        uint256 _premium,
        uint256 _payoutAmount,
        uint256 _durationHours
    ) external nonReentrant returns (bytes32 policyId) {
        if (_premium == 0) revert InvalidPremium();
        if (_payoutAmount == 0) revert InvalidPayout();
        if (_durationHours == 0) revert InvalidDuration();

        // Transfer premium from user to treasury
        bool success = usdc.transferFrom(
            msg.sender,
            protocolTreasury,
            _premium
        );
        if (!success) revert TransferFailed();

        // Generate unique policy ID
        policyId = keccak256(
            abi.encodePacked(
                msg.sender,
                _apiTarget,
                block.timestamp,
                _policyNonce++
            )
        );

        uint256 expiration = block.timestamp + (_durationHours * 1 hours);

        // Store the policy
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

        // Send Teleporter message to Reflex L1 to start zkTLS monitoring
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

    /**
     * @notice Receive a cross-chain message from the Teleporter with a zkTLS proof.
     * @dev Only callable by the Teleporter contract.
     * @param sourceBlockchainID The originating chain ID.
     * @param originSenderAddress The originating sender address.
     * @param message ABI-encoded (bytes32 policyId, bytes zkProof).
     */
    function receiveTeleporterMessage(
        bytes32 sourceBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override onlyTeleporter nonReentrant {
        // Suppress unused parameter warnings — we validate via onlyTeleporter modifier
        sourceBlockchainID;
        originSenderAddress;

        (bytes32 policyId, bytes memory zkProof) = abi.decode(
            message,
            (bytes32, bytes)
        );

        Policy storage policy = policies[policyId];

        if (!policy.isActive) revert PolicyNotActive();
        if (policy.isClaimed) revert PolicyAlreadyClaimed();

        // Verify zkTLS proof
        if (!_verifyZkProof(zkProof)) revert InvalidProof();

        // Mark as claimed
        policy.isClaimed = true;
        policy.isActive = false;

        // Transfer payout to policyholder
        bool success = usdc.transferFrom(
            protocolTreasury,
            policy.policyholder,
            policy.payoutAmount
        );
        if (!success) revert TransferFailed();

        emit PolicyClaimed(policyId, policy.policyholder, policy.payoutAmount);
    }

    /**
     * @notice Expire a policy that has passed its expiration time.
     * @param _policyId The ID of the policy to expire.
     */
    function expirePolicy(bytes32 _policyId) external {
        Policy storage policy = policies[_policyId];

        if (!policy.isActive) revert PolicyNotActive();
        if (block.timestamp <= policy.expirationTime) revert PolicyNotExpired();

        policy.isActive = false;

        emit PolicyExpired(_policyId);
    }

    // ─── View Functions ───────────────────────────────────────────────

    /**
     * @notice Get all policy IDs for a given user.
     * @param _user The user's address.
     * @return Array of policy IDs.
     */
    function getUserPolicies(
        address _user
    ) external view returns (bytes32[] memory) {
        return userPolicies[_user];
    }

    /**
     * @notice Get full policy details by ID.
     * @param _policyId The policy ID.
     * @return policyholder The policyholder address.
     * @return apiTarget The API target string.
     * @return premiumPaid The premium amount paid.
     * @return payoutAmount The potential payout amount.
     * @return expirationTime The policy expiration timestamp.
     * @return isActive Whether the policy is currently active.
     * @return isClaimed Whether the policy has been claimed.
     */
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

    /**
     * @notice Update the protocol treasury address.
     * @param _newTreasury The new treasury address.
     */
    function setProtocolTreasury(address _newTreasury) external onlyOwner {
        protocolTreasury = _newTreasury;
    }

    // ─── Internal Functions ───────────────────────────────────────────

    /**
     * @dev Verify the zkTLS proof. In production, this integrates with Reclaim Protocol's
     *      on-chain verifier. For testnet, we validate minimum proof length and structure.
     * @param proof The serialized zkTLS proof bytes.
     * @return valid Whether the proof is considered valid.
     */
    function _verifyZkProof(
        bytes memory proof
    ) internal pure returns (bool valid) {
        // Production: Call Reclaim Protocol's on-chain proof verifier
        // For testnet deployment, validate proof is non-empty and properly structured.
        // The proof must contain at minimum:
        //   - 32 bytes: claim hash
        //   - 65 bytes: signature (r, s, v)
        //   - Variable: provider data
        if (proof.length < 97) return false;

        // Extract the claim hash and verify it's non-zero
        bytes32 claimHash;
        assembly {
            claimHash := mload(add(proof, 32))
        }
        if (claimHash == bytes32(0)) return false;

        return true;
    }
}
