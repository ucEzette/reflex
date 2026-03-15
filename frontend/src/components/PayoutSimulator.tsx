"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const PayoutSimulator = () => {
    const [delay, setDelay] = useState(135); // Shared state for minutes

    // Parametric calculation constants
    const THRESHOLD = 120; // 2 hours
    const MAX_DELAY = 360; // 6 hours
    const MIN_PAYOUT = 50;
    const MAX_PAYOUT = 450;

    const payout = useMemo(() => {
        if (delay < THRESHOLD) return 0;
        // Piece-wise linear scaling above 120 minutes
        const scale = (delay - THRESHOLD) / (MAX_DELAY - THRESHOLD);
        return Math.floor(MIN_PAYOUT + scale * (MAX_PAYOUT - MIN_PAYOUT));
    }, [delay]);

    // Graph path calculation
    const points = useMemo(() => {
        const step = 10;
        const pts = [];
        for (let i = 0; i <= MAX_DELAY; i += step) {
            let val = 0;
            if (i >= THRESHOLD) {
                const s = (i - THRESHOLD) / (MAX_DELAY - THRESHOLD);
                val = MIN_PAYOUT + s * (MAX_PAYOUT - MIN_PAYOUT);
            }
            // Map i (0-360) to SVG x (0-100) and val (0-450) to SVG y (100-20)
            const x = (i / MAX_DELAY) * 100;
            const y = 100 - (val / MAX_PAYOUT) * 80;
            pts.push(`${x},${y}`);
        }
        return pts.join(" ");
    }, [MAX_DELAY, MAX_PAYOUT, THRESHOLD, MIN_PAYOUT]);

    return (
        <div className="relative w-full p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Visual Graph Side */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase italic">Parametric Curve</h3>
                            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-1">Real-time settlement simulation</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-black text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
                                {payout} <span className="text-sm font-light">USDT</span>
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
                                <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Area Fill */}
                            <motion.path
                                d={`M 0,100 L ${points} L 100,100 Z`}
                                fill="url(#payoutGradient)"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            {/* Main Stroke */}
                            <motion.polyline
                                points={points}
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]"
                            />

                            {/* Threshold Marker */}
                            <line 
                                x1={(THRESHOLD / MAX_DELAY) * 100} y1="0" 
                                x2={(THRESHOLD / MAX_DELAY) * 100} y2="100" 
                                stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" 
                            />

                            {/* Current Position Dot */}
                            <motion.circle
                                cx={(delay / MAX_DELAY) * 100}
                                cy={100 - (payout / MAX_PAYOUT) * 80}
                                r="2"
                                fill="#fff"
                                className="drop-shadow-[0_0_10px_#fff]"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </svg>

                        {/* Labels */}
                        <div className="absolute bottom-1 left-4 text-[9px] text-zinc-600 font-mono">0 MIN</div>
                        <div className="absolute bottom-1 right-4 text-[9px] text-zinc-600 font-mono">{MAX_DELAY} MIN</div>
                        <div className="absolute top-1 left-4 text-[9px] text-zinc-600 font-mono">$ {MAX_PAYOUT} USDT</div>
                        <div className="absolute top-[52%] left-[34%] -translate-x-1/2 text-[10px] text-red-500/80 font-bold tracking-tighter uppercase whitespace-nowrap -rotate-90">Payout Threshold (2h)</div>
                    </div>
                </div>

                {/* Control Side */}
                <div className="flex flex-col gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                                Incident Duration
                            </label>
                            <span className="text-xl font-black font-mono text-white italic">
                                {Math.floor(delay / 60)}h {delay % 60}m
                            </span>
                        </div>
                        
                        <div className="relative group/slider">
                            <input
                                type="range"
                                min="0"
                                max={MAX_DELAY}
                                value={delay}
                                onChange={(e) => setDelay(parseInt(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-secondary transition-all"
                            />
                            <div className="flex justify-between mt-3">
                                <span className="text-[10px] text-zinc-500 font-bold">ON-TIME</span>
                                <span className="text-[10px] text-red-500 font-black italic">CRITICAL DELAY</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Risk Assessment</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${delay > THRESHOLD ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {delay > THRESHOLD ? 'PAYOUT ACTIVE' : 'NO DELAY'}
                            </span>
                        </div>
                        
                        <div className="h-[1px] bg-white/5 w-full" />

                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-zinc-300 leading-relaxed font-light">
                                {delay < THRESHOLD ? (
                                    <>Reflex monitors your flight 24/7. An instant payout of <span className="text-white font-bold">50 USDT</span> activates exactly at the 120-minute mark.</>
                                ) : (
                                    <>Trigger detected. A decentralized consensus of <span className="text-primary font-bold">Chainlink Nodes</span> has verified the {delay}m delay, authorizing a <span className="text-white font-bold">{payout} USDT</span> settlement.</>
                                )}
                            </p>
                        </div>
                    </div>

                    <button className="w-full py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                        Purchase Coverage — 5 USDT
                    </button>
                </div>
            </div>

            {/* Background Text Decor */}
            <div className="absolute -bottom-10 -right-10 text-[120px] font-black italic text-white/[0.02] pointer-events-none select-none uppercase">
                Reflex
            </div>
        </div>
    );
};
