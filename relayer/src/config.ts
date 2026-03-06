import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV_VARS = [
    "PRIVATE_KEY",
    "RPC_URL",
] as const;

export interface Config {
    privateKey: string;
    rpcUrl: string;
    // Legacy escrow (still supported)
    escrowAddress: string;
    aviationStackApiKey: string;
    // Enterprise product contracts
    travelContract: string;
    agriContract: string;
    energyContract: string;
    catContract: string;
    maritimeContract: string;
    liquidityPool: string;
    // Market API keys
    flightAwareApiKey: string;
    noaaApiKey: string;
    openWeatherMapApiKey: string;
    stormglassApiKey: string;
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
        escrowAddress: process.env.ESCROW_CONTRACT_ADDRESS || "",
        aviationStackApiKey: process.env.AVIATIONSTACK_API_KEY || "",
        // Enterprise contract addresses
        travelContract: process.env.TRAVEL_CONTRACT || "0x860f5d9e6A6F7C2A6dBe8c396CA5dc37f298f86b",
        agriContract: process.env.AGRI_CONTRACT || "0xA63CdC07ebC3B2deAF5faD45aabC35C2Dd86fF80",
        energyContract: process.env.ENERGY_CONTRACT || "0xc8392691CC8e09fBc34a17cbCfb607e6a9a6d663",
        catContract: process.env.CAT_CONTRACT || "0xaCbbeFe183Bff58FA57c99D0352d4cA1e720240A",
        maritimeContract: process.env.MARITIME_CONTRACT || "0xfC873105314170de85A043fc39F332e203DA7B1a",
        liquidityPool: process.env.LIQUIDITY_POOL_ADDRESS || "",
        // Market API keys
        flightAwareApiKey: process.env.FLIGHTAWARE_API_KEY || "",
        noaaApiKey: process.env.AG_NOAA_API_KEY || "",
        openWeatherMapApiKey: process.env.ENERGY_WEATHER_API_KEY || "",
        stormglassApiKey: process.env.MARITIME_STORMGLASS_API_KEY || "",
        pollIntervalSeconds: parseInt(process.env.POLL_INTERVAL_SECONDS || "60", 10),
    };
}
