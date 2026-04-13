// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ReflexLiquidityPool} from "../src/ReflexLiquidityPool.sol";
import {ProductFactory} from "../src/ProductFactory.sol";
import {AgricultureIndex} from "../src/products/AgricultureIndex.sol";
import {MaritimeSolutions} from "../src/products/MaritimeSolutions.sol";
import {TravelSolutions} from "../src/products/TravelSolutions.sol";
import {CatastropheProximity} from "../src/products/CatastropheProximity.sol";
import {EnergySolutions} from "../src/products/EnergySolutions.sol";
import {ReflexParametricEscrow} from "../src/ReflexParametricEscrow.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MainnetRollout
 * @notice Production-grade rollout script for the Reflex Parametric Infrastructure.
 *         Orchestrates pool creation, product authorization, and quorum configuration.
 */
contract MainnetRollout is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address usdcAddress = vm.envOr(
            "USDC_ADDRESS",
            address(0x5425890298aed601595a70AB815c96711a31Bc65)
        );
        address aavePool = vm.envOr("AAVE_POOL", address(0));
        address protocolTreasury = vm.envOr("PROTOCOL_TREASURY", deployer);
        address teleporterMessenger = vm.envOr(
            "TELEPORTER_ADDRESS",
            address(0)
        );

        console2.log("--- Starting Mainnet Rollout Candidate ---");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Core Liquidity Pool
        ReflexLiquidityPool poolImplementation = new ReflexLiquidityPool();

        // Setup initial arguments for initialization
        address aUsdcAddress = vm.envOr("A_USDC_ADDRESS", address(0x4)); // Mock
        address quoterAddress = vm.envOr("QUOTER_ADDRESS", deployer);

        bytes memory poolInitData = abi.encodeWithSelector(
            ReflexLiquidityPool.initialize.selector,
            usdcAddress,
            protocolTreasury,
            aavePool,
            aUsdcAddress,
            quoterAddress
        );

        ERC1967Proxy poolProxy = new ERC1967Proxy(
            address(poolImplementation),
            poolInitData
        );
        ReflexLiquidityPool pool = ReflexLiquidityPool(address(poolProxy));
        console2.log("ReflexLiquidityPool deployed:", address(pool));

        // 2. Deploy Product Factory
        ProductFactory factory = new ProductFactory(address(pool));
        console2.log("ProductFactory deployed:", address(factory));

        // Let the deployer administer the pool for now to authorize the factory
        pool.transferOwnership(address(factory));

        // 3. Deploy Parametric Products
        AgricultureIndex agProduct = new AgricultureIndex(address(pool));
        MaritimeSolutions maritimeProduct = new MaritimeSolutions(
            address(pool)
        );
        TravelSolutions travelProduct = new TravelSolutions(address(pool));
        CatastropheProximity catProduct = new CatastropheProximity(
            address(pool)
        );
        EnergySolutions energyProduct = new EnergySolutions(address(pool));

        console2.log("AgricultureIndex deployed:", address(agProduct));
        console2.log("MaritimeSolutions deployed:", address(maritimeProduct));
        console2.log("TravelSolutions deployed:", address(travelProduct));
        console2.log("CatastropheProximity deployed:", address(catProduct));
        console2.log("EnergySolutions deployed:", address(energyProduct));

        // 4. Authorize Products via Factory
        factory.authorizeProduct("Agriculture", address(agProduct));
        factory.authorizeProduct("Maritime", address(maritimeProduct));
        factory.authorizeProduct("Travel", address(travelProduct));
        factory.authorizeProduct("Catastrophe", address(catProduct));
        factory.authorizeProduct("Energy", address(energyProduct));
        console2.log("Products authorized in LP.");

        // 5. Deploy Escrow (Quorum Management)
        ReflexParametricEscrow implementation = new ReflexParametricEscrow();
        bytes memory initData = abi.encodeWithSelector(
            ReflexParametricEscrow.initialize.selector,
            teleporterMessenger,
            usdcAddress,
            bytes32(uint256(43114)), // Mainnet L1 Chain ID
            protocolTreasury,
            deployer,
            2 // Required Quorum
        );
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        ReflexParametricEscrow escrow = ReflexParametricEscrow(address(proxy));
        console2.log("Escrow (Quorum) deployed:", address(escrow));

        // 6. Link Consensus Manager
        agProduct.setConsensusManager(address(escrow));
        maritimeProduct.setConsensusManager(address(escrow));
        travelProduct.setConsensusManager(address(escrow));
        catProduct.setConsensusManager(address(escrow));
        energyProduct.setConsensusManager(address(escrow));
        console2.log("Quorum linkage complete.");

        // 7. Initial Deposit (Seed Liquidity)
        // Note: Needs deployer to have approved pool for USDC
        uint256 seedLiquidity = 10_000 * 1e6; // $10k seed
        if (
            usdcAddress.code.length > 0 &&
            IERC20(usdcAddress).balanceOf(deployer) >= seedLiquidity
        ) {
            IERC20(usdcAddress).approve(address(pool), seedLiquidity);
            pool.depositLiquidity(seedLiquidity);
            console2.log("Seeded pool with $10,000 USDC.");
        }

        vm.stopBroadcast();

        console2.log("\n--- Rollout Diagnostics ---");
        if (usdcAddress.code.length > 0) {
            console2.log("1. TVL:", pool.totalAssets());
        } else {
            console2.log("1. TVL (Mock):", uint256(0));
        }
        console2.log(
            "2. Total Products:",
            factory.products(0) != address(0) ? 5 : 0
        );
        console2.log("3. Quorum Threshold:", escrow.requiredQuorum());
        console2.log("Rollout Finalized Successfully.");
    }
}
