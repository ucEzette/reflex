// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexLiquidityPool.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/ProductFactory.sol";
import "../src/products/TravelSolutions.sol";
import "../src/products/AgricultureIndex.sol";

contract DeployAllMultiPools is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address usdc = 0x5425890298aed601595a70AB815c96711a31Bc65; // Fuji USDC
        address protocolTreasury = deployer;

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Implementation once
        ReflexLiquidityPool implementation = new ReflexLiquidityPool();

        // 2. Deploy Sector Pool Proxies
        // Travel
        ERC1967Proxy travelProxy = new ERC1967Proxy(
            address(implementation),
            abi.encodeWithSelector(
                ReflexLiquidityPool.initialize.selector,
                usdc,
                protocolTreasury,
                address(0),
                address(0),
                deployer
            )
        );
        ReflexLiquidityPool travelPool = ReflexLiquidityPool(
            address(travelProxy)
        );

        // Agriculture
        ERC1967Proxy agriProxy = new ERC1967Proxy(
            address(implementation),
            abi.encodeWithSelector(
                ReflexLiquidityPool.initialize.selector,
                usdc,
                protocolTreasury,
                address(0),
                address(0),
                deployer
            )
        );
        ReflexLiquidityPool agriPool = ReflexLiquidityPool(address(agriProxy));

        // Energy
        ERC1967Proxy energyProxy = new ERC1967Proxy(
            address(implementation),
            abi.encodeWithSelector(
                ReflexLiquidityPool.initialize.selector,
                usdc,
                protocolTreasury,
                address(0),
                address(0),
                deployer
            )
        );
        ReflexLiquidityPool energyPool = ReflexLiquidityPool(
            address(energyProxy)
        );

        // Catastrophe
        ERC1967Proxy catProxy = new ERC1967Proxy(
            address(implementation),
            abi.encodeWithSelector(
                ReflexLiquidityPool.initialize.selector,
                usdc,
                protocolTreasury,
                address(0),
                address(0),
                deployer
            )
        );
        ReflexLiquidityPool catPool = ReflexLiquidityPool(address(catProxy));

        // Maritime
        ERC1967Proxy maritimeProxy = new ERC1967Proxy(
            address(implementation),
            abi.encodeWithSelector(
                ReflexLiquidityPool.initialize.selector,
                usdc,
                protocolTreasury,
                address(0),
                address(0),
                deployer
            )
        );
        ReflexLiquidityPool maritimePool = ReflexLiquidityPool(
            address(maritimeProxy)
        );

        console.log("Travel Pool:", address(travelPool));
        console.log("Agriculture Pool:", address(agriPool));
        console.log("Energy Pool:", address(energyPool));
        console.log("Catastrophe Pool:", address(catPool));
        console.log("Maritime Pool:", address(maritimePool));

        vm.stopBroadcast();
    }
}
