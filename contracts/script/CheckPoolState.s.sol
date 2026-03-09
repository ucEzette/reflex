// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ReflexLiquidityPool} from "../src/ReflexLiquidityPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CheckPoolState is Script {
    address public constant LP_TRAVEL =
        0xd352d2D35d20791301c5A10Fd847849C5b8f453c;
    address public constant TRAVEL_PRODUCT =
        0x4b48F124B81919D5134b3a912aDd93aFf930A832;

    function run() external view {
        ReflexLiquidityPool pool = ReflexLiquidityPool(LP_TRAVEL);

        uint256 assets = pool.totalAssets();
        uint256 maxPayouts = pool.totalMaxPayouts();
        bool isAuthorized = pool.authorizedProducts(TRAVEL_PRODUCT);

        IERC20 usdc = pool.usdc();
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));

        console2.log("--- Account State ---");
        console2.log("Deployer Address:", deployer);
        try usdc.balanceOf(deployer) returns (uint256 b) {
            console2.log("Deployer USDC Balance:", b);
        } catch {
            console2.log("Could not fetch deployer USDC balance");
        }

        console2.log("--- Pool State ---");
        console2.log("Pool Address:", LP_TRAVEL);
        console2.log("Total Assets (USDC):", assets);
        console2.log("Total Max Payouts:", maxPayouts);
        console2.log("Travel Product Authorized:", isAuthorized);
        console2.log("USDC Address:", address(usdc));
        console2.log("Pool USDC Balance:", usdc.balanceOf(LP_TRAVEL));
    }
}
