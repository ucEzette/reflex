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
        0xbcFEeaEA01b9DDd2F8A1092676681c6B52DBE81C;
    address public constant ESCROW = 0x6b37b0FC861B0Fa22242eC92C25F2643876E4fbf;

    // Generated Agent WDK Wallet Address
    address public constant AGENT_ADDRESS =
        0x6681207e844f1f4A9083d7739D3afebF9c5BF951;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ReflexLiquidityPool pool = ReflexLiquidityPool(LIQUIDITY_POOL);
        ReflexParametricEscrow escrow = ReflexParametricEscrow(ESCROW);

        console.log("Granting Agent roles...");
        console.log("Agent:", AGENT_ADDRESS);

        /*
        // Grant TREASURY_ROLE on LiquidityPool
        try pool.grantTreasuryRole(AGENT_ADDRESS, true) {
            console.log("Granted TREASURY_ROLE on Pool");
        } catch {
            console.log(
                "FAILED to grant TREASURY_ROLE on Pool (likely ownership mismatch)"
            );
        }
        */

        // Grant KEEPER_ROLE on Escrow
        try escrow.grantKeeperRole(AGENT_ADDRESS, true) {
            console.log("Granted KEEPER_ROLE on Escrow");
        } catch {
            console.log("FAILED to grant KEEPER_ROLE on Escrow");
        }

        vm.stopBroadcast();
    }
}
