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

        address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // Base Mainnet USDC
        address aavePool = 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5; // Base Mainnet Aave V3 Pool
        address aUsdc = 0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB; // Base Mainnet aBaseUSDC
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
                aavePool,
                aUsdc,
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
                aavePool,
                aUsdc,
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
                aavePool,
                aUsdc,
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
                aavePool,
                aUsdc,
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
                aavePool,
                aUsdc,
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
