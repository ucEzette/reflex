import { http, createConfig } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
    chains: [avalancheFuji],
    connectors: [
        injected({
            target() {
                return {
                    id: 'coreWallet',
                    name: 'Core Wallet',
                    icon: 'https://cdn.worldvectorlogo.com/logos/avalanche-2.svg',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    provider: typeof window !== 'undefined' && (window as any).avalanche ? {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        request: (window as any).avalanche.request.bind((window as any).avalanche),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        on: (window as any).avalanche.on.bind((window as any).avalanche),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        removeListener: (window as any).avalanche.removeListener.bind((window as any).avalanche),
                        isAvalanche: true,
                    } : undefined,
                }
            }
        }),
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
            showQrModal: true
        })
    ],
    transports: {
        [avalancheFuji.id]: http("https://api.avax-test.network/ext/bc/C/rpc"),
    },
    ssr: false,
});

import { CONTRACTS } from "./contracts";

// Policy constants
export const POLICY_PREMIUM = BigInt(5_000_000); // $5 USDC (6 decimals)
export const POLICY_PAYOUT = BigInt(50_000_000); // $50 USDC (6 decimals)
export const POLICY_DURATION_HOURS = BigInt(24); // 24 hours coverage
