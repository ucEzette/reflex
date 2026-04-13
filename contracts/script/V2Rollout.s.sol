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
 * @title V2Rollout
 * @notice Fresh rollout of the Reflex Infrastructure on Fuji.
 *         Fixes deadlocked ownership and enables AI Agent autonomy.
 */
contract V2Rollout is Script {
    // Upgraded Escrow Proxy (already owns KEEPER logic)
    address public constant ESCROW_PROXY =
        0x6b37b0FC861B0Fa22242eC92C25F2643876E4fbf;

    // AI Agent Address
    address public constant AGENT_ADDRESS =
        0x2fb454025BF4790050f6B49B48e7510037c6aEA3;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address usdcAddress = 0x5425890298aed601595a70AB815c96711a31Bc65;
        address aavePool = address(0); // Mock
        address aUsdcAddress = address(0x4); // Mock
        address protocolTreasury = deployer;
        address quoterAddress = deployer;

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Core Liquidity Pool V2 (with TREASURY_ROLE support)
        ReflexLiquidityPool poolImpl = new ReflexLiquidityPool();

        bytes memory poolInitData = abi.encodeWithSelector(
            ReflexLiquidityPool.initialize.selector,
            usdcAddress,
            protocolTreasury,
            aavePool,
            aUsdcAddress,
            quoterAddress
        );

        ERC1967Proxy poolProxy = new ERC1967Proxy(
            address(poolImpl),
            poolInitData
        );
        ReflexLiquidityPool pool = ReflexLiquidityPool(address(poolProxy));
        console2.log("V2 LiquidityPool Proxy Deployed:", address(pool));

        // 2. Deploy Product Factory V2
        ProductFactory factory = new ProductFactory(address(pool));
        console2.log("V2 ProductFactory Deployed:", address(factory));

        // Grant Agent TREASURY_ROLE on new Pool
        pool.grantTreasuryRole(AGENT_ADDRESS, true);
        console2.log("Granted TREASURY_ROLE to Agent on Pool V2");

        // Transfer pool ownership to factory (standard institutional pattern)
        pool.transferOwnership(address(factory));
        console2.log("Transferred Pool Ownership to Factory V2");

        // 3. Deploy Parametric Products V2
        AgricultureIndex agProduct = new AgricultureIndex(address(pool));
        MaritimeSolutions maritimeProduct = new MaritimeSolutions(
            address(pool)
        );
        TravelSolutions travelProduct = new TravelSolutions(address(pool));
        CatastropheProximity catProduct = new CatastropheProximity(
            address(pool)
        );
        EnergySolutions energyProduct = new EnergySolutions(address(pool));

        console2.log("V2 AgricultureIndex Deployed:", address(agProduct));
        console2.log("V2 TravelSolutions Deployed:", address(travelProduct));

        // 4. Authorize Products via Factory V2
        factory.authorizeProduct("Agriculture", address(agProduct));
        factory.authorizeProduct("Maritime", address(maritimeProduct));
        factory.authorizeProduct("Travel", address(travelProduct));
        factory.authorizeProduct("Catastrophe", address(catProduct));
        factory.authorizeProduct("Energy", address(energyProduct));
        console2.log("V2 Products Authorized in LP V2.");

        // 5. Link Upgraded Escrow Proxy to V2 Products
        agProduct.setConsensusManager(ESCROW_PROXY);
        maritimeProduct.setConsensusManager(ESCROW_PROXY);
        travelProduct.setConsensusManager(ESCROW_PROXY);
        catProduct.setConsensusManager(ESCROW_PROXY);
        energyProduct.setConsensusManager(ESCROW_PROXY);
        console2.log("Linked V2 Products to Upgraded Escrow Proxy.");

        vm.stopBroadcast();

        console2.log("\n--- V2 Rollout Summary ---");
        console2.log("New Pool:", address(pool));
        console2.log("New Factory:", address(factory));
        console2.log("Agent:", AGENT_ADDRESS);
        console2.log("Agent Roles: KEEPER (Escrow), TREASURY (Pool)");
    }
}
