// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexParametricEscrow.sol";

contract UpgradeProxy is Script {
    function run(address proxyAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy new implementation
        ReflexParametricEscrow newImpl = new ReflexParametricEscrow();

        // Upgrade proxy
        ReflexParametricEscrow(proxyAddress).upgradeToAndCall(
            address(newImpl),
            ""
        );

        console.log("Upgraded proxy at:", proxyAddress);
        console.log("New Implementation at:", address(newImpl));

        vm.stopBroadcast();
    }
}
