import { http, createConfig } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected, safe } from "wagmi/connectors";

export const config = createConfig({
    chains: [avalancheFuji],
    connectors: [
        injected({ target: 'metaMask' }),
        injected({
            target() {
                return {
                    id: 'coreWallet',
                    name: 'Core Wallet',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    provider: typeof window !== 'undefined' ? (window as any).avalanche : undefined,
                }
            }
        }),
        safe(),
    ],
    transports: {
        [avalancheFuji.id]: http("https://api.avax-test.network/ext/bc/C/rpc"),
    },
    ssr: true,
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
