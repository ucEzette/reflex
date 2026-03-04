import { http, createConfig } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
    chains: [avalancheFuji],
    connectors: [
        injected({
            target: {
                id: 'coreWallet',
                name: 'Core Wallet',
                provider: (window: any) => (window as any).avalanche
            }
        }),
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
            showQrModal: true
        })
    ],
    transports: {
        [avalancheFuji.id]: http(),
    },
    ssr: false,
});

export { CONTRACTS } from "./contracts";

// Policy constants
export const POLICY_PREMIUM = BigInt(5_000_000); // $5 USDC (6 decimals)
export const POLICY_PAYOUT = BigInt(50_000_000); // $50 USDC (6 decimals)
export const POLICY_DURATION_HOURS = BigInt(24); // 24 hours coverage
