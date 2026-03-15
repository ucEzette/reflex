"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SIMULATION_PROFILES = {
    flight: {
        id: "flight",
        title: "Travel",
        icon: "flight",
        unit: "MIN",
        inputLabel: "Delay Duration",
        threshold: 120,
        maxInput: 360,
        minPayout: 50,
        maxPayout: 450,
        color: "#00f0ff",
        description: (val: number) => `Trigger detected. A decentralized consensus of Chainlink Nodes has verified the ${val}m delay, authorizing an instant settlement.`,
        noActionDescription: "Reflex monitors your flight 24/7. An instant payout activates exactly at the 120-minute mark.",
        triggerLabel: "PAYOUT ACTIVE"
    },
    agri: {
        id: "agri",
        title: "Agri",
        icon: "grass",
        unit: "MM",
        inputLabel: "Rainfall Deficit",
        threshold: 50,
        maxInput: 250,
        minPayout: 100,
        maxPayout: 2500,
        color: "#22c55e",
        description: (val: number) => `Drought index verified. Rainfall at ${val}mm is below the 50mm strike threshold. Linear payout scaling initiated.`,
        noActionDescription: "Rainfall index is within safe seasonal boundaries. No payout triggered.",
        triggerLabel: "DROUGHT TRIGGER"
    },
    energy: {
        id: "energy",
        title: "Energy",
        icon: "bolt",
        unit: "°C",
        inputLabel: "Peak Temperature",
        threshold: 35,
        maxInput: 55,
        minPayout: 200,
        maxPayout: 5000,
        color: "#f59e0b",
        description: (val: number) => `Heatwave intensity at ${val}°C exceeds grid safety margins. Degree-day tick settlement authorized.`,
        noActionDescription: "Ambient temperature remains within operational tolerance. Grid stability maintained.",
        triggerLabel: "THERMAL ALERT"
    },
    cat: {
        id: "cat",
        title: "Cat",
        icon: "earthquake",
        unit: "KM",
        inputLabel: "Epicenter Distance",
        threshold: 100,
        maxInput: 150,
        minPayout: 1000,
        maxPayout: 50000,
        color: "#ef4444",
        isInverted: true, // Closer is higher payout
        description: (val: number) => `Seismic event confirmed. Proximity of ${val}km to coordinates triggers tiered structural remediation coverage.`,
        noActionDescription: "Epicenter is beyond the 100km structural risk radius. Standard monitoring active.",
        triggerLabel: "SEISMIC IMPACT"
    }
};

