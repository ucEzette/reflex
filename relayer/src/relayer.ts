import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import cron from "node-cron";

// ─── Configuration ───────────────────────────────────────────────────────────

const REQUIRED_ENV_VARS = [
    "PRIVATE_KEY",
    "RPC_URL",
    "ESCROW_CONTRACT_ADDRESS",
    "TELEPORTER_ADDRESS",
    "AVIATIONSTACK_API_KEY",
    "RECLAIM_APP_ID",
    "RECLAIM_APP_SECRET",
] as const;

function loadConfig() {
    for (const envVar of REQUIRED_ENV_VARS) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }

    return {
        privateKey: process.env.PRIVATE_KEY!,
        rpcUrl: process.env.RPC_URL!,
        escrowAddress: process.env.ESCROW_CONTRACT_ADDRESS!,
        teleporterAddress: process.env.TELEPORTER_ADDRESS!,
        aviationStackApiKey: process.env.AVIATIONSTACK_API_KEY!,
        reclaimAppId: process.env.RECLAIM_APP_ID!,
        reclaimAppSecret: process.env.RECLAIM_APP_SECRET!,
        pollIntervalSeconds: parseInt(process.env.POLL_INTERVAL_SECONDS || "60", 10),
    };
}

// ─── Contract ABI (subset used by relayer) ───────────────────────────────────

const ESCROW_ABI = [
    "function getUserPolicies(address _user) view returns (bytes32[])",
    "function getPolicy(bytes32 _policyId) view returns (address policyholder, string apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime, bool isActive, bool isClaimed)",
    "event PolicyPurchased(bytes32 indexed policyId, address indexed policyholder, string apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime)",
];

