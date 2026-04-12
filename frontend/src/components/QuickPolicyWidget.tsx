"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_MARKETS } from "@/lib/market-data";

interface QuickPolicyWidgetProps {
    marketId?: string;
    onToggle?: (enabled: boolean, totalPremium: number) => void;
    embedded?: boolean;
}

export const QuickPolicyWidget = ({ marketId = "flight", onToggle, embedded = false }: QuickPolicyWidgetProps) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isProtected, setIsProtected] = useState(false);
    const [surgeData, setSurgeData] = useState<{multiplier: number, reason: string} | null>(null);

    const market = useMemo(() => ALL_MARKETS.find(m => m.id === marketId) || ALL_MARKETS[0], [marketId]);
    
    const basePremium = market.marketData.basePremium || 5;
    const currentMultiplier = surgeData?.multiplier || 1.0;
    const totalPremium = basePremium * currentMultiplier;

    // Simulate real-time risk polling (Dynamic Risk Engine)
    useEffect(() => {
        const checkRisk = () => {
            // For demo: 30% chance of a surge event every interval
            const hasSurge = Math.random() > 0.7;
            if (hasSurge) {
                setSurgeData({
                    multiplier: 1.8,
                    reason: "Adverse Weather Forecast"
                });
            } else {
                setSurgeData(null);
            }
        };

        checkRisk();
        const interval = setInterval(checkRisk, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleToggle = () => {
        if (isProtected) return; // Can't toggle off once purchased in this simplified demo

        const nextState = !isEnabled;
        setIsEnabled(nextState);
        
        if (onToggle) {
            onToggle(nextState, totalPremium);
        }
    };

    const handlePurchase = async () => {
        setIsPurchasing(true);
        // Simulate blockchain settlement abstraction
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsPurchasing(false);
        setIsProtected(true);
    };

    return (
        <div className={`w-full max-w-md overflow-hidden rounded-2xl border transition-all duration-500 ${
            isEnabled 
            ? "bg-zinc-900 border-white/20 shadow-2xl shadow-primary/10" 
            : "bg-zinc-950/50 border-white/5 shadow-none"
        }`}>
            {/* Header / Brand */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-primary">shield_with_heart</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Reflex Protection</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isProtected ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{isProtected ? 'Active' : 'Standby'}</span>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Main Content */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            {market.title} Delay Coverage
                            {surgeData && (
                                <span className="bg-red-500/20 text-red-500 text-[8px] px-1.5 py-0.5 rounded font-black italic animate-pulse">SURGE</span>
                            )}
                        </h3>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                            Instant {market.price} settlement if your arrival is delayed by {marketId === 'flight' ? '120m+' : 'threshold'}. No claims required.
                        </p>
                    </div>

                    {/* Toggle */}
                    <button 
                        onClick={handleToggle}
                        disabled={isProtected}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 shrink-0 ${
                            isEnabled ? "bg-primary" : "bg-zinc-800"
                        } ${isProtected ? "opacity-50 cursor-default" : "cursor-pointer"}`}
                    >
                        <motion.div 
                            layout
                            className="w-4 h-4 bg-white rounded-full shadow-lg"
                            animate={{ x: isEnabled ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>

                {/* Sub-info / Surge Alert */}
                <AnimatePresence>
                    {isEnabled && !isProtected && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-3 pt-2">
                                <div className={`p-3 rounded-xl border transition-colors ${surgeData ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Protection Premium</span>
                                        <span className={`text-sm font-black font-mono italic ${surgeData ? 'text-red-500' : 'text-white'}`}>
                                            {totalPremium.toFixed(2)} USDT
                                        </span>
                                    </div>
                                    {surgeData && (
                                        <div className="flex items-center gap-2 text-[9px] text-red-400 font-bold italic">
                                            <span className="material-symbols-outlined text-[12px]">warning</span>
                                            {surgeData.reason} (Risk Multiplier: {surgeData.multiplier}x)
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={handlePurchase}
                                    disabled={isPurchasing}
                                    className="w-full py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isPurchasing ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            Encrypting & Minting...
                                        </>
                                    ) : (
                                        "Confirm & Add to Booking"
                                    )}
                                </button>
                                <p className="text-[9px] text-zinc-600 text-center font-medium">
                                    Encrypted settlement vault secured by Arbitrum Sepolia. One-tap zk-payment active.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {isProtected && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex flex-col items-center gap-2 text-center"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black">
                                <span className="material-symbols-outlined text-lg">check</span>
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-green-500 uppercase tracking-widest">Flight Protected</h4>
                                <p className="text-[10px] text-green-500/70 font-medium">Your parametric claim vault has been initialized.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
