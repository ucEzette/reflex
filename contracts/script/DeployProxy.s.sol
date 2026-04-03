// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexParametricEscrow.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployProxy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address initialOwner = vm.addr(deployerPrivateKey);

        // Arbitrum Sepolia Testnet Addresses (update after deployment)
        address teleporter = address(0); // No teleporter on Arbitrum — use CCIP or native messaging
        address usdc = address(0); // Deploy or use Arbitrum Sepolia USDT/USDC
        bytes32 L1_CHAIN_ID = bytes32(uint256(421614)); // Arbitrum Sepolia
        address treasury = 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf; // Placeholder, update as needed

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Implementation
        ReflexParametricEscrow implementation = new ReflexParametricEscrow();

        // 2. Prepare Initialization Data
        bytes memory initData = abi.encodeWithSelector(
            ReflexParametricEscrow.initialize.selector,
            teleporter,
            usdc,
            L1_CHAIN_ID,
            treasury,
            initialOwner
        );

        // 3. Deploy Proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        vm.stopBroadcast();

        console.log("Implementation deployed at:", address(implementation));
        console.log("Proxy deployed at (use this address):", address(proxy));
    }
}
