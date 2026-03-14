import { http, createConfig } from "wagmi";
import { avalancheFuji, avalanche, sepolia, arbitrumSepolia, baseSepolia } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

// 1. Strict Project ID Check
// WalletConnect v2 WILL fail silently or hang if this is undefined or empty.
// Get yours for free at https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId && typeof window !== 'undefined') {
    console.warn("WalletConnect Project ID is missing. The QR modal will fail to load. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local");
}

// 2. Application Metadata
// Required by WalletConnect v2 to establish trust with the scanning wallet.
const metadata = {
    name: 'Reflex L1',
    description: 'Enterprise-Grade Parametric Insurance Marketplace',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://reflex.network',
    icons: ['https://avatars.githubusercontent.com/u/37784886'] // Replace with your actual Reflex logo URL
};

export const config = createConfig({
    // Placing avalancheFuji at index 0 makes it the default target network
    chains: [avalancheFuji, avalanche, sepolia, arbitrumSepolia, baseSepolia],
    connectors: [
        injected(),
        walletConnect({
            projectId: projectId || '35674a0ceb0da8ded2da3e09b068f02e', // Use the one from .env.local as hardcoded fallback if env fails
            showQrModal: true,
            metadata: metadata,
            qrModalOptions: {
                themeMode: 'dark',
            },
        }),
        coinbaseWallet({
            appName: 'Reflex L1',
        }),
    ],
    transports: {
        [avalancheFuji.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://avalanche-fuji.drpc.org"),
        [avalanche.id]: http(),
        [sepolia.id]: http(),
        [arbitrumSepolia.id]: http(),
        [baseSepolia.id]: http(),
    },
    // Changed to true: Highly recommended for Next.js (App/Pages router) to prevent hydration mismatch errors
    ssr: true,
});

export { CONTRACTS } from "./contracts";

// Policy constants
export const POLICY_PREMIUM = BigInt(5_000_000); // $5 USDT (6 decimals)
export const POLICY_PAYOUT = BigInt(50_000_000); // $50 USDT (6 decimals)
export const POLICY_DURATION_HOURS = BigInt(24); // 24 hours coverage