// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexParametricEscrow.sol";

contract ConfigureChainlink is Script {
    function run(address proxyAddress, uint64 subId) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Arbitrum Sepolia Testnet DON configuration
        address router = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;
        bytes32 donId = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000; // fun-arbitrum-sepolia-1
        uint32 gasLimit = 300000;

        string memory sourceCode = vm.readFile("script/functions-source.js");

        vm.startBroadcast(deployerPrivateKey);

        ReflexParametricEscrow escrow = ReflexParametricEscrow(proxyAddress);
        escrow.setFunctionsConfig(router, donId, subId, gasLimit, sourceCode);

        console.log(
            "Chainlink configuration updated for Escrow:",
            proxyAddress
        );
        console.log("Subscription ID:", subId);

        vm.stopBroadcast();
    }
}
