"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ReflexWidget } from "@/components/sdk/ReflexWidget";
import { ALL_MARKETS } from "@/lib/market-data";

export default function WidgetDemo() {
    const [protectionPremium, setProtectionPremium] = useState(0);
    const [protectionEnabled, setProtectionEnabled] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState("flight");
    const [theme, setTheme] = useState<"dark" | "light" | "glass">("dark");

    const baseFare = selectedMarket === "flight" ? 459.00 : 1250.00;
    const taxes = selectedMarket === "flight" ? 82.50 : 150.00;
    const total = baseFare + taxes + (protectionEnabled ? protectionPremium : 0);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-4 pt-20 pb-20 sm:p-8 sm:pt-24">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Mock Browser/Header */}
                <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#71717A]">arrow_back</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Checkout</h1>
                            <p className="text-xs text-[#71717A] uppercase tracking-widest font-bold">Step 3 of 4: Finalize Order</p>
                        </div>
                    </div>
                    
                    {/* SDK Theme Selector (Demo Only) */}
                    <div className="flex bg-black/[0.03] rounded-full p-1 border border-black/[0.06] gap-1">
                        {(["dark", "light", "glass"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={cn(
                                    "px-3 py-1 text-[8px] font-bold uppercase rounded-full transition-all",
                                    theme === t ? "bg-white text-black" : "text-[#71717A] hover:text-[#1A1A1A]"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Market Selection (Demo Only) */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {ALL_MARKETS.slice(0, 5).map(m => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMarket(m.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap border transition-all",
                                selectedMarket === m.id ? "bg-primary/20 border-primary text-primary" : "bg-black/[0.03] border-black/[0.04] text-[#71717A]"
                            )}
                        >
                            {m.title}
                        </button>
                    ))}
                </div>

                {/* Booking Info Card */}
                <div className="p-6 rounded-[2rem] glass-panel-premium space-y-6 transform-gpu hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-500">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Description</span>
                            <div className="text-2xl font-bold font-mono">
                                {selectedMarket === "flight" ? "LHR → JFK" : "SECURED ASSET"}
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">Reference</span>
                            <div className="text-sm font-bold font-mono">#{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                {/* THE SDK WIDGET */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#71717A]">Protection Layer</h2>
                        <span className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary rounded-full font-bold">Enterprise SDK</span>
                    </div>
                    
                    <ReflexWidget 
                        marketId={selectedMarket} 
                        theme={theme}
                        accentColor={selectedMarket === "agri" ? "#22c55e" : selectedMarket === "energy" ? "#f59e0b" : "#00f0ff"}
                        brandName={selectedMarket === "flight" ? "SkyShield" : "Reflex"}
                        onStatusChange={(status) => {
                            setProtectionEnabled(status.enabled);
                            setProtectionPremium(status.premium);
                        }}
                    />
                </div>

                {/* Price Breakdown */}
                <div className="p-6 rounded-[2rem] glass-panel-premium space-y-4">
                    <div className="flex justify-between text-sm text-[#71717A] font-medium">
                        <span>Base Amount</span>
                        <span className="font-mono">${baseFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#71717A] font-medium">
                        <span>Associated Levies</span>
                        <span className="font-mono">${taxes.toFixed(2)}</span>
                    </div>
                    
                    {protectionEnabled && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-between text-sm font-bold"
                            style={{ color: selectedMarket === "agri" ? "#22c55e" : selectedMarket === "energy" ? "#f59e0b" : "#00f0ff" }}
                        >
                            <span>Reflex Protection</span>
                            <span className="font-mono">${protectionPremium.toFixed(2)}</span>
                        </motion.div>
                    )}

                    <div className="h-[1px] bg-black/[0.03] my-2" />

                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#71717A]">Total Due</span>
                        <div className="text-3xl font-bold font-mono text-[#1A1A1A] flex flex-col items-end">
                            ${total.toFixed(2)}
                            <span className="text-[10px] font-bold text-[#B0AAA4] uppercaseitalic">Settled via Smart Draft</span>
                        </div>
                    </div>
                </div>

                <button className="w-full py-5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-full shadow-2xl shadow-white/10 hover:scale-[1.02] active:scale-95 transition-all">
                    Complete Order
                </button>

                <p className="text-[10px] text-center text-[#B0AAA4] font-bold leading-loose uppercase tracking-widest">
                    Infrastructure by Reflex • Zero-Claims Parametric SDK v2.4
                </p>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
