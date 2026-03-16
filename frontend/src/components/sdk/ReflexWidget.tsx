"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReflexWidget } from "@/hooks/useReflexWidget";
import { cn } from "@/lib/utils";

interface ReflexWidgetProps {
    marketId: string;
    onStatusChange?: (status: { enabled: boolean; protected: boolean; premium: number }) => void;
    // SDK Customization Props
    theme?: "dark" | "light" | "glass";
    accentColor?: string;
    brandName?: string;
    showBranding?: boolean;
    compact?: boolean;
}

/**
 * Enterprise SDK Component: ReflexWidget
 * A modular, themeable component for partners to embed protection toggles.
 */
export const ReflexWidget = ({
    marketId,
    onStatusChange,
    theme = "dark",
    accentColor = "#00f0ff", // Default Reflex Cyan
    brandName = "Reflex",
    showBranding = true,
    compact = false
}: ReflexWidgetProps) => {
    const {
        market,
        isEnabled,
        isPurchasing,
        isProtected,
        surgeData,
        totalPremium,
        toggle,
        purchase
    } = useReflexWidget({ marketId });

    // Sync status with parent
    React.useEffect(() => {
        if (onStatusChange) {
            onStatusChange({ enabled: isEnabled, protected: isProtected, premium: totalPremium });
        }
    }, [isEnabled, isProtected, totalPremium, onStatusChange]);

    const isGlass = theme === "glass";
    const isLight = theme === "light";

    const containerClasses = cn(
        "w-full overflow-hidden rounded-2xl border transition-all duration-500",
        isLight ? "bg-white border-zinc-200" : isGlass ? "bg-white/5 backdrop-blur-xl border-white/10" : "bg-black border-zinc-800",
        isEnabled && !isProtected && "ring-1",
    );

    const textPrimary = isLight ? "text-zinc-950" : "text-white";
    const textSecondary = isLight ? "text-zinc-500" : "text-zinc-400";

    return (
        <div className={containerClasses} style={{ borderColor: isEnabled && !isProtected ? accentColor : undefined }}>
            {/* Header / Brand */}
            {showBranding && (
                <div className={cn("flex items-center justify-between p-3 border-b", isLight ? "border-zinc-100 bg-zinc-50" : "border-white/5 bg-white/[0.02]")}>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                            <span className="material-symbols-outlined text-xs" style={{ color: accentColor }}>shield_with_heart</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: textSecondary }}>{brandName} Protection</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isProtected ? "bg-green-500 animate-pulse" : "bg-zinc-700")} />
                        <span className="text-[8px] font-bold uppercase" style={{ color: textSecondary }}>{isProtected ? 'Active' : 'Standby'}</span>
                    </div>
                </div>
            )}

            <div className={cn("p-4", compact ? "space-y-2" : "space-y-4")}>
                {/* Main Content */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className={cn("text-xs font-bold flex items-center gap-2", textPrimary)}>
                            {market.title} Coverage
                            {surgeData && (
                                <span className="bg-red-500/20 text-red-500 text-[8px] px-1.5 py-0.5 rounded font-black italic">SURGE</span>
                            )}
                        </h3>
                        {!compact && (
                            <p className="text-[10px] leading-relaxed font-medium" style={{ color: textSecondary }}>
                                Instant parametric settlement if {marketId === 'flight' ? 'delays' : 'disruptions'} exceed threshold.
                            </p>
                        )}
                    </div>

                    {/* Toggle */}
                    <button 
                        onClick={toggle}
                        disabled={isProtected}
                        className={cn(
                            "relative w-10 h-5 rounded-full transition-colors duration-300 flex items-center px-1 shrink-0",
                            isEnabled ? "" : (isLight ? "bg-zinc-200" : "bg-zinc-800"),
                            isProtected ? "opacity-50 cursor-default" : "cursor-pointer"
                        )}
                        style={{ backgroundColor: isEnabled ? accentColor : undefined }}
                    >
                        <motion.div 
                            layout
                            className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                            animate={{ x: isEnabled ? 20 : 0 }}
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
                            <div className="space-y-3 pt-1">
                                <div className={cn(
                                    "p-3 rounded-xl border transition-colors",
                                    surgeData ? "bg-red-500/5 border-red-500/10" : (isLight ? "bg-zinc-50 border-zinc-100" : "bg-white/5 border-white/5")
                                )}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: textSecondary }}>Premium</span>
                                        <span className={cn("text-xs font-black font-mono", surgeData ? "text-red-500" : textPrimary)}>
                                            {totalPremium.toFixed(2)} USDT
                                        </span>
                                    </div>
                                    {surgeData && (
                                        <div className="flex items-center gap-1.5 text-[8px] text-red-400 font-bold italic">
                                            <span className="material-symbols-outlined text-[10px]">warning</span>
                                            {surgeData.reason} ({surgeData.multiplier}x)
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={purchase}
                                    disabled={isPurchasing}
                                    className={cn(
                                        "w-full py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                                        isLight ? "bg-zinc-900 text-white" : "bg-white text-black"
                                    )}
                                >
                                    {isPurchasing ? (
                                        <>
                                            <div className={cn("w-3 h-3 border-2 rounded-full animate-spin", isLight ? "border-white/20 border-t-white" : "border-black/20 border-t-black")} />
                                            Initializing Vault...
                                        </>
                                    ) : (
                                        `Add ${brandName} Coverage`
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {isProtected && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-left"
                        >
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest">Protected</h4>
                                <p className="text-[9px] text-green-500/70 font-medium">Parametric claim vault active.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
