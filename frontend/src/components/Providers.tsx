"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmiConfig";
import { useState } from "react";
import { ThemeProvider } from "next-themes";

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
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </WagmiProvider>
        </ThemeProvider>
    );
}
