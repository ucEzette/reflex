// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ReflexLiquidityPool} from "../src/ReflexLiquidityPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DiagnosePool is Script {
    address public constant LP_TRAVEL =
        0xbcFEeaEA01b9DDd2F8A1092676681c6B52DBE81C;
    address public constant USER = 0x467681376bf937691DacF6014c3D2a0abeE556E0;

    function run() external {
        ReflexLiquidityPool pool = ReflexLiquidityPool(LP_TRAVEL);
        IERC20 usdc = pool.usdc();

        console2.log("--- Simulation ---");

        vm.startPrank(USER);

        try pool.depositLiquidity(3000000) {
            console2.log(
                "SIMULATION SUCCESS: depositLiquidity(3000000) would succeed"
            );
        } catch Error(string memory reason) {
            console2.log("SIMULATION FAILED with reason:", reason);
        } catch (bytes memory lowLevelData) {
            console2.log("SIMULATION FAILED with low-level data:");
            console2.logBytes(lowLevelData);
        }

        vm.stopPrank();
    }
}
