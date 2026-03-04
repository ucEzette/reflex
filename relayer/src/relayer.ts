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
            logger.warn({ policyId: policyIdShort, delay: flightData.delaySeconds }, "DELAY DETECTED - Submitting Consensus");

            // 1. Submit Relayer Consensus (M-of-N decentralized path)
            try {
                const consensusTx = await blockchain.submitRelayerConsensus(policy.policyId);
                logger.info({ policyId: policyIdShort, tx: consensusTx }, "Relayer consensus vote submitted");
            } catch (e) {
                logger.error({ policyId: policyIdShort, error: e }, "Failed to submit consensus vote");
            }

            // 2. Trigger Chainlink Oracle (Trustless Oracle fallback)
            const flightIata = policy.apiTarget.replace(/^flights\//, "").toUpperCase();
            const txHash = await blockchain.triggerChainlinkRequest(policy.policyId, flightIata, flightData.flightDate);
            logger.info({ policyId: policyIdShort, tx: txHash }, "Chainlink request submitted as backup");
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
import { WeatherService } from "./services/WeatherService";

async function monitorEnterprise(
    blockchain: BlockchainService,
    weatherService: WeatherService
) {
    console.log(`\n[Keeper] ─── Enterprise scan at ${new Date().toISOString()} ───`);
    try {
        const policies = await blockchain.getActiveEnterprisePolicies();
        console.log(`[Keeper] Found ${policies.length} active enterprise policies`);

        for (const policy of policies) {
            const policyIdShort = policy.policyId.slice(0, 18);

            // Handle Agriculture (Rainfall)
            if (policy.productName === 'Agriculture') {
                const rainfall = await weatherService.getRainfall(policy.identifier);
                if (rainfall !== null) {
                    logger.info({ policyId: policyIdShort, rainfall, zone: policy.identifier }, "Checking rainfall status");
                    // Example trigger: Any measured rainfall in 30 days (simplified for demo)
                    // In real world, we'd check against policy.strikeIndex
                    // For now, if rainfall > 0, we can trigger a claim processing
                    // (Assuming index calculation is handled on-chain and we just provides 'actualIndex')
                    // Actually, executeClaim takes 'actualIndex'.
                    await blockchain.executeEnterpriseClaim('Agriculture', policy.policyId, Math.floor(rainfall * 10));
                }
            }

            // Handle Energy (Temperature/Heatwave)
            if (policy.productName === 'Energy') {
                const [lat, lon] = policy.identifier.split(',');
                if (lat && lon) {
                    const temp = await weatherService.getTemperature(lat, lon);
                    if (temp !== null) {
                        logger.info({ policyId: policyIdShort, temp, location: policy.identifier }, "Checking temperature status");
                        // Trigger if temp > 35C (demo threshold)
                        await blockchain.executeEnterpriseClaim('Energy', policy.policyId, Math.floor(temp));
                    }
                }
            }
        }

        // Run Keeper upkeep for each product (auto-expire overdue policies)
        const products = ['Travel', 'Agriculture', 'Energy', 'Catastrophe', 'Maritime'];
        for (const product of products) {
            await blockchain.checkAndPerformUpkeep(product);
        }
    } catch (error: unknown) {
        console.error(`[Keeper] Enterprise monitor error:`, error instanceof Error ? error.message : "Unknown error");
    }
}

async function main() {
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║      Reflex — Enterprise Relayer v2.1       ║");
    console.log("║  Live Weather Oracles + Multi-Net Monitor   ║");
    console.log("╚══════════════════════════════════════════════╝");

    const config = loadConfig();

    const aviationStack = new AviationStackService(config.aviationStackApiKey);
    const weatherService = new WeatherService(config.noaaApiKey, config.openWeatherMapApiKey);

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

    // Ensure escrow authorization (backward compat)
    if (config.escrowAddress) {
        await blockchain.ensureAuthorized();
    }

    // Initial run
    if (config.escrowAddress) {
        await monitorEscrow(blockchain, aviationStack);
    }
    await monitorEnterprise(blockchain, weatherService);

    // Schedule periodic monitoring
    const pollCron = `*/${Math.max(1, Math.floor(config.pollIntervalSeconds / 60))} * * * *`;
    cron.schedule(pollCron, async () => {
        if (config.escrowAddress) {
            await monitorEscrow(blockchain, aviationStack);
        }
        await monitorEnterprise(blockchain, weatherService);
    });

    console.log(`\n[Relayer] Service active. Monitoring all products + Weather Oracles...`);
}

main().catch((error) => {
    console.error("[Relayer] Fatal startup error:", error);
    process.exit(1);
});
