// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ProductFactory.sol";
import "../src/products/TravelSolutions.sol";

contract DeployTravel is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address pool = 0xb60f052C279DB25A068DecF9e12D5b44673F0775;
        address factoryAddress = 0x27d6eFff0F9f48606641b8034772f0796a6e61e4;
        address escrowManager = 0x64Ab02E78655f0DfdA736200f28A96bA93c19942;

        vm.startBroadcast(deployerPrivateKey);

        TravelSolutions travel = new TravelSolutions(pool);
        console.log("TravelSolutions deployed at:", address(travel));

        // Authorize with factory
        ProductFactory(factoryAddress).authorizeProduct(
            "Travel-V2",
            address(travel)
        );

        // Link consensus manager
        travel.setConsensusManager(escrowManager);

        vm.stopBroadcast();
    }
}
