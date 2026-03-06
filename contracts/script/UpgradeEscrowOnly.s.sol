// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexParametricEscrow.sol";

/**
 * @title UpgradeEscrowOnly
 * @notice Foundry script to upgrade the Escrow proxy (which we still own).
 */
contract UpgradeEscrowOnly is Script {
    address public constant ESCROW_PROXY =
        0x6b37b0FC861B0Fa22242eC92C25F2643876E4fbf;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Upgrade Escrow
        ReflexParametricEscrow newEscrowImpl = new ReflexParametricEscrow();
        ReflexParametricEscrow(ESCROW_PROXY).upgradeToAndCall(
            address(newEscrowImpl),
            ""
        );
        console.log(
            "Upgraded Escrow Implementation to:",
            address(newEscrowImpl)
        );

        vm.stopBroadcast();
    }
}
