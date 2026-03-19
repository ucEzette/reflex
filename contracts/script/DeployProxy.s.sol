// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexParametricEscrow.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployProxy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address initialOwner = vm.addr(deployerPrivateKey);

        // Fuji Testnet Addresses
        address usdc = 0x5425890298aed601595a70AB815c96711a31Bc65;
        address treasury = 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf; // Placeholder, update as needed

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Implementation
        ReflexParametricEscrow implementation = new ReflexParametricEscrow();

        // 2. Prepare Initialization Data
        bytes memory initData = abi.encodeWithSelector(
            ReflexParametricEscrow.initialize.selector,
            usdc,
            treasury,
            initialOwner,
            2 // Quorum
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
