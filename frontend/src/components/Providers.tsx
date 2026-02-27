"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmiConfig";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { PrivyProvider } from "@privy-io/react-auth";
import { avalancheFuji } from "viem/chains";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5_000,
                        refetchInterval: 10_000,
                    },
                },
            })
    );

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <PrivyProvider
                appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm7m2ndj602p2as735xet8s1b"}
                config={{
                    loginMethods: ['email', 'wallet'],
                    appearance: {
                        theme: 'dark',
                        accentColor: '#676FFF',
                        logo: 'https://reflex-l1.vercel.app/logo.png',
                    },
                    embeddedWallets: {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore - handling version drift in Privy config
                        createOnLogin: 'all-users',
                    },
                    defaultChain: avalancheFuji,
                    supportedChains: [avalancheFuji],
                }}
            >
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                </WagmiProvider>
            </PrivyProvider>
        </ThemeProvider>
    );
}
