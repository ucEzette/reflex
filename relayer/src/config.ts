import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV_VARS = [
    "PRIVATE_KEY",
    "RPC_URL",
    "ESCROW_CONTRACT_ADDRESS",
    "TELEPORTER_ADDRESS",
    "AVIATIONSTACK_API_KEY",
    "RECLAIM_APP_ID",
    "RECLAIM_APP_SECRET",
] as const;

export interface Config {
    privateKey: string;
    rpcUrl: string;
    escrowAddress: string;
    teleporterAddress: string;
    aviationStackApiKey: string;
    reclaimAppId: string;
    reclaimAppSecret: string;
    pollIntervalSeconds: number;
}

export function loadConfig(): Config {
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
