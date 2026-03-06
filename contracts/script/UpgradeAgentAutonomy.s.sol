// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexLiquidityPool.sol";
import "../src/ReflexParametricEscrow.sol";

/**
 * @title UpgradeAgentAutonomy
 * @notice Foundry script to upgrade Reflex proxies to support AI Agent roles.
 */
contract UpgradeAgentAutonomy is Script {
    address public constant POOL_PROXY =
        0x4e70e0c76499876d575650fE73A397570aaF17E5;
    address public constant ESCROW_PROXY =
        0x6b37b0FC861B0Fa22242eC92C25F2643876E4fbf;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Upgrade Liquidity Pool
        ReflexLiquidityPool newPoolImpl = new ReflexLiquidityPool();
        ReflexLiquidityPool(POOL_PROXY).upgradeToAndCall(
            address(newPoolImpl),
            ""
        );
        console.log("Upgraded Pool Implementation to:", address(newPoolImpl));

        // 2. Upgrade Escrow
        ReflexParametricEscrow newEscrowImpl = new ReflexParametricEscrow();
        ReflexParametricEscrow(ESCROW_PROXY).upgradeToAndCall(
            address(newEscrowImpl),
            ""
        );
        console.log(
            "Upgraded Escrow Implementation to:",
            address(newEscrowImpl)
        );

        vm.stopBroadcast();
    }
}
