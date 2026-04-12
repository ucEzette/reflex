// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ReflexLiquidityPool} from "../src/ReflexLiquidityPool.sol";
import {ProductFactory} from "../src/ProductFactory.sol";
import {ReflexParametricEscrow} from "../src/ReflexParametricEscrow.sol";
import {AgricultureIndex} from "../src/products/AgricultureIndex.sol";
import {MaritimeSolutions} from "../src/products/MaritimeSolutions.sol";
import {TravelSolutions} from "../src/products/TravelSolutions.sol";
import {CatastropheProximity} from "../src/products/CatastropheProximity.sol";
import {EnergySolutions} from "../src/products/EnergySolutions.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {MockTeleporterMessenger} from "../src/mocks/MockTeleporterMessenger.sol";

contract DeployArbitrumSepolia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("=== Arbitrum Sepolia Full Protocol Deployment ===");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mocks (USDT & Teleporter)
        MockUSDC usdt = new MockUSDC(); // We name it MockUSDC but it serves as USDT in the UI
        usdt.mint(deployer, 1_000_000 * 1e6); // Mint 1M USDT to deployer
        address usdtAddr = address(usdt);
        console2.log("USDT (Mock) Deployed:", usdtAddr);

        MockTeleporterMessenger teleporter = new MockTeleporterMessenger();
        address teleporterAddr = address(teleporter);

        // 2. Deploy Escrow
        ReflexParametricEscrow escrowImpl = new ReflexParametricEscrow();
        bytes memory escrowInit = abi.encodeWithSelector(
            ReflexParametricEscrow.initialize.selector,
            teleporterAddr,
            usdtAddr,
            bytes32(uint256(421614)), // Arbitrum Sepolia Chain ID
            deployer, // Protocol Treasury
            deployer, // Owner
            2 // Quorum
        );
        ERC1967Proxy escrowProxy = new ERC1967Proxy(address(escrowImpl), escrowInit);
        ReflexParametricEscrow escrow = ReflexParametricEscrow(address(escrowProxy));
        address escrowAddr = address(escrow);
        console2.log("Escrow Proxy Deployed:", escrowAddr);

        // 3. Deploy Liquidity Pool Implementation
        ReflexLiquidityPool poolImpl = new ReflexLiquidityPool();
        
        address lpTravel = _deployPool(address(poolImpl), usdtAddr, deployer);
        address lpAgri = _deployPool(address(poolImpl), usdtAddr, deployer);
        address lpEnergy = _deployPool(address(poolImpl), usdtAddr, deployer);
        address lpCat = _deployPool(address(poolImpl), usdtAddr, deployer);
        address lpMaritime = _deployPool(address(poolImpl), usdtAddr, deployer);

        console2.log("LP_TRAVEL Deployed:", lpTravel);
        console2.log("LP_AGRI Deployed:", lpAgri);
        console2.log("LP_ENERGY Deployed:", lpEnergy);
        console2.log("LP_CAT Deployed:", lpCat);
        console2.log("LP_MARITIME Deployed:", lpMaritime);

        // 4. Deploy Product Factory (using Travel pool as default for legacy compatibility if needed)
        ProductFactory factory = new ProductFactory(lpTravel);
        address factoryAddr = address(factory);
        console2.log("ProductFactory Deployed:", factoryAddr);

        // Transfer pool ownership to Factory
        ReflexLiquidityPool(lpTravel).transferOwnership(factoryAddr);
        ReflexLiquidityPool(lpAgri).transferOwnership(factoryAddr);
        ReflexLiquidityPool(lpEnergy).transferOwnership(factoryAddr);
        ReflexLiquidityPool(lpCat).transferOwnership(factoryAddr);
        ReflexLiquidityPool(lpMaritime).transferOwnership(factoryAddr);

        // 5. Deploy Products using their isolated pools
        TravelSolutions travel = new TravelSolutions(lpTravel);
        AgricultureIndex agri = new AgricultureIndex(lpAgri);
        EnergySolutions energy = new EnergySolutions(lpEnergy);
        CatastropheProximity cat = new CatastropheProximity(lpCat);
        MaritimeSolutions maritime = new MaritimeSolutions(lpMaritime);

        console2.log("TRAVEL Product Deployed:", address(travel));
        console2.log("AGRI Product Deployed:", address(agri));
        console2.log("ENERGY Product Deployed:", address(energy));
        console2.log("CATASTROPHE Product Deployed:", address(cat));
        console2.log("MARITIME Product Deployed:", address(maritime));

        // Authorize Products in Factory
        factory.authorizeProduct("Travel", address(travel));
        factory.authorizeProduct("Agriculture", address(agri));
        factory.authorizeProduct("Energy", address(energy));
        factory.authorizeProduct("Catastrophe", address(cat));
        factory.authorizeProduct("Maritime", address(maritime));

        // Link Escrow
        travel.setConsensusManager(escrowAddr);
        agri.setConsensusManager(escrowAddr);
        energy.setConsensusManager(escrowAddr);
        cat.setConsensusManager(escrowAddr);
        maritime.setConsensusManager(escrowAddr);

        // 6. Seed Liquidity
        usdt.approve(lpTravel, 10_000 * 1e6);
        ReflexLiquidityPool(lpTravel).depositLiquidity(10_000 * 1e6);

        usdt.approve(lpAgri, 10_000 * 1e6);
        ReflexLiquidityPool(lpAgri).depositLiquidity(10_000 * 1e6);
        
        vm.stopBroadcast();
        console2.log("=== Deployment Complete ===");
    }

    function _deployPool(address impl, address usdt, address deployer) internal returns (address) {
        bytes memory initData = abi.encodeWithSelector(
            ReflexLiquidityPool.initialize.selector,
            usdt,
            deployer, // treasury
            deployer // quoter/owner
        );
        ERC1967Proxy proxy = new ERC1967Proxy(impl, initData);
        return address(proxy);
    }
}
