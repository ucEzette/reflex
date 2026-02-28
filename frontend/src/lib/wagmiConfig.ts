import { http, createConfig } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected, safe, walletConnect } from "wagmi/connectors";

export const config = createConfig({
    chains: [avalancheFuji],
    connectors: [
        injected(),
        walletConnect({
            projectId: '80aa3cb4fa682705b76174bb0eb6c6ec',
            showQrModal: true
        }),
        safe(),
    ],
    transports: {
        [avalancheFuji.id]: http("https://api.avax-test.network/ext/bc/C/rpc"),
    },
    ssr: false,
});

// Contract addresses — update after deployment
export const CONTRACTS = {
    ESCROW: (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ||
        "0x0000000000000000000000000000000000000000") as `0x${string}`,
    USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS ||
        "0x0000000000000000000000000000000000000000") as `0x${string}`,
} as const;

// Policy constants
export const POLICY_PREMIUM = BigInt(5_000_000); // $5 USDC (6 decimals)
export const POLICY_PAYOUT = BigInt(50_000_000); // $50 USDC (6 decimals)
export const POLICY_DURATION_HOURS = BigInt(24); // 24 hours coverage
