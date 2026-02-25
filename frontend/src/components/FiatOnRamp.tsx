"use client";

import { Transak } from "@transak/transak-sdk";
import { useAccount } from "wagmi";

export function FiatOnRamp() {
    const { address } = useAccount();

    const launchTransak = () => {
        // @ts-ignore - bypassing missing property types in SDK 4.0.2
        const transak = new Transak({
            apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "8f7ab2d6-419b-4322-a7d9-c0ae76478df9",
            environment: 'STAGING',
            widgetUrl: 'https://global-stg.transak.com', // Required in newer SDK versions
            referrer: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000', // Required
            defaultCryptoCurrency: 'USDC',
            cryptoCurrencyList: 'USDC,AVAX',
            networks: 'avalanche',
            defaultNetwork: 'avalanche',
            walletAddress: address || '',
            themeColor: '#e74043',
            widgetHeight: '650px',
            widgetWidth: '450px',
        } as any);

        transak.init();

        // Listen for close events
        // @ts-ignore
        transak.on("TRANSAK_WIDGET_CLOSE", () => {
            transak.close();
        });

        // Listen for successful orders
        // @ts-ignore
        transak.on("TRANSAK_ORDER_SUCCESSFUL", (orderData: any) => {
            console.log("Transak Order Successful:", orderData);
            transak.close();
        });
    };

    return (
        <button
            onClick={launchTransak}
            className="flex items-center gap-2 bg-surface-dark hover:bg-white/5 border border-neon-cyan/30 text-neon-cyan px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
            <span className="material-symbols-outlined text-[18px]">credit_card</span>
            Buy Crypto
        </button>
    );
}
