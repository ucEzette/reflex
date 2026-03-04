"use client";

import { Transak } from "@transak/transak-sdk";
import { useAccount } from "wagmi";

export function FiatOnRamp() {
    const { address } = useAccount();

    const launchTransak = () => {
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
            // @ts-ignore
        } as any);

        transak.init();

        // Listen for close events
        // @ts-expect-error - event typing missing in SDK
        transak.on("TRANSAK_WIDGET_CLOSE", () => {
            transak.close();
        });

        // Listen for successful orders
        // @ts-expect-error - event typing missing in SDK
        transak.on("TRANSAK_ORDER_SUCCESSFUL", (orderData: Record<string, unknown>) => {
            console.log("Transak Order Successful:", orderData);
            transak.close();
        });
    };

    return (
        <div className="dexter-btn-container w-32 relative z-30">
            <button onClick={launchTransak} className="dexter-btn !min-w-[124px] !min-h-[36px] !px-3 !py-1.5" type="button">
                <span className="dexter-btn-drawer dexter-transition-top !text-[9px]">ON RAMP</span>
                <span className="dexter-btn-text flex items-center justify-center gap-1.5 !text-xs w-full"><span className="material-symbols-outlined text-[16px]">credit_card</span> Buy Crypto</span>
                <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[9px]">pay fiat, get crypto</span>
            </button>
        </div>
    );
}
