// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexLiquidityPool.sol";
import "../src/migration/ReflexLiquidityPoolMigration.sol";

contract MigrateAgentRole is Script {
    // Use bytes20 literals to bypass strict checksumming
    address public constant LP_PROXY =
        address(bytes20(hex"bcfeeaea01b9ddd2f8a1092676681c6b52dbe81c"));
    address public constant AGENT_ADDRESS =
        0x6681207e844f1f4A9083d7739D3afebF9c5BF951;
    address public constant ORIGINAL_IMPLEMENTATION =
        address(bytes20(hex"eb7e577ae1b7e92f1ace5619e2d1f1ba495409b4"));

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ReflexLiquidityPoolMigration migrationImpl = new ReflexLiquidityPoolMigration();
        ReflexLiquidityPool proxy = ReflexLiquidityPool(LP_PROXY);

        bytes memory migrationData = abi.encodeWithSelector(
            ReflexLiquidityPoolMigration.migrateAgentRole.selector,
            AGENT_ADDRESS,
            true
        );

        proxy.upgradeToAndCall(address(migrationImpl), migrationData);
        proxy.upgradeToAndCall(ORIGINAL_IMPLEMENTATION, "");

        vm.stopBroadcast();
    }
}
