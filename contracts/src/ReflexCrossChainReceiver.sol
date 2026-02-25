// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CCIPReceiver} from "@chainlink/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IReflexParametricEscrow {
    function purchasePolicyOnBehalfOf(
        address _policyholder,
        string calldata _apiTarget,
        uint256 _premium,
        uint256 _payoutAmount,
        uint256 _durationHours
    ) external returns (bytes32 policyId);
}

/**
 * @title ReflexCrossChainReceiver
 * @notice Receives CCIP messages containing bridged USDC and automatically purchases
 *         a flight delay insurance policy on the ReflexParametricEscrow contract.
 */
contract ReflexCrossChainReceiver is CCIPReceiver {
    using SafeERC20 for IERC20;

    IReflexParametricEscrow public immutable ESCROW;
    IERC20 public immutable USDC;

    event PolicyPurchasedCrossChain(
        bytes32 indexed messageId,
        bytes32 indexed policyId,
        address indexed user
    );
    event CCIPMessageReceived(bytes32 indexed messageId, address sender);

    error InvalidUsdcAmount();
    error NoTokenReceived();

    constructor(
        address _router,
        address _escrow,
        address _usdc
    ) CCIPReceiver(_router) {
        ESCROW = IReflexParametricEscrow(_escrow);
        USDC = IERC20(_usdc);

        // Approve Escrow to spend USDC indefinitely to save gas on policy purchases
        USDC.approve(_escrow, type(uint256).max);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        // 1. Verify token was received
        if (any2EvmMessage.destTokenAmounts.length == 0)
            revert NoTokenReceived();
        IERC20 receivedToken = IERC20(any2EvmMessage.destTokenAmounts[0].token);
        uint256 amount = any2EvmMessage.destTokenAmounts[0].amount;

        if (address(receivedToken) != address(USDC)) revert InvalidUsdcAmount();

        // 2. Decode the message payload
        // The sender needs to abi.encode(address user, string apiTarget, uint256 payoutAmount, uint256 durationHours)
        (
            address user,
            string memory apiTarget,
            uint256 payoutAmount,
            uint256 durationHours
        ) = abi.decode(
                any2EvmMessage.data,
                (address, string, uint256, uint256)
            );

        // 3. Purchase the policy on behalf of the user
        bytes32 policyId = ESCROW.purchasePolicyOnBehalfOf(
            user,
            apiTarget,
            amount, // Premium is exactly the bridged USDC amount
            payoutAmount,
            durationHours
        );

        emit PolicyPurchasedCrossChain(
            any2EvmMessage.messageId,
            policyId,
            user
        );
        emit CCIPMessageReceived(
            any2EvmMessage.messageId,
            abi.decode(any2EvmMessage.sender, (address))
        );
    }
}
