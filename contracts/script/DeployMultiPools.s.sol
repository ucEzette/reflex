// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexLiquidityPool.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/ProductFactory.sol";
import "../src/products/TravelSolutions.sol";
import "../src/products/AgricultureIndex.sol";

contract DeployMultiPools is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address usdc = 0x5425890298aed601595a70AB815c96711a31Bc65; // Fuji USDC
        address protocolTreasury = deployer;

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Implementation once
        ReflexLiquidityPool implementation = new ReflexLiquidityPool();

        // 2. Deploy Travel Pool Proxy
        bytes memory initTravel = abi.encodeWithSelector(
            ReflexLiquidityPool.initialize.selector,
            usdc,
            protocolTreasury,
            address(0),
            address(0),
            deployer
        );
        ERC1967Proxy travelProxy = new ERC1967Proxy(
            address(implementation),
            initTravel
        );
        ReflexLiquidityPool travelPool = ReflexLiquidityPool(
            address(travelProxy)
        );

        // 3. Deploy Agriculture Pool Proxy
        bytes memory initAgri = abi.encodeWithSelector(
            ReflexLiquidityPool.initialize.selector,
            usdc,
            protocolTreasury,
            address(0),
            address(0),
            deployer
        );
        ERC1967Proxy agriProxy = new ERC1967Proxy(
            address(implementation),
            initAgri
        );
        ReflexLiquidityPool agriPool = ReflexLiquidityPool(address(agriProxy));

        // 4. Deploy Products pointing to their respective pools
        TravelSolutions travelProd = new TravelSolutions(address(travelPool));
        AgricultureIndex agriProd = new AgricultureIndex(address(agriPool));

        // 5. Authorize Products in their specific pools
        travelPool.setAuthorizedProduct(address(travelProd), true);
        agriPool.setAuthorizedProduct(address(agriProd), true);

        console.log("Travel Pool:", address(travelPool));
        console.log("Travel Product:", address(travelProd));
        console.log("Agriculture Pool:", address(agriPool));
        console.log("Agriculture Product:", address(agriProd));

        vm.stopBroadcast();
    }
}
