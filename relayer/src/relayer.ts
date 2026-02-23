import cron from "node-cron";
import { loadConfig } from "./config";
import { AviationStackService } from "./services/AviationStackService";
import { BlockchainService } from "./services/BlockchainService";
import { ProofService } from "./services/ProofService";
import { PolicyInfo } from "./types";
import { ethers } from "ethers";
import { logger } from "./utils/logger";

async function processPolicy(
    policy: PolicyInfo,
    blockchain: BlockchainService,
    aviationStack: AviationStackService,
    proofs: ProofService
) {
    const policyIdShort = policy.policyId.slice(0, 18);

    try {
        // 1. Expiration check
        const now = BigInt(Math.floor(Date.now() / 1000));
        if (now > policy.expirationTime) {
            logger.info({ policyId: policyIdShort }, "Policy expired, skipping");
            return;
        }

        logger.info({ policyId: policyIdShort, flight: policy.apiTarget }, "Checking flight status");

        // 2. Query Flight Data
        const flightData = await aviationStack.queryFlightStatus(policy.apiTarget);
        if (!flightData) {
            logger.warn({ flight: policy.apiTarget }, "No flight data available, retrying next cycle");
            return;
        }

        logger.info({ flight: flightData.flightId, delay: flightData.delaySeconds, status: flightData.status }, "Flight status retrieved");

        // 3. Delay Threshold Check (2 hours = 7200s)
        const DELAY_THRESHOLD = 7200;
        if (flightData.delaySeconds > DELAY_THRESHOLD) {
            logger.warn({ policyId: policyIdShort, delay: flightData.delaySeconds }, "DELAY DETECTED - Triggering claim");

            // 4. Generate zkTLS Proof
            const proof = await proofs.generateZkProof(policy.apiTarget, flightData);
            logger.info({ policyId: policyIdShort, size: proof.length }, "zkTLS Proof generated");

            // 5. Submit Claim
            const txHash = await blockchain.submitClaim(policy.policyId, proof);
            logger.info({ policyId: policyIdShort, tx: txHash }, "Claim successful");
        } else {
            logger.info({ policyId: policyIdShort, delay: flightData.delaySeconds }, "Flight delay below threshold - no action");
        }
    } catch (error: any) {
        logger.error({ policyId: policyIdShort, error: error.message }, "Error processing policy");
    }
}

async function monitorCircle(
    blockchain: BlockchainService,
    aviationStack: AviationStackService,
    proofs: ProofService
) {
    console.log(`\n[Relayer] ─── Starting scan at ${new Date().toISOString()} ───`);

    try {
        const activePolicies = await blockchain.getActivePolicies();
        console.log(`[Relayer] Found ${activePolicies.length} active policies to monitor`);

        for (const policy of activePolicies) {
            await processPolicy(policy, blockchain, aviationStack, proofs);
        }
    } catch (error: any) {
        console.error(`[Relayer] Fatal error during monitor cycle:`, error.message);
    }
}

async function main() {
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║      Reflex L1 — Modular zkTLS Relayer      ║");
    console.log("║    Production-Ready Claims Architecture     ║");
    console.log("╚══════════════════════════════════════════════╝");

    const config = loadConfig();

    const aviationStack = new AviationStackService(config.aviationStackApiKey);
    const blockchain = new BlockchainService(
        config.rpcUrl,
        config.privateKey,
        config.escrowAddress,
        config.teleporterAddress
    );
    const proofs = new ProofService(config.reclaimAppId, config.reclaimAppSecret);

    console.log(`[Relayer] Operator Wallet: ${blockchain.getWalletAddress()}`);
    console.log(`[Relayer] Escrow Contract: ${config.escrowAddress}`);
    console.log(`[Relayer] Poll Interval: ${config.pollIntervalSeconds}s`);

    // Initial run
    await monitorCircle(blockchain, aviationStack, proofs);

    // Schedule periodic monitoring
    const pollCron = `*/${Math.max(1, Math.floor(config.pollIntervalSeconds / 60))} * * * *`;
    cron.schedule(pollCron, async () => {
        await monitorCircle(blockchain, aviationStack, proofs);
    });

    console.log(`\n[Relayer] Service active. Monitoring flight delays via AviationStack...`);
}

main().catch((error) => {
    console.error("[Relayer] Fatal startup error:", error);
    process.exit(1);
});
