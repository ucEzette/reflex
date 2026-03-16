"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, TrendingDown, Thermometer, Droplets, Wind, AlertTriangle, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Scenario {
    id: string;
    title: string;
    description: string;
    impact: number; // Multiplier for liabilities
    affectedSectors: string[];
    icon: any;
    color: string;
}

const SCENARIOS: Scenario[] = [
    {
        id: "baseline",
        title: "Market Baseline",
        description: "Standard operating conditions with verified historical risk variance.",
        impact: 1.0,
        affectedSectors: [],
        icon: ShieldAlert,
        color: "text-zinc-400"
    },
    {
        id: "hurricane",
        title: "Category 5 Hurricane",
        description: "Systemic coastal disruption affecting Maritime, Travel, and Catastrophe pools.",
        impact: 4.8,
        affectedSectors: ["Maritime", "Travel", "Catastrophe"],
        icon: Wind,
        color: "text-rose-500"
    },
    {
        id: "drought",
        title: "Global Heatwave",
        description: "Extreme agricultural failure and energy grid volatility.",
        impact: 3.2,
        affectedSectors: ["Agriculture", "Energy"],
        icon: Thermometer,
        color: "text-amber-500"
    },
    {
        id: "grounding",
        title: "Global Aviation Halt",
        description: "Total grounding of commercial flights due to systemic atmospheric events.",
        impact: 6.5,
        affectedSectors: ["Travel"],
        icon: Play,
        color: "text-blue-500"
    }
];

export const RiskSimulator = ({ currentAssets, currentLiabilities }: { currentAssets: number, currentLiabilities: number }) => {
    const [selectedId, setSelectedId] = useState("baseline");
    const [isSimulating, setIsSimulating] = useState(false);

    const scenario = useMemo(() => SCENARIOS.find(s => s.id === selectedId)!, [selectedId]);
    
    const simulatedLiabilities = isSimulating ? currentLiabilities * scenario.impact : currentLiabilities;
    const simulatedRatio = currentAssets > 0 ? (currentAssets / simulatedLiabilities) * 100 : 0;
    const isSolvent = simulatedRatio >= 100;

    const runSimulation = () => {
        setIsSimulating(true);
    };

    const resetSimulation = () => {
        setIsSimulating(false);
        setSelectedId("baseline");
    };

    return (
        <div className="p-8 rounded-3xl bg-zinc-900/60 border border-white/5 backdrop-blur-3xl space-y-8 overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
                        Real-Time Risk Stress Test
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                        Solvency <span className="text-primary text-glow-primary">Simulation</span>
                    </h2>
                    <p className="text-sm text-zinc-500 font-mono mt-2">
                        Predictive modeling for extreme tail-risk events.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isSimulating ? (
                        <button 
                            onClick={resetSimulation}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" /> Reset Engine
                        </button>
                    ) : (
                        <button 
                            onClick={runSimulation}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-black text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            <Play className="w-4 h-4 fill-current" /> Run Stress Test
                        </button>
                    )
                }
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Scenario Selection */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SCENARIOS.map((s) => (
                            <div
                                key={s.id}
                                onClick={() => setSelectedId(s.id)}
                                className={cn(
                                    "p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden",
                                    selectedId === s.id 
                                        ? "bg-zinc-900 border-primary shadow-lg shadow-primary/5" 
                                        : "bg-zinc-950/40 border-white/5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 hover:border-white/20"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn("p-2 rounded-xl bg-white/5", s.color)}>
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-white">{s.title}</h4>
                                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{s.description}</p>
                                    </div>
                                </div>
                                {selectedId === s.id && (
                                    <motion.div 
                                        layoutId="scenario-glow"
                                        className="absolute inset-0 bg-primary/5 pointer-events-none"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simulation Output */}
                <div className="lg:col-span-5 h-full">
                    <div className="p-6 rounded-3xl bg-zinc-950 border border-white/5 h-full flex flex-col justify-between relative overflow-hidden">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Projection Results</span>
                                {isSimulating && (
                                    <motion.span 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] font-black text-primary uppercase animate-pulse"
                                    >
                                        Simulation Running
                                    </motion.span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-zinc-400 font-bold">Projected Solvency</span>
                                    <div className={cn(
                                        "text-4xl font-black tabular-nums tracking-tighter",
                                        isSolvent ? "text-green-500" : "text-red-500"
                                    )}>
                                        {simulatedRatio.toFixed(1)}%
                                    </div>
                                </div>
                                
                                <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        className={cn(
                                            "h-full shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                                            isSolvent ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"
                                        )}
                                        initial={{ width: "100%" }}
                                        animate={{ width: `${Math.min(simulatedRatio, 100)}%` }}
                                        transition={{ duration: 1, ease: "circOut" }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500 font-medium">Assets Under Review</span>
                                    <span className="text-white font-mono font-bold">${currentAssets.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500 font-medium font-mono italic">Stress Liabilities</span>
                                    <motion.span 
                                        key={simulatedLiabilities}
                                        initial={{ color: "#fff" }}
                                        animate={{ color: isSimulating ? "#ef4444" : "#fff" }}
                                        className="font-mono font-bold"
                                    >
                                        ${simulatedLiabilities.toLocaleString()}
                                    </motion.span>
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className={cn(
                            "mt-8 p-4 rounded-2xl border flex items-center gap-3",
                            isSolvent 
                                ? "bg-green-500/5 border-green-500/10 text-green-500" 
                                : "bg-red-500/5 border-red-500/10 text-red-500"
                        )}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                isSolvent ? "bg-green-500 text-black" : "bg-red-500 text-white"
                            )}>
                                <span className="material-symbols-outlined text-sm font-black">
                                    {isSolvent ? "verified_user" : "warning"}
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                <h5 className="text-[10px] font-black uppercase tracking-widest">{isSolvent ? "Protocol Resilient" : "Solvency Alert"}</h5>
                                <p className="text-[9px] font-medium leading-tight">
                                    {isSolvent 
                                        ? "Capital reserves remain sufficient to cover all simulated sector-wide disruptions."
                                        : `Liquidity shortfall of $${(simulatedLiabilities - currentAssets).toLocaleString()}. Emergency buffers required.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Texture */}
             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
};
