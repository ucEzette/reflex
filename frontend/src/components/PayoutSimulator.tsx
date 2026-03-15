"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_MARKETS } from "@/lib/market-data";

const SIMULATION_PROFILES = {
    flight: {
        id: "flight",
        title: "Travel",
        icon: "flight",
        unit: "MIN",
        inputLabel: "Delay Duration",
        threshold: 120,
        maxInput: 360,
        color: "#00f0ff",
        isInverted: false,
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
        color: "#22c55e",
        isInverted: false,
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
        color: "#f59e0b",
        isInverted: false,
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
        color: "#ef4444",
        isInverted: true, // Closer is higher payout
        description: (val: number) => `Seismic event confirmed. Proximity of ${val}km to coordinates triggers tiered structural remediation coverage.`,
        noActionDescription: "Epicenter is beyond the 100km structural risk radius. Standard monitoring active.",
        triggerLabel: "SEISMIC IMPACT"
    },
    maritime: {
        id: "maritime",
        title: "Maritime",
        icon: "sailing",
        unit: "KT",
        inputLabel: "Wind Speed",
        threshold: 30,
        maxInput: 80,
        color: "#818cf8",
        isInverted: false,
        description: (val: number) => `Gale force wind detected. Port operations at ${val}kt exceed safety thresholds. Binary settlement triggered via Stormglass.io.`,
        noActionDescription: "Wind conditions are within safe operational parameters for dockside logistics.",
        triggerLabel: "PORT CLOSURE"
    }
};

