import { http, createConfig } from "wagmi";
import { avalancheFuji, avalanche, sepolia, arbitrumSepolia, baseSepolia } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
    chains: [avalancheFuji, avalanche, sepolia, arbitrumSepolia, baseSepolia],
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
        }),
        coinbaseWallet({
            appName: 'Reflex',
        }),
    ],
    transports: {
        [avalancheFuji.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc"),
        [avalanche.id]: http(),
        [sepolia.id]: http(),
        [arbitrumSepolia.id]: http(),
        [baseSepolia.id]: http(),
    },
    ssr: false,
});

export { CONTRACTS } from "./contracts";

// Policy constants
export const POLICY_PREMIUM = BigInt(5_000_000); // $5 USDC (6 decimals)
export const POLICY_PAYOUT = BigInt(50_000_000); // $50 USDC (6 decimals)
export const POLICY_DURATION_HOURS = BigInt(24); // 24 hours coverage
