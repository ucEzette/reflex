"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmiConfig";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5000,
            refetchOnWindowFocus: false,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config} reconnectOnMount={false}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <SafeHydration>
                        {children}
                    </SafeHydration>
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
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
