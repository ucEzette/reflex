import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV_VARS = [
    "PRIVATE_KEY",
    "RPC_URL",
    "ESCROW_CONTRACT_ADDRESS",
    "AVIATIONSTACK_API_KEY",
] as const;

export interface Config {
    privateKey: string;
    rpcUrl: string;
    escrowAddress: string;
    aviationStackApiKey: string;
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
        aviationStackApiKey: process.env.AVIATIONSTACK_API_KEY!,
        pollIntervalSeconds: parseInt(process.env.POLL_INTERVAL_SECONDS || "60", 10),
    };
}
