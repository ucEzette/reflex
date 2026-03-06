// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexLiquidityPool.sol";
import "../src/ReflexParametricEscrow.sol";

/**
 * @title GrantAgentRoles
 * @notice Foundry script to grant the Autonomous Agent its necessary roles
 *         on the Avalanche Fuji testnet.
 */
contract GrantAgentRoles is Script {
    // Current Fuji Deployment Addresses (March 2026) - Corrected Checksums
    address public constant LIQUIDITY_POOL =
        0x518362015D85ACd360413da1f7eb1a391410AF70;
    address public constant ESCROW = 0xaab7AD99551765568C4a84A9bDB852527c4aCB2f;

    // Generated Agent WDK Wallet Address
    address public constant AGENT_ADDRESS =
        0x2fb454025BF4790050f6B49B48e7510037c6aEA3;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ReflexLiquidityPool pool = ReflexLiquidityPool(LIQUIDITY_POOL);
        ReflexParametricEscrow escrow = ReflexParametricEscrow(ESCROW);

        console.log("Granting Agent roles...");
        console.log("Agent:", AGENT_ADDRESS);

        // Grant TREASURY_ROLE on LiquidityPool
        pool.grantTreasuryRole(AGENT_ADDRESS, true);
        console.log("Granted TREASURY_ROLE on Pool");

        // Grant KEEPER_ROLE on Escrow
        escrow.grantKeeperRole(AGENT_ADDRESS, true);
        console.log("Granted KEEPER_ROLE on Escrow");

        vm.stopBroadcast();
    }
}
