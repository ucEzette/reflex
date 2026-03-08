// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexLiquidityPool.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract UpgradePools is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address[] memory pools = new address[](5);
        pools[0] = 0xd352d2D35d20791301c5A10Fd847849C5b8f453c; // Travel
        pools[1] = 0xCb4C97087ed4C858281C39Df44aE0997561FFe8C; // Agriculture
        pools[2] = 0xe8b7B01B2b4ec0f400f37F2D894e3654F05852F6; // Energy
        pools[3] = 0x9d803A3066C858d714c4F5eE286eaa6249d451aB; // Catastrophe
        pools[4] = 0x6586035D5e39e30bf37445451b43EEaEeAa1405a; // Maritime

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy new logic implementation
        ReflexLiquidityPool newImplementation = new ReflexLiquidityPool();
        console.log(
            "New Implementation deployed at:",
            address(newImplementation)
        );

        // 2. Upgrade all proxies
        for (uint i = 0; i < pools.length; i++) {
            ReflexLiquidityPool pool = ReflexLiquidityPool(pools[i]);
            pool.upgradeToAndCall(address(newImplementation), "");
            console.log("Upgraded Pool at:", pools[i]);
        }

        vm.stopBroadcast();
    }
}
