// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MockUSDT} from "../src/mocks/MockUSDT.sol";
import {ReflexLiquidityPool} from "../src/ReflexLiquidityPool.sol";
import {ReflexParametricEscrow} from "../src/ReflexParametricEscrow.sol";

/**
 * @title DeployUSDTAndMigrate
 * @notice Deploys MockUSDT, upgrades implementations to include setUsdcToken,
 *         and updates the token address in all proxies.
 *
 * Usage:
 *   forge script script/DeployUSDTAndMigrate.s.sol:DeployUSDTAndMigrate --rpc-url $FUJI_RPC_URL --broadcast --verify
 */
contract DeployUSDTAndMigrate is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Define addresses as strings to avoid Solc checksum literal errors
        address ESCROW_PROXY = vm.parseAddress("0xd8218d83e4fe4927aff7bcd0bed316a3c39be7b4");
        
        address[] memory poolProxies = new address[](5);
        poolProxies[0] = vm.parseAddress("0xbcfeeaea01b9ddd2f8a1092676681c6b52dbe81c"); // Travel
        poolProxies[1] = vm.parseAddress("0xcb4c97087ed4c858281c39df44ae0997561ffe8c"); // Agri
        poolProxies[2] = vm.parseAddress("0xe8b7b01b2b4ec0f400f37f2d894e3654f05852f6"); // Energy
        poolProxies[3] = vm.parseAddress("0x9d803a3066c858d714c4f5ee286eaa6249d451ab"); // Cat
        poolProxies[4] = vm.parseAddress("0x6586035d5e39e30bf37445451b43eeaeeaa1405a"); // Maritime

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockUSDT
        MockUSDT usdt = new MockUSDT();
        address usdtAddress = address(usdt);
        console2.log("MockUSDT deployed at:", usdtAddress);

        // 2. Mint initial supply (10M USDT)
        usdt.mint(deployer, 10_000_000 * 1e6);
        console2.log("Minted 10M USDT to deployer");

        // 3. Upgrade ReflexParametricEscrow
        ReflexParametricEscrow newEscrowImpl = new ReflexParametricEscrow();
        ReflexParametricEscrow(ESCROW_PROXY).upgradeToAndCall(
            address(newEscrowImpl),
            ""
        );
        console2.log("Upgraded Escrow proxy to new implementation");

        // 4. Update Escrow to use USDT
        ReflexParametricEscrow(ESCROW_PROXY).setUsdcToken(usdtAddress);
        console2.log("Set USDT token in Escrow proxy");

        // 5. Upgrade and update Liquidity Pools
        ReflexLiquidityPool newPoolImpl = new ReflexLiquidityPool();
        console2.log("New Pool Implementation deployed at:", address(newPoolImpl));

        for (uint i = 0; i < poolProxies.length; i++) {
            address proxy = poolProxies[i];
            ReflexLiquidityPool(proxy).upgradeToAndCall(address(newPoolImpl), "");
            console2.log("Upgraded Pool proxy at:", proxy);

            ReflexLiquidityPool(proxy).setUsdcToken(usdtAddress);
            console2.log("Set USDT token in Pool proxy at:", proxy);
        }

        vm.stopBroadcast();

        console2.log("\n=== Migration Summary ===");
        console2.log("USDT Address:", usdtAddress);
        console2.log("Escrow Proxy:", ESCROW_PROXY);
        for (uint i = 0; i < poolProxies.length; i++) {
            console2.log("Pool Proxy:", poolProxies[i]);
        }
    }
}
