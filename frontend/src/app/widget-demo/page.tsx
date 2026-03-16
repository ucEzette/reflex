"use client";

import { useState } from "react";
import { QuickPolicyWidget } from "@/components/QuickPolicyWidget";
import { motion } from "framer-motion";

export default function WidgetDemo() {
    const [protectionPremium, setProtectionPremium] = useState(0);
    const [protectionEnabled, setProtectionEnabled] = useState(false);

    const baseFare = 459.00;
    const taxes = 82.50;
    const total = baseFare + taxes + (protectionEnabled ? protectionPremium : 0);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-4 pb-20 sm:p-8">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Mock Browser/Header */}
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-zinc-400">arrow_back</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black italic">Checkout</h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Step 3 of 4: Finalize Booking</p>
                    </div>
                </div>

                {/* Flight Info Card */}
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Departure</span>
                            <div className="text-2xl font-black font-mono">LHR → JFK</div>
                        </div>
                        <div className="text-right space-y-1">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date</span>
                            <div className="text-sm font-bold">24 OCT 2026</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            10:45 AM
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">event_seat</span>
                            Economy (12A)
                        </div>
                    </div>
                </div>

                {/* THE WIDGET EMBED */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Travel Protection</h2>
                        <span className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary rounded-full font-bold">Recommended</span>
                    </div>
                    
                    <QuickPolicyWidget 
                        marketId="flight" 
                        onToggle={(enabled, premium) => {
                            setProtectionEnabled(enabled);
                            setProtectionPremium(premium);
                        }}
                    />
                </div>

                {/* Price Breakdown */}
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
                    <div className="flex justify-between text-sm text-zinc-400 font-medium">
                        <span>Base Airfare</span>
                        <span className="font-mono">${baseFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400 font-medium">
                        <span>Taxes & Fees</span>
                        <span className="font-mono">${taxes.toFixed(2)}</span>
                    </div>
                    
                    {protectionEnabled && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-between text-sm text-primary font-bold"
                        >
                            <span>Reflex Delay Protection</span>
                            <span className="font-mono">${protectionPremium.toFixed(2)}</span>
                        </motion.div>
                    )}

                    <div className="h-[1px] bg-white/5 my-2" />

                    <div className="flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Order Total</span>
                        <div className="text-3xl font-black font-mono italic text-white flex flex-col items-end">
                            ${total.toFixed(2)}
                            <span className="text-[10px] font-bold text-zinc-600 uppercase not-italic">Inc. all levies</span>
                        </div>
                    </div>
                </div>

                <button className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-full shadow-2xl shadow-white/10 hover:scale-[1.02] active:scale-95 transition-all">
                    Finalize & Pay
                </button>

                <p className="text-[10px] text-center text-zinc-600 font-bold leading-loose uppercase tracking-widest">
                    Secured by Reflex Protocol • Powered by Avalanche & Chainlink
                </p>
            </div>
        </div>
    );
}
