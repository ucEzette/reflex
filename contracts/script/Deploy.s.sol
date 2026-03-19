// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ReflexParametricEscrow} from "../src/ReflexParametricEscrow.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {MockTeleporterMessenger} from "../src/mocks/MockTeleporterMessenger.sol";

/**
 * @title DeployReflex
 * @notice Deployment script for the ReflexParametricEscrow system on Avalanche Fuji.
 *
 * Usage:
 *   # Deploy with mocks (testnet):
 *   forge script script/Deploy.s.sol:DeployReflex --rpc-url $FUJI_RPC_URL --broadcast --verify
 *
 *   # Deploy with real contracts (mainnet):
 *   Set TELEPORTER_ADDRESS and USDC_ADDRESS env vars before running.
 */
contract DeployReflex is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Configuration — override with env vars for production
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0));
        address treasury = vm.envOr("PROTOCOL_TREASURY", deployer);

        console2.log("=== Reflex L1 Deployment ===");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy mocks if addresses not provided
        if (usdcAddress == address(0)) {
            MockUSDC mockUsdc = new MockUSDC();
            usdcAddress = address(mockUsdc);
            console2.log("MockUSDC deployed:", usdcAddress);

            // Mint initial supply to deployer for testing
            mockUsdc.mint(deployer, 1_000_000 * 1e6); // 1M USDC
            console2.log("Minted 1,000,000 USDC to deployer");
        }



        // Deploy the escrow contract
        ReflexParametricEscrow implementation = new ReflexParametricEscrow();

        bytes memory initData = abi.encodeWithSelector(
            ReflexParametricEscrow.initialize.selector,
            usdcAddress,
            treasury,
            deployer, // Initial owner
            2 // Required Quorum
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        ReflexParametricEscrow escrow = ReflexParametricEscrow(address(proxy));

        console2.log("ReflexParametricEscrow deployed:", address(escrow));
        console2.log("Protocol Treasury:", treasury);


        vm.stopBroadcast();

        // Log summary
        console2.log("\n=== Deployment Summary ===");

        console2.log("USDC:", usdcAddress);
        console2.log("Escrow:", address(escrow));
    }
}
