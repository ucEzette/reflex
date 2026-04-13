import { http } from "viem";
import { createConfig } from "@privy-io/wagmi";
import { arbitrumSepolia } from "wagmi/chains";

export const config = createConfig({
    chains: [arbitrumSepolia],
    transports: {
        [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc"),
    },
    ssr: true,
});

export { CONTRACTS } from "./contracts";

// Policy constants
export const POLICY_PREMIUM = BigInt(5_000_000); // $5 USDT (6 decimals)
export const POLICY_PAYOUT = BigInt(50_000_000); // $50 USDT (6 decimals)
export const POLICY_DURATION_HOURS = BigInt(24); // 24 hours coverage