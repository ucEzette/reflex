import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Script to grant necessary roles to the AI Agent's WDK Wallet.
 * This runs using the Admin Private Key (which deployed the contracts).
 */
async function main() {
    console.log("Starting WDK Wallet Whitelisting Process...");

    // The AI Agent's WDK Wallet address
    const agentAddress = "0x6681207e844f1f4A9083d7739D3afebF9c5BF951";

    const rpcUrl = process.env.RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("PRIVATE_KEY is missing from .env");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const adminSigner = new ethers.Wallet(privateKey, provider);

    console.log(`Admin Wallet: ${adminSigner.address}`);
    console.log(`Target Agent Wallet: ${agentAddress}`);

    // Roles (Standard OpenZeppelin keccak256 hashes of the role names)
    // You may need to adjust these if your contracts use custom role names
    const HARVESTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("HARVESTER_ROLE"));
    const UNDERWRITER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UNDERWRITER_ROLE"));

    // 1. Grant Treasury Role on the Liquidity Pool (using its custom access control)
    const poolAddress = process.env.LIQUIDITY_POOL_ADDRESS;
    if (poolAddress) {
        console.log(`\nGranting Treasury Role on Liquidity Pool (${poolAddress})...`);
        const poolContract = new ethers.Contract(
            poolAddress,
            ["function grantTreasuryRole(address _agent, bool _status) external"],
            adminSigner
        );
        
        try {
            const tx = await poolContract.grantTreasuryRole(agentAddress, true);
            console.log(`Transaction broadcasted. Hash: ${tx.hash}`);
            await tx.wait();
            console.log("✅ Treasury Role granted successfully.");
        } catch (error: any) {
            console.error("❌ Failed to grant Treasury Role:", error.message);
        }
    } else {
        console.log("\n⚠️ LIQUIDITY_POOL_ADDRESS not found in .env. Skipping Harvest whitelist.");
    }

    // 2. Grant UNDERWRITER_ROLE on all Enterprise Contracts
    const enterpriseContracts = [
        { name: "Travel", address: process.env.TRAVEL_CONTRACT_ADDRESS },
        { name: "Agriculture", address: process.env.AGRI_CONTRACT_ADDRESS },
        { name: "Energy", address: process.env.ENERGY_CONTRACT_ADDRESS },
        { name: "Maritime", address: process.env.MARITIME_CONTRACT_ADDRESS },
        { name: "Catastrophe", address: process.env.CAT_CONTRACT_ADDRESS },
    ];

    console.log("\nGranting UNDERWRITER_ROLE on Enterprise Contracts...");
    for (const contract of enterpriseContracts) {
        if (contract.address) {
            console.log(`-> ${contract.name} (${contract.address})`);
            const productContract = new ethers.Contract(
                contract.address,
                ["function grantRole(bytes32 role, address account) external"],
                adminSigner
            );

            try {
                const tx = await productContract.grantRole(UNDERWRITER_ROLE, agentAddress);
                await tx.wait();
                console.log(`   ✅ Success (${tx.hash})`);
            } catch (error: any) {
                console.error(`   ❌ Failed:`, error.message);
            }
        }
    }

    console.log("\n🎉 Whitelisting Process Complete!");
    console.log("The AI Agent's WDK Wallet is now fully authorized to execute on-chain transactions.");
}

main().catch((error) => {
    console.error("Fatal Error:", error);
    process.exit(1);
});
