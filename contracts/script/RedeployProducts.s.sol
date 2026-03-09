// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {TravelSolutions} from "../src/products/TravelSolutions.sol";
import {AgricultureIndex} from "../src/products/AgricultureIndex.sol";
import {MaritimeSolutions} from "../src/products/MaritimeSolutions.sol";
import {CatastropheProximity} from "../src/products/CatastropheProximity.sol";
import {EnergySolutions} from "../src/products/EnergySolutions.sol";
import {ProductFactory} from "../src/ProductFactory.sol";
import {ReflexLiquidityPool} from "../src/ReflexLiquidityPool.sol";

contract RedeployProducts is Script {
    // Current Factory
    address public constant FACTORY =
        0x870268AAFE40B15F6bf14d42C435E6d2c7b660Fe;
    address public constant ESCROW = 0x6b37b0FC861B0Fa22242eC92C25F2643876E4fbf;

    // LP Pools
    address public constant LP_TRAVEL =
        0xbcFEeaEA01b9DDd2F8A1092676681c6B52DBE81C;
    address public constant LP_AGRI =
        0xCb4C97087ed4C858281C39Df44aE0997561FFe8C;
    address public constant LP_ENERGY =
        0xe8b7B01B2b4ec0f400f37F2D894e3654F05852F6;
    address public constant LP_CAT = 0x9d803A3066C858d714c4F5eE286eaa6249d451aB;
    address public constant LP_MARITIME =
        0x6586035D5e39e30bf37445451b43EEaEeAa1405a;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ProductFactory factory = ProductFactory(FACTORY);

        // 1. Redeploy
        TravelSolutions travel = new TravelSolutions(LP_TRAVEL);
        AgricultureIndex agri = new AgricultureIndex(LP_AGRI);
        MaritimeSolutions maritime = new MaritimeSolutions(LP_MARITIME);
        CatastropheProximity cat = new CatastropheProximity(LP_CAT);
        EnergySolutions energy = new EnergySolutions(LP_ENERGY);

        // 2. Authorize in Factory
        factory.authorizeProduct("Travel_V2", address(travel));
        factory.authorizeProduct("Agriculture_V2", address(agri));
        factory.authorizeProduct("Maritime_V2", address(maritime));
        factory.authorizeProduct("Catastrophe_V2", address(cat));
        factory.authorizeProduct("Energy_V2", address(energy));

        // 3. Link to Escrow
        travel.setConsensusManager(ESCROW);
        agri.setConsensusManager(ESCROW);
        maritime.setConsensusManager(ESCROW);
        cat.setConsensusManager(ESCROW);
        energy.setConsensusManager(ESCROW);

        vm.stopBroadcast();

        console2.log("Redeployed Products:");
        console2.log("Travel:", address(travel));
        console2.log("Agri:", address(agri));
        console2.log("Maritime:", address(maritime));
        console2.log("Catastrophe:", address(cat));
        console2.log("Energy:", address(energy));
    }
}
