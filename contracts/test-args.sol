// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "src/ReflexParametricEscrow.sol";

contract GetArgs is Script {
    function run() external view {
        uint256 deployerPrivateKey = 0x6f7ff542e838c5f91b4e9d079598960c485669e1f2af51fec6c22e47c8a4ee6d;
        address initialOwner = vm.addr(deployerPrivateKey);

        address teleporter = 0xC7a297DE87890728453daa240A8373D7D5Cee90b;
        address usdc = 0x5425890298aed601595a70AB815c96711a31Bc65;
        bytes32 L1_CHAIN_ID = 0x535a96753066606a000000000000000000000000000000000000000000000000;
        address treasury = 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf;

        address implementation = 0xb8387C02a281F4613b4699a657f035d352fFcd9D;

        bytes memory initData = abi.encodeWithSelector(
            ReflexParametricEscrow.initialize.selector,
            teleporter,
            usdc,
            L1_CHAIN_ID,
            treasury,
            initialOwner
        );

        bytes memory constructorArgs = abi.encode(implementation, initData);
        console.logBytes(constructorArgs);
    }
}
