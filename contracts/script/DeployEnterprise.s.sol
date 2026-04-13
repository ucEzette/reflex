// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexLiquidityPool.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/ProductFactory.sol";
import "../src/products/TravelSolutions.sol";
import "../src/products/AgricultureIndex.sol";
import "../src/products/EnergySolutions.sol";
import "../src/products/CatastropheProximity.sol";
import "../src/products/MaritimeSolutions.sol";

contract DeployEnterprise is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Fuji Testnet Addresses
        address usdc = vm.envOr(
            "USDC_ADDRESS",
            address(0x5425890298aed601595a70AB815c96711a31Bc65)
        );
        // Set mocks to 0x0 to avoid precompile collision (ecrecover/sha256)
        address mockAavePool = address(0);
        address mockAUsdc = address(0);

        // Treasury
        address protocolTreasury = vm.envOr(
            "PROTOCOL_TREASURY",
            vm.addr(deployerPrivateKey)
        );

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the Core Liquidity Engine
        ReflexLiquidityPool implementation = new ReflexLiquidityPool();
        console.log("Implementation deployed at:", address(implementation));

        // Encode the initialization call
        bytes memory initData = abi.encodeWithSelector(
            ReflexLiquidityPool.initialize.selector,
            usdc,
            protocolTreasury,
            mockAavePool,
            mockAUsdc,
            vm.addr(deployerPrivateKey)
        );

        // Deploy the Proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        ReflexLiquidityPool pool = ReflexLiquidityPool(address(proxy));
        console.log("ReflexLiquidityPool Proxy deployed at:", address(pool));

        // 2. Deploy Product Factory
        ProductFactory factory = new ProductFactory(address(pool));
        console.log("ProductFactory deployed at:", address(factory));

        // Let the deployer administer the pool for now to authorize the factory
        // Transfer ownership of Pool to Factory or configure it to allow Factory to auth
        // Actually, the Factory calls pool.setAuthorizedProduct, so Factory must be Owner of Pool.
        pool.transferOwnership(address(factory));

        // 3. Deploy the 5 Institutional Products
        TravelSolutions travel = new TravelSolutions(address(pool));
        console.log("TravelSolutions deployed at:", address(travel));

        AgricultureIndex agric = new AgricultureIndex(address(pool));
        console.log("AgricultureIndex deployed at:", address(agric));

        EnergySolutions energy = new EnergySolutions(address(pool));
        console.log("EnergySolutions deployed at:", address(energy));

        CatastropheProximity cat = new CatastropheProximity(address(pool));
        console.log("CatastropheProximity deployed at:", address(cat));

        MaritimeSolutions maritime = new MaritimeSolutions(address(pool));
        console.log("MaritimeSolutions deployed at:", address(maritime));

        // 4. Authorize products via Factory
        factory.authorizeProduct("Travel", address(travel));
        factory.authorizeProduct("Agriculture", address(agric));
        factory.authorizeProduct("Energy", address(energy));
        factory.authorizeProduct("Catastrophe", address(cat));
        factory.authorizeProduct("Maritime", address(maritime));

        vm.stopBroadcast();
    }
}
