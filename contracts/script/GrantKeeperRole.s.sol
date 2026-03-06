// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReflexParametricEscrow.sol";

/**
 * @title GrantKeeperRole
 * @notice Foundry script to grant KEEPER_ROLE to the Agent on the upgraded Escrow.
 */
contract GrantKeeperRole is Script {
    address public constant ESCROW_PROXY =
        0x6b37b0FC861B0Fa22242eC92C25F2643876E4fbf;
    address public constant AGENT_ADDRESS =
        0x2fb454025BF4790050f6B49B48e7510037c6aEA3;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ReflexParametricEscrow escrow = ReflexParametricEscrow(ESCROW_PROXY);
        escrow.grantKeeperRole(AGENT_ADDRESS, true);
        console.log("Granted KEEPER_ROLE to:", AGENT_ADDRESS);

        vm.stopBroadcast();
    }
}
