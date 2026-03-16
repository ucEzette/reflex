"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ALL_MARKETS } from "@/lib/market-data";

export interface ReflexWidgetOptions {
    marketId: string;
    refreshInterval?: number;
    simulateRisk?: boolean;
}

/**
 * Core business logic for the Reflex Protection Widget.
 * Handles risk polling, premium calculation, and purchase state.
 */
export const useReflexWidget = ({ 
    marketId, 
    refreshInterval = 8000,
    simulateRisk = true 
}: ReflexWidgetOptions) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isProtected, setIsProtected] = useState(false);
    const [surgeData, setSurgeData] = useState<{multiplier: number, reason: string} | null>(null);

    const market = useMemo(() => 
        ALL_MARKETS.find(m => m.id === marketId) || ALL_MARKETS[0], 
    [marketId]);
    
    const basePremium = market.marketData.basePremium || 5;
    const currentMultiplier = surgeData?.multiplier || 1.0;
    const totalPremium = basePremium * currentMultiplier;

    // Risk Polling
    const checkRisk = useCallback(() => {
        if (!simulateRisk) return;
        
        // Simulating Dynamic Risk Engine
        const hasSurge = Math.random() > 0.8; 
        if (hasSurge) {
            setSurgeData({
                multiplier: 1.5 + Math.random() * 0.5,
                reason: "Network Congestion / Traffic Spike"
            });
        } else {
            setSurgeData(null);
        }
    }, [simulateRisk]);

    useEffect(() => {
        checkRisk();
        const interval = setInterval(checkRisk, refreshInterval);
        return () => clearInterval(interval);
    }, [checkRisk, refreshInterval]);

    const toggle = () => {
        if (isProtected) return;
        setIsEnabled(!isEnabled);
    };

    const purchase = async () => {
        setIsPurchasing(true);
        // Simulate blockchain interaction (Enterprise Abstraction)
        await new Promise(resolve => setTimeout(resolve, 1800));
        setIsPurchasing(false);
        setIsProtected(true);
        return true;
    };

    return {
        market,
        isEnabled,
        isPurchasing,
        isProtected,
        surgeData,
        totalPremium,
        toggle,
        purchase
    };
};
