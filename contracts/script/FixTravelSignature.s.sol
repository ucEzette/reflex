// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ReflexLiquidityPool} from "../src/ReflexLiquidityPool.sol";
import {ProductFactory} from "../src/ProductFactory.sol";
import {TravelSolutions} from "../src/products/TravelSolutions.sol";

contract FixTravelSignature is Script {
    address public constant POOL_TRAVEL =
        0xd352d2D35d20791301c5A10Fd847849C5b8f453c;
    address public constant FACTORY =
        0x870268AAFE40B15F6bf14d42C435E6d2c7b660Fe;
    address public constant ESCROW_PROXY =
        0x6b37b0FC861B0Fa22242eC92C25F2643876E4fbf;

    function run() external {
        vm.startBroadcast();

        // 1. Redeploy TravelSolutions with the fix
        TravelSolutions newTravel = new TravelSolutions(POOL_TRAVEL);
        console2.log("New TravelSolutions Deployed:", address(newTravel));

        // 2. Set Consensus Manager (Escrow Proxy)
        newTravel.setConsensusManager(ESCROW_PROXY);
        console2.log("Consensus Manager set to Escrow Proxy");

        // 3. Authorize the new product in the Factory
        // The Factory is the owner of the Pool, but the Factory itself needs to handle the authorization.
        ProductFactory factory = ProductFactory(FACTORY);
        factory.authorizeProduct("Travel", address(newTravel));
        console2.log("New TravelSolutions Authorized in Factory");

        // 4. Set authorizedQuoter to address(0) on the Pool to enable the bypass
        // Note: The Factory owns the Pool. Does ProductFactory have a way to set quoter?
        // Let's check ProductFactory.sol.
        // If not, I may need to temporarily transfer ownership or have the factory call it.

        vm.stopBroadcast();
    }
}
