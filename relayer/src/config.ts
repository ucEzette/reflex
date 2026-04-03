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
    pauseOracle: boolean;
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
        travelContract: process.env.TRAVEL_CONTRACT || "0xCa3CC41A72239af01Fd46aE7A85d2702DfdE6B48",
        agriContract: process.env.AGRI_CONTRACT || "0x34dEF6aE580a5E164580b5313FdacD9fd32dfD8b",
        energyContract: process.env.ENERGY_CONTRACT || "0x1A0215f56D29aA7bc6288FD0f7f7A9E4406E2fE9",
        catContract: process.env.CAT_CONTRACT || "0x3e81AedCCC26d9bD1aC393fCeA5Fe54f563BC25b",
        maritimeContract: process.env.MARITIME_CONTRACT || "0x8f0056cAA8299c8C349DF7B9B24E05Cd92d76B1B",
        liquidityPool: process.env.LIQUIDITY_POOL_ADDRESS || "",
        // Market API keys
        flightAwareApiKey: process.env.FLIGHTAWARE_API_KEY || "",
        noaaApiKey: process.env.AG_NOAA_API_KEY || "",
        openWeatherMapApiKey: process.env.ENERGY_WEATHER_API_KEY || "",
        stormglassApiKey: process.env.MARITIME_STORMGLASS_API_KEY || "",
        pollIntervalSeconds: parseInt(process.env.POLL_INTERVAL_SECONDS || "60", 10),
        pauseOracle: process.env.PAUSE_ORACLE === "true",
    };
}
