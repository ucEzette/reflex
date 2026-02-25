"use client";

import { Transak } from "@transak/transak-sdk";
import { useAccount } from "wagmi";

export function FiatOnRamp() {
    const { address } = useAccount();

    const launchTransak = () => {
        const transak = new Transak({
            apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "8f7ab2d6-419b-4322-a7d9-c0ae76478df9", // Using a dummy/public staging key if env is missing
            environment: Transak.ENVIRONMENTS.STAGING, // STAGING/PRODUCTION
            defaultCryptoCurrency: 'USDC',
            cryptoCurrencyList: 'USDC,AVAX',
            networks: 'avalanche',
            defaultNetwork: 'avalanche',
            walletAddress: address || '',
            themeColor: '#e74043',
            widgetHeight: '650px',
            widgetWidth: '450px',
        });

        transak.init();

        // Listen for close events
        transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
            transak.close();
        });

        // Listen for successful orders
        transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
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