export const PayoutSimulator = () => {
    const [activeId, setActiveId] = useState<keyof typeof SIMULATION_PROFILES>("flight");
    const profile = SIMULATION_PROFILES[activeId];
    
    // Find protocol market data
    const market = useMemo(() => ALL_MARKETS.find(m => m.id === activeId) || ALL_MARKETS[0], [activeId]);
    
    const defaultPremium = useMemo(() => {
        const priceStr = market.price.replace(/[^0-9.]/g, '');
        return parseFloat(priceStr) || 5;
    }, [market]);

    const [premium, setPremium] = useState(defaultPremium);
    const [inputValue, setInputValue] = useState(profile.threshold + 20);
    const [surgeData, setSurgeData] = useState<{multiplier: number, reason: string} | null>(null);

    // Simulate real-time risk engine polling
    useEffect(() => {
        const checkRisk = () => {
            // Logic: If input value is within 20% of threshold, or some other "stress" factor
            // For demo: Let's trigger surge if inputValue is high or randomly for "real-time feel"
            const isHighRisk = (activeId === 'flight' && inputValue > 180) || 
                              (activeId === 'maritime' && inputValue > 130) ||
                              (activeId === 'energy' && inputValue > 45);
            
            if (isHighRisk) {
                setSurgeData({
                    multiplier: activeId === 'energy' ? 2.5 : 1.8,
                    reason: activeId === 'energy' ? "Extreme Heat Warning" : "High Volatility Forecast"
                });
            } else {
                setSurgeData(null);
            }
        };
        
        checkRisk();
        const interval = setInterval(checkRisk, 5000);
        return () => clearInterval(interval);
    }, [inputValue, activeId]);

    // Reset premium when switching profiles
    useEffect(() => {
        setPremium(defaultPremium);
        setInputValue(profile.threshold + 10);
    }, [activeId, defaultPremium, profile.threshold]);

    // Calculate leverage from riskPremium (e.g. "5%" -> 20x)
    const leverage = useMemo(() => {
        const risk = parseFloat(market.marketData.riskPremium) || 5;
        return 100 / risk;
    }, [market]);

    const currentMultiplier = surgeData?.multiplier || 1.0;
    const dynamicPremiumTotal = premium * currentMultiplier;

    const minPayout = premium * (leverage * 0.5); // Start payout at half of max leverage at threshold
    const maxPayout = premium * leverage;

    const payout = useMemo(() => {
        if (profile.isInverted) {
            if (inputValue > profile.threshold) return 0;
            const scale = (profile.threshold - inputValue) / profile.threshold; 
            return Math.floor(minPayout + scale * (maxPayout - minPayout));
        } else {
            if (inputValue < profile.threshold) return 0;
            const scale = (inputValue - profile.threshold) / (profile.maxInput - profile.threshold);
            return Math.floor(minPayout + scale * (maxPayout - minPayout));
        }
    }, [inputValue, profile, minPayout, maxPayout]);

    // Graph path calculation
    const points = useMemo(() => {
        const step = profile.maxInput / 40;
        const pts = [];
        for (let i = 0; i <= profile.maxInput; i += step) {
            let val = 0;
            if (profile.isInverted) {
                if (i <= profile.threshold) {
                    const s = (profile.threshold - i) / profile.threshold;
                    val = minPayout + s * (maxPayout - minPayout);
                }
            } else {
                if (i >= profile.threshold) {
                    const s = (i - profile.threshold) / (profile.maxInput - profile.threshold);
                    val = minPayout + s * (maxPayout - minPayout);
                }
            }
            const x = (i / profile.maxInput) * 100;
            const y = 100 - (val / maxPayout) * 80;
            pts.push(`${x},${y}`);
        }
        return pts.join(" ");
    }, [profile, minPayout, maxPayout]);

    return (
        <div className="relative w-full p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-2xl overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 ${surgeData ? 'from-red-500/10 via-transparent to-transparent opacity-80' : 'from-primary/5 via-transparent to-transparent opacity-50'}`} />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Visual Graph Side */}
                <div className="flex flex-col gap-6">
                    {/* Product Tabs */}
                    <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 self-start">
                        {Object.values(SIMULATION_PROFILES).map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setActiveId(p.id as any)}
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
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{profile.title} Curve</h3>
                            <div className="flex items-center gap-3">
                                <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
                                    {leverage}x Leverage • {market.marketData.riskPremium} Risk Premium
                                </p>
                                {surgeData && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 animate-pulse">
                                        <span className="material-symbols-outlined text-[10px] text-red-500">bolt</span>
                                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Surge {surgeData.multiplier}x</span>
                                    </div>
                                )}
                            </div>
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
                                key={`fill-${activeId}-${maxPayout}`}
                                d={`M 0,100 L ${points} L 100,100 Z`}
                                fill={`url(#grad-${activeId})`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            />

                            {/* Main Stroke */}
                            <motion.polyline
                                key={`line-${activeId}-${maxPayout}`}
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
                                cy={100 - (payout / maxPayout) * 80}
                                r="2"
                                fill="#fff"
                                className="drop-shadow-[0_0_10px_#fff]"
                                animate={{ cx: (inputValue / profile.maxInput) * 100, cy: 100 - (payout / maxPayout) * 80 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </svg>

                        {/* Labels */}
                        <div className="absolute bottom-1 left-4 text-[9px] text-zinc-600 font-mono">0 {profile.unit}</div>
                        <div className="absolute bottom-1 right-4 text-[9px] text-zinc-600 font-mono">{profile.maxInput} {profile.unit}</div>
                        <div className="absolute top-1 left-4 text-[9px] text-zinc-600 font-mono">$ {maxPayout.toLocaleString()} USDT CAP</div>
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
                    {/* Premium Input */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">payments</span>
                                Coverage Amount
                            </label>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2 bg-zinc-800 p-2 rounded-lg border border-white/5">
                                    <input 
                                        type="number"
                                        value={premium}
                                        onChange={(e) => setPremium(Math.max(1, parseFloat(e.target.value) || 0))}
                                        className="bg-transparent text-white font-black font-mono w-16 text-right focus:outline-none"
                                    />
                                    <span className="text-xs text-zinc-500 font-bold uppercase">USDT</span>
                                </div>
                                {surgeData && (
                                    <span className="text-[10px] text-red-400 font-bold mt-1">
                                        Surge Premium Active: {currentMultiplier}x
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

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

                    <div className={`p-5 rounded-2xl border transition-all duration-500 ${surgeData ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'} space-y-4 overflow-hidden relative`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Risk Assessment</span>
                            <div className="flex items-center gap-2">
                                {surgeData && (
                                    <span className="text-[10px] font-black text-red-500 animate-pulse uppercase">Live Alert</span>
                                )}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${surgeData ? 'bg-red-500/20 text-red-400' : payout > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-400'}`}>
                                    {surgeData ? 'HIGH RISK' : payout > 0 ? profile.triggerLabel : 'MONITORING'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="h-[1px] bg-white/5 w-full" />

                        <div className="flex flex-col gap-2 min-h-[48px]">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={surgeData ? 'surge' : payout > 0 ? 'payout' : 'normal'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-2"
                                >
                                    {surgeData ? (
                                        <>
                                            <p className="text-sm font-bold text-red-400 italic flex items-center gap-2 uppercase tracking-tighter">
                                                <span className="material-symbols-outlined text-base">warning</span>
                                                {surgeData.reason}
                                            </p>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-light">
                                                The Dynamic Risk Engine has adjusted current premiums by **{surgeData.multiplier}x** based on live atmospheric telemetry verified by Chainlink DONs.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-zinc-300 leading-relaxed font-light">
                                            {payout > 0 ? profile.description(inputValue) : profile.noActionDescription}
                                        </p>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <button 
                        className={`w-full py-4 rounded-xl text-black font-black uppercase tracking-widest text-xs transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 group/btn`}
                        style={{ 
                            backgroundColor: surgeData ? '#ef4444' : profile.color, 
                            boxShadow: `0 0 20px ${surgeData ? '#ef4444' : profile.color}44` 
                        }}
                    >
                        <span>Purchase Product</span>
                        <span className="text-[10px] opacity-70">
                            Total: {dynamicPremiumTotal.toFixed(2)} USDT
                        </span>
                    </button>
                    {surgeData && (
                        <p className="text-[9px] text-red-500/60 text-center font-bold tracking-widest uppercase">
                            Dynamic Pricing Active — Real-Time Settlement Protection
                        </p>
                    )}
                </div>
            </div>

            {/* Background Text Decor */}
            <div className="absolute -bottom-10 -right-10 text-[120px] font-black italic text-white/[0.02] pointer-events-none select-none uppercase">
                {profile.title}
            </div>
        </div>
    );
};
