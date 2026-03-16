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
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-4 pb-20 sm:p-8">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Mock Browser/Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-zinc-400">arrow_back</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic">Checkout</h1>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Step 3 of 4: Finalize Order</p>
                        </div>
                    </div>
                    
                    {/* SDK Theme Selector (Demo Only) */}
                    <div className="flex bg-white/5 rounded-full p-1 border border-white/10 gap-1">
                        {(["dark", "light", "glass"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={cn(
                                    "px-3 py-1 text-[8px] font-black uppercase rounded-full transition-all",
                                    theme === t ? "bg-white text-black" : "text-zinc-500 hover:text-white"
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
                                selectedMarket === m.id ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/5 text-zinc-500"
                            )}
                        >
                            {m.title}
                        </button>
                    ))}
                </div>

                {/* Booking Info Card */}
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Description</span>
                            <div className="text-2xl font-black font-mono">
                                {selectedMarket === "flight" ? "LHR → JFK" : "SECURED ASSET"}
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reference</span>
                            <div className="text-sm font-bold font-mono">#{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                {/* THE SDK WIDGET */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Protection Layer</h2>
                        <span className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary rounded-full font-bold italic">Enterprise SDK</span>
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
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
                    <div className="flex justify-between text-sm text-zinc-400 font-medium">
                        <span>Base Amount</span>
                        <span className="font-mono">${baseFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400 font-medium">
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

                    <div className="h-[1px] bg-white/5 my-2" />

                    <div className="flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Due</span>
                        <div className="text-3xl font-black font-mono italic text-white flex flex-col items-end">
                            ${total.toFixed(2)}
                            <span className="text-[10px] font-bold text-zinc-600 uppercase not-italic">Settled via Smart Draft</span>
                        </div>
                    </div>
                </div>

                <button className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-full shadow-2xl shadow-white/10 hover:scale-[1.02] active:scale-95 transition-all">
                    Complete Order
                </button>

                <p className="text-[10px] text-center text-zinc-600 font-bold leading-loose uppercase tracking-widest">
                    Infrastructure by Reflex • Zero-Claims Parametric SDK v2.4
                </p>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