export const PayoutSimulator = () => {
    const [activeId, setActiveId] = useState<keyof typeof SIMULATION_PROFILES>("flight");
    const profile = SIMULATION_PROFILES[activeId];
    const [inputValue, setInputValue] = useState(profile.threshold + 20);

    // Update value when switching profiles to stay near threshold
    const handleProfileChange = (id: keyof typeof SIMULATION_PROFILES) => {
        setActiveId(id);
        setInputValue(SIMULATION_PROFILES[id].threshold + 10);
    };

    const payout = useMemo(() => {
        if (profile.isInverted) {
            if (inputValue > profile.threshold) return 0;
            const scale = (profile.threshold - inputValue) / profile.threshold; // 0 at threshold, 1 at 0km
            return Math.floor(profile.minPayout + scale * (profile.maxPayout - profile.minPayout));
        } else {
            if (inputValue < profile.threshold) return 0;
            const scale = (inputValue - profile.threshold) / (profile.maxInput - profile.threshold);
            return Math.floor(profile.minPayout + scale * (profile.maxPayout - profile.minPayout));
        }
    }, [inputValue, profile]);

    // Graph path calculation
    const points = useMemo(() => {
        const step = profile.maxInput / 40;
        const pts = [];
        for (let i = 0; i <= profile.maxInput; i += step) {
            let val = 0;
            if (profile.isInverted) {
                if (i <= profile.threshold) {
                    const s = (profile.threshold - i) / profile.threshold;
                    val = profile.minPayout + s * (profile.maxPayout - profile.minPayout);
                }
            } else {
                if (i >= profile.threshold) {
                    const s = (i - profile.threshold) / (profile.maxInput - profile.threshold);
                    val = profile.minPayout + s * (profile.maxPayout - profile.minPayout);
                }
            }
            const x = (i / profile.maxInput) * 100;
            const y = 100 - (val / profile.maxPayout) * 80;
            pts.push(`${x},${y}`);
        }
        return pts.join(" ");
    }, [profile]);

    return (
        <div className="relative w-full p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Visual Graph Side */}
                <div className="flex flex-col gap-6">
                    {/* Product Tabs */}
                    <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 self-start">
                        {Object.values(SIMULATION_PROFILES).map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handleProfileChange(p.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                    activeId === p.id 
                                    ? "bg-white text-black shadow-lg shadow-white/10" 
                                    : "text-zinc-500 hover:text-white"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">{p.icon}</span>
                                <span className="hidden sm:inline">{p.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{profile.title} Curve</h3>
                            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-1">Real-time settlement simulation</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-black drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" style={{ color: profile.color }}>
                                {payout.toLocaleString()} <span className="text-sm font-light">USDT</span>
                            </span>
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">ESTIMATED PAYOUT</span>
                        </div>
                    </div>

                    <div className="relative h-64 w-full bg-zinc-950/50 rounded-2xl border border-white/5 p-4 flex items-end">
                        {/* Grid Lines */}
                        <div className="absolute inset-4 flex flex-col justify-between opacity-10 pointer-events-none">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-[1px] bg-white border-t border-dashed" />)}
                        </div>

                        {/* Payout Curve SVG */}
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`grad-${activeId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={profile.color} stopOpacity="0.4" />
                                    <stop offset="100%" stopColor={profile.color} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Area Fill */}
                            <motion.path
                                key={`fill-${activeId}`}
                                d={`M 0,100 L ${points} L 100,100 Z`}
                                fill={`url(#grad-${activeId})`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            />

                            {/* Main Stroke */}
                            <motion.polyline
                                key={`line-${activeId}`}
                                points={points}
                                fill="none"
                                stroke={profile.color}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]"
                            />

                            {/* Threshold Marker */}
                            <line 
                                x1={(profile.threshold / profile.maxInput) * 100} y1="0" 
                                x2={(profile.threshold / profile.maxInput) * 100} y2="100" 
                                stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" 
                            />

                            {/* Current Position Dot */}
                            <motion.circle
                                cx={(inputValue / profile.maxInput) * 100}
                                cy={100 - (payout / profile.maxPayout) * 80}
                                r="2"
                                fill="#fff"
                                className="drop-shadow-[0_0_10px_#fff]"
                                animate={{ cx: (inputValue / profile.maxInput) * 100, cy: 100 - (payout / profile.maxPayout) * 80 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </svg>

                        {/* Labels */}
                        <div className="absolute bottom-1 left-4 text-[9px] text-zinc-600 font-mono">0 {profile.unit}</div>
                        <div className="absolute bottom-1 right-4 text-[9px] text-zinc-600 font-mono">{profile.maxInput} {profile.unit}</div>
                        <div className="absolute top-1 left-4 text-[9px] text-zinc-600 font-mono">$ {profile.maxPayout.toLocaleString()} USDT</div>
                        <div 
                            className="absolute top-[52%] text-[10px] text-red-500/80 font-bold tracking-tighter uppercase whitespace-nowrap -rotate-90 origin-center"
                            style={{ left: `${(profile.threshold / profile.maxInput) * 100}%`, transform: 'translateX(-50%) rotate(-90deg)' }}
                        >
                            Payout Limit
                        </div>
                    </div>
                </div>

                {/* Control Side */}
                <div className="flex flex-col gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm" style={{ color: profile.color }}>{profile.icon}</span>
                                {profile.inputLabel}
                            </label>
                            <span className="text-xl font-black font-mono text-white italic">
                                {inputValue} {profile.unit}
                            </span>
                        </div>
                        
                        <div className="relative group/slider">
                            <input
                                type="range"
                                min="0"
                                max={profile.maxInput}
                                value={inputValue}
                                onChange={(e) => setInputValue(parseInt(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer border border-white/5 transition-all"
                                style={{ accentColor: profile.color }}
                            />
                            <div className="flex justify-between mt-3">
                                <span className="text-[10px] text-zinc-500 font-bold">MIN RISK</span>
                                <span className="text-[10px] text-red-500 font-black italic">MAX EXPOSURE</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 overflow-hidden relative">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Risk Assessment</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${payout > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {payout > 0 ? profile.triggerLabel : 'MONITORING'}
                            </span>
                        </div>
                        
                        <div className="h-[1px] bg-white/5 w-full" />

                        <div className="flex flex-col gap-2 min-h-[48px]">
                            <AnimatePresence mode="wait">
                                <motion.p 
                                    key={`${activeId}-${payout > 0}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-sm text-zinc-300 leading-relaxed font-light"
                                >
                                    {payout > 0 ? profile.description(inputValue) : profile.noActionDescription}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    <button 
                        className="w-full py-4 rounded-xl text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all"
                        style={{ backgroundColor: profile.color, boxShadow: `0 0 20px ${profile.color}44` }}
                    >
                        Buy {profile.title} Protection
                    </button>
                </div>
            </div>

            {/* Background Text Decor */}
            <div className="absolute -bottom-10 -right-10 text-[120px] font-black italic text-white/[0.02] pointer-events-none select-none uppercase">
                {profile.title}
            </div>
        </div>
    );
};
