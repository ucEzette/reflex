import cron from "node-cron";
import { loadConfig } from "./config";
import { AviationStackService } from "./services/AviationStackService";
import { BlockchainService } from "./services/BlockchainService";
import { PolicyInfo } from "./types";
import { logger } from "./utils/logger";

async function processPolicy(
    policy: PolicyInfo,
    blockchain: BlockchainService,
    aviationStack: AviationStackService
) {
    const policyIdShort = policy.policyId.slice(0, 18);

    try {
        const now = BigInt(Math.floor(Date.now() / 1000));
        if (now > policy.expirationTime) {
            logger.info({ policyId: policyIdShort }, "Policy expired, skipping");
            return;
        }

        logger.info({ policyId: policyIdShort, flight: policy.apiTarget }, "Checking flight status");

        const flightData = await aviationStack.queryFlightStatus(policy.apiTarget);
        if (!flightData) {
            logger.warn({ flight: policy.apiTarget }, "No flight data available, retrying next cycle");
            return;
        }

        logger.info({ flight: flightData.flightId, delay: flightData.delaySeconds, status: flightData.status }, "Flight status retrieved");

        const DELAY_THRESHOLD = 7200;
        if (flightData.delaySeconds > DELAY_THRESHOLD) {
            logger.warn({ policyId: policyIdShort, delay: flightData.delaySeconds }, "DELAY DETECTED - Triggering claim");
            const flightIata = policy.apiTarget.replace(/^flights\//, "").toUpperCase();
            const txHash = await blockchain.triggerChainlinkRequest(policy.policyId, flightIata, flightData.flightDate);
            logger.info({ policyId: policyIdShort, tx: txHash }, "Chainlink request submitted successfully");
        } else {
            logger.info({ policyId: policyIdShort, delay: flightData.delaySeconds }, "Flight delay below threshold - no action");
        }
    } catch (error: unknown) {
        logger.error({ policyId: policyIdShort, error: error instanceof Error ? error.message : "Unknown error" }, "Error processing policy");
    }
}

// ── Legacy Escrow Monitor ──
async function monitorEscrow(
    blockchain: BlockchainService,
    aviationStack: AviationStackService
) {
    console.log(`\n[Relayer] ─── Escrow scan at ${new Date().toISOString()} ───`);
    try {
        const activePolicies = await blockchain.getActivePolicies();
        console.log(`[Relayer] Found ${activePolicies.length} escrow policies`);
        for (const policy of activePolicies) {
            await processPolicy(policy, blockchain, aviationStack);
        }
    } catch (error: unknown) {
        console.error(`[Relayer] Escrow monitor error:`, error instanceof Error ? error.message : "Unknown error");
    }
}

// ── Enterprise Product Monitor ──
async function monitorEnterprise(blockchain: BlockchainService) {
    console.log(`\n[Keeper] ─── Enterprise scan at ${new Date().toISOString()} ───`);
    try {
        const policies = await blockchain.getActiveEnterprisePolicies();
        console.log(`[Keeper] Found ${policies.length} active enterprise policies across all products`);

        // Log per-product breakdown
        const byProduct = new Map<string, number>();
        for (const p of policies) {
            byProduct.set(p.productName, (byProduct.get(p.productName) || 0) + 1);
        }
        for (const [name, count] of byProduct) {
            console.log(`[Keeper]   └─ ${name}: ${count} policies`);
        }

        // Run Keeper upkeep for each product (auto-expire overdue policies)
        const products = ['Travel', 'Agriculture', 'Energy', 'Catastrophe', 'Maritime'];
        for (const product of products) {
            const expired = await blockchain.checkAndPerformUpkeep(product);
            if (expired) {
                console.log(`[Keeper] ✓ ${product}: Expired policies settled on-chain`);
            }
        }
    } catch (error: unknown) {
        console.error(`[Keeper] Enterprise monitor error:`, error instanceof Error ? error.message : "Unknown error");
    }
}

async function main() {
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║      Reflex — Enterprise Relayer v2.0       ║");
    console.log("║  Multi-Product Monitor + Chainlink Keepers  ║");
    console.log("╚══════════════════════════════════════════════╝");

    const config = loadConfig();

    const aviationStack = new AviationStackService(config.aviationStackApiKey);
    const blockchain = new BlockchainService(
        config.rpcUrl,
        config.privateKey,
        config.escrowAddress,
        {
            travel: config.travelContract,
            agri: config.agriContract,
            energy: config.energyContract,
            cat: config.catContract,
            maritime: config.maritimeContract,
        }
    );

    console.log(`[Relayer] Operator Wallet: ${blockchain.getWalletAddress()}`);
    console.log(`[Relayer] Poll Interval: ${config.pollIntervalSeconds}s`);
    console.log(`[Relayer] Enterprise Products: Travel, Agriculture, Energy, Catastrophe, Maritime`);

    // Ensure escrow authorization (backward compat)
    if (config.escrowAddress) {
        await blockchain.ensureAuthorized();
    }

    // Initial run
    if (config.escrowAddress) {
        await monitorEscrow(blockchain, aviationStack);
    }
    await monitorEnterprise(blockchain);

    // Schedule periodic monitoring
    const pollCron = `*/${Math.max(1, Math.floor(config.pollIntervalSeconds / 60))} * * * *`;
    cron.schedule(pollCron, async () => {
        if (config.escrowAddress) {
            await monitorEscrow(blockchain, aviationStack);
        }
        await monitorEnterprise(blockchain);
    });

    console.log(`\n[Relayer] Service active. Monitoring all products + Chainlink Keeper loop...`);
}

main().catch((error) => {
    console.error("[Relayer] Fatal startup error:", error);
    process.exit(1);
});
