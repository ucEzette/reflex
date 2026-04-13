"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
import { config } from "@/lib/wagmiConfig";
import { ThemeProvider } from "next-themes";
import { arbitrumSepolia } from "viem/chains";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
                appearance: {
                    theme: 'dark',
                    accentColor: '#D31027',
                    logo: 'https://reflex.network/logo.png',
                },
                embeddedWallets: {
                    createOnLogin: 'all-users',
                    requireUserPasswordOnCreate: false,
                },
                smartWallets: {
                    enabled: true,
                    createOnLogin: 'all-users',
                    paymasterConfig: {
                        policyId: process.env.NEXT_PUBLIC_PIMLICO_PAYMASTER_URL,
                    },
                },
                defaultChain: arbitrumSepolia,
                supportedChains: [arbitrumSepolia],
            }}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={config}>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                        <SafeHydration>
                            {children}
                        </SafeHydration>
                    </ThemeProvider>
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}

// Helper to handle hydration safely and trigger reconnection manually
function SafeHydration({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    
    React.useEffect(() => {
        setMounted(true);
        // Safely attempt reconnection on the client only
        const attemptReconnect = async () => {
            try {
                const { reconnect } = await import('wagmi/actions');
                await reconnect(config);
            } catch (err) {
                console.warn("Graceful reconnection failed:", err);
            }
        };
        attemptReconnect();
    }, []);

    if (!mounted) return null;
    return <>{children}</>;
}