const TELEPORTER_ABI = [
    "function sendCrossChainMessage((bytes32 destinationBlockchainID, address destinationAddress, (address feeTokenAddress, uint256 amount) feeInfo, uint256 requiredGasLimit, address[] allowedRelayerAddresses, bytes message) messageInput) returns (bytes32)",
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface PolicyInfo {
    policyId: string;
    policyholder: string;
    apiTarget: string;
    premiumPaid: bigint;
    payoutAmount: bigint;
    expirationTime: bigint;
    isActive: boolean;
    isClaimed: boolean;
}

interface FlightData {
    flightId: string;
    scheduledArrival: string;
    actualArrival: string;
    delaySeconds: number;
    status: string;
}

// ─── Aviationstack API Client ─────────────────────────────────────────────────
/**
 * Aviationstack provides flight status via /flights endpoint.
 * Query params: access_key, flight_iata or flight_icao.
 */
async function queryAviationStack(
    apiTarget: string,
    apiKey: string
): Promise<FlightData | null> {
    // Basic plan often requires http instead of https, but will try https first.
    const baseUrl = "http://api.aviationstack.com/v1/flights";

    // Clean apiTarget (strip 'flights/' prefix if user included it for FlightAware compatibility)
    const flightCode = apiTarget.replace(/^flights\//, "").toUpperCase();

    const url = `${baseUrl}?access_key=${apiKey}&flight_iata=${flightCode}`;

    try {
        console.log(`[Aviationstack] Fetching status for: ${flightCode}`);
        const response = await fetch(url);

        if (!response.ok) {
            console.error(
                `[Aviationstack] API error: ${response.status} ${response.statusText}`
            );
            return null;
        }

        const data = await response.json() as any;

        // Parse Aviationstack response
        // Structure: { data: [ { flight_status: '...', arrival: { delay: 120, ... }, ... } ] }
        const flights = data.data;

        if (!flights || flights.length === 0) {
            console.warn(`[Aviationstack] No flight data found for: ${flightCode}`);
            return null;
        }

        const flight = flights[0]; // Take the most recent/relevant one

        const scheduledArrival = flight.arrival?.scheduled || "";
        const actualArrival = flight.arrival?.actual || "";
        const delayMinutes = flight.arrival?.delay || 0; // Aviationstack delay is often in minutes
        const delaySeconds = delayMinutes * 60;

        return {
            flightId: flight.flight?.iata || flightCode,
            scheduledArrival,
            actualArrival,
            delaySeconds,
            status: flight.flight_status || "unknown",
        };
    } catch (error) {
        console.error(`[Aviationstack] Request failed for ${flightCode}:`, error);
        return null;
    }
}

// ─── zkTLS Proof Generation ─────────────────────────────────────────────────

async function generateZkProof(
    apiTarget: string,
    flightData: FlightData,
    reclaimAppId: string,
    reclaimAppSecret: string
): Promise<Uint8Array> {
    /**
     * In production, this uses @reclaimprotocol/zk-fetch to:
     * 1. Make an HTTPS request to the FlightAware API through zkTLS
     * 2. Generate a zero-knowledge proof that the response contained delay > 7200s
     * 3. Return the serialized proof bytes
     *
     * Example production code:
     *
     * import { ReclaimClient } from "@reclaimprotocol/zk-fetch";
     * const client = new ReclaimClient(reclaimAppId, reclaimAppSecret);
     * const proof = await client.zkFetch(
     *   `https://aeroapi.flightaware.com/aeroapi/${apiTarget}`,
     *   { method: "GET", headers: { "x-apikey": apiKey } },
     *   { responseMatches: [{ type: "regex", value: `"arrival_delay":\\s*(\\d{4,})` }] }
     * );
     * return proof.serialize();
     */

    // Construct a proof-like payload for testnet
    // Structure: [32 bytes claim hash] + [65 bytes signature] + [variable provider data]
    const encoder = new TextEncoder();
    const providerData = encoder.encode(
        JSON.stringify({
            provider: "aviationstack-api",
            endpoint: apiTarget,
            delay: flightData.delaySeconds,
            timestamp: Math.floor(Date.now() / 1000),
            appId: reclaimAppId,
        })
    );

    // Generate claim hash from flight data
    const claimData = encoder.encode(
        `${apiTarget}:${flightData.delaySeconds}:${Date.now()}`
    );
    const claimHashArray = new Uint8Array(
        await crypto.subtle.digest("SHA-256", claimData)
    );

    // Create signing key and sign the claim
    const signingKey = new ethers.SigningKey(
        ethers.keccak256(encoder.encode(reclaimAppSecret))
    );
    const signature = signingKey.sign(ethers.hexlify(claimHashArray));
    const sigBytes = ethers.getBytes(
        ethers.concat([signature.r, signature.s, ethers.toBeHex(signature.v, 1)])
    );

    // Assemble proof: claimHash (32) + signature (65) + providerData (variable)
    const proof = new Uint8Array(32 + 65 + providerData.length);
    proof.set(claimHashArray, 0);
    proof.set(sigBytes, 32);
    proof.set(providerData, 97);

    console.log(
        `[zkTLS] Proof generated — claim hash: ${ethers.hexlify(claimHashArray).slice(0, 18)}..., size: ${proof.length} bytes`
    );

    return proof;
}

// ─── Policy Monitor ─────────────────────────────────────────────────────────

async function submitClaimViaTeleporter(
    policyId: string,
    proof: Uint8Array,
    config: ReturnType<typeof loadConfig>,
    provider: ethers.JsonRpcProvider,
    signer: ethers.Wallet
): Promise<string> {
    const teleporter = new ethers.Contract(
        config.teleporterAddress,
        TELEPORTER_ABI,
        signer
    );

    // Encode the payload: (bytes32 policyId, bytes zkProof)
    const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes"],
        [policyId, proof]
    );

    // Construct TeleporterMessageInput
    const chainIdBytes32 = ethers.zeroPadValue(ethers.toBeHex(43113), 32); // Fuji chain ID
    const messageInput = {
        destinationBlockchainID: chainIdBytes32,
        destinationAddress: config.escrowAddress,
        feeInfo: {
            feeTokenAddress: ethers.ZeroAddress,
            amount: 0n,
        },
        requiredGasLimit: 300_000n,
        allowedRelayerAddresses: [],
        message: payload,
    };

    console.log(`[Relayer] Submitting claim for policy ${policyId.slice(0, 18)}...`);

    const tx = await teleporter.sendCrossChainMessage(messageInput);
    const receipt = await tx.wait();

    console.log(`[Relayer] Claim submitted — TX: ${receipt.hash}`);
    return receipt.hash;
}

async function monitorPolicies(config: ReturnType<typeof loadConfig>) {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const signer = new ethers.Wallet(config.privateKey, provider);
    const escrow = new ethers.Contract(config.escrowAddress, ESCROW_ABI, provider);

    console.log(`[Relayer] Scanning policies from escrow: ${config.escrowAddress}`);

    // Listen for PolicyPurchased events to track active policies
    const filter = escrow.filters.PolicyPurchased();
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10_000); // Look back ~10k blocks

    let events;
    try {
        events = await escrow.queryFilter(filter, fromBlock, currentBlock);
    } catch (error) {
        console.error("[Relayer] Failed to query events:", error);
        return;
    }

    console.log(`[Relayer] Found ${events.length} PolicyPurchased events`);

    for (const event of events) {
        try {
            const log = event as ethers.EventLog;
            const policyId = log.args[0] as string;

            // Fetch policy details
            const policyData = await escrow.getPolicy(policyId);
            const policy: PolicyInfo = {
                policyId,
                policyholder: policyData[0],
                apiTarget: policyData[1],
                premiumPaid: policyData[2],
                payoutAmount: policyData[3],
                expirationTime: policyData[4],
                isActive: policyData[5],
                isClaimed: policyData[6],
            };

            // Skip inactive or claimed policies
            if (!policy.isActive || policy.isClaimed) {
                continue;
            }

            // Skip expired policies
            const now = BigInt(Math.floor(Date.now() / 1000));
            if (now > policy.expirationTime) {
                console.log(
                    `[Relayer] Policy ${policyId.slice(0, 18)}... expired, skipping`
                );
                continue;
            }

            console.log(
                `[Relayer] Checking flight: ${policy.apiTarget} for policy ${policyId.slice(0, 18)}...`
            );

            // Query Aviationstack API
            const flightData = await queryAviationStack(
                policy.apiTarget,
                config.aviationStackApiKey
            );

            if (!flightData) {
                console.log(
                    `[Relayer] No flight data available for ${policy.apiTarget}, will retry`
                );
                continue;
            }

            console.log(
                `[Relayer] Flight ${flightData.flightId}: delay=${flightData.delaySeconds}s, status=${flightData.status}`
            );

            // Check if delay exceeds 2 hours (7200 seconds)
            const DELAY_THRESHOLD = 7200;
            if (flightData.delaySeconds > DELAY_THRESHOLD) {
                console.log(
                    `[Relayer] ⚡ DELAY DETECTED! ${flightData.delaySeconds}s > ${DELAY_THRESHOLD}s — triggering claim`
                );

                // Generate zkTLS proof
                const proof = await generateZkProof(
                    policy.apiTarget,
                    flightData,
                    config.reclaimAppId,
                    config.reclaimAppSecret
                );

                // Submit claim via Teleporter
                await submitClaimViaTeleporter(
                    policyId,
                    proof,
                    config,
                    provider,
                    signer
                );
            } else {
                console.log(
                    `[Relayer] Flight delay ${flightData.delaySeconds}s below threshold ${DELAY_THRESHOLD}s — no action`
                );
            }
        } catch (error) {
            console.error(`[Relayer] Error processing event:`, error);
            continue;
        }
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║        Reflex L1 — zkTLS Flight Relayer     ║");
    console.log("║    Parametric Insurance Claims Processor     ║");
    console.log("╚══════════════════════════════════════════════╝");

    const config = loadConfig();
    const pollCron = `*/${Math.max(1, Math.floor(config.pollIntervalSeconds / 60))} * * * *`;

    console.log(`[Relayer] Wallet: ${new ethers.Wallet(config.privateKey).address}`);
    console.log(`[Relayer] Escrow: ${config.escrowAddress}`);
    console.log(`[Relayer] Poll interval: ${config.pollIntervalSeconds}s (cron: ${pollCron})`);
    console.log("[Relayer] Starting initial scan...\n");

    // Run immediately on start
    await monitorPolicies(config);

    // Schedule periodic monitoring
    cron.schedule(pollCron, async () => {
        console.log(`\n[Relayer] ─── Scheduled scan at ${new Date().toISOString()} ───`);
        await monitorPolicies(config);
    });

    console.log("\n[Relayer] Cron job started. Monitoring for flight delays...");
}

main().catch((error) => {
    console.error("[Relayer] Fatal error:", error);
    process.exit(1);
});
