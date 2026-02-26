"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, LineChart, ShieldCheck } from 'lucide-react';
import { generateOracleLogs, generateTreasuryMetrics } from '@/lib/mockState';

export default function TransparencyDashboard() {
    // Local state to simulate loading
    const [mounted, setMounted] = useState(false);
    const logs = generateOracleLogs();
    const stats = generateTreasuryMetrics();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen p-6 lg:p-12 space-y-8 max-w-7xl mx-auto bg-background">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    Protocol Transparency
                </h1>
                <p className="text-muted-foreground mt-2">Real-time oracle verification and treasury solvency metrics.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Solvency & Chart Column */}
                <section className="lg:col-span-7 flex flex-col gap-8">
                    <SolvencyMetrics tvl={stats[stats.length - 1].tvl} claims={stats[stats.length - 1].claimsPaid} />
                    
                    {/* Treasury Chart */}
                    <article className="bg-card border border-border rounded-2xl p-6 shadow-sm h-[400px] flex flex-col">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                            <LineChart className="w-5 h-5 text-primary" />
                            Treasury TVL <span className="text-xs text-muted-foreground font-normal ml-2">(30 Days)</span>
                        </h2>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4895EF" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4895EF" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                                    <XAxis 
                                        dataKey="timestamp" 
                                        stroke="currentColor" 
                                        className="text-muted-foreground text-[10px]"
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="currentColor" 
                                        className="text-muted-foreground text-[10px]"
                                        tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} 
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                                        itemStyle={{ color: '#4895EF' }}
                                        labelStyle={{ color: 'var(--muted-foreground)', fontSize: '12px' }}
                                        formatter={(value: number) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), "TVL"]}
                                    />
                                    <Area type="monotone" dataKey="tvl" stroke="#4895EF" strokeWidth={2} fillOpacity={1} fill="url(#colorTvl)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </article>
                </section>

                {/* Live Oracle Console */}
                <section className="lg:col-span-5 relative flex flex-col">
                    <article className="bg-[#0A0A0A] border border-border/50 rounded-2xl h-full overflow-hidden flex flex-col shadow-2xl">
                        {/* Terminal Header */}
                        <div className="bg-[#1A1A1A] p-3 text-xs font-mono text-muted-foreground flex items-center justify-between border-b border-border/10">
                            <span className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-emerald-500" />
                                oracle-node-01 // stream
                            </span>
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                            </div>
                        </div>
                        
                        {/* Feed Body */}
                        <div className="flex-1 p-5 overflow-y-auto space-y-3 font-mono text-[11px] leading-relaxed custom-scrollbar bg-black max-h-[600px] text-slate-300">
                            <AnimatePresence initial={false}>
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="border-l-2 pl-3 pb-1"
                                        style={{ borderColor: log.status === 'Success' ? '#10b981' : log.status === 'Pending' ? '#3b82f6' : '#ef4444' }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span className={`px-1 rounded bg-white/10 ${log.status === 'Success' ? 'text-emerald-400' : log.status === 'Pending' ? 'text-blue-400' : 'text-red-400'}`}>
                                                [{log.target.toUpperCase()}]
                                            </span>
                                        </div>
                                        <p className="break-words">{log.message}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </article>
                </section>
            </div>
        </div>
    );
}

function SolvencyMetrics({ tvl, claims }: { tvl: number, claims: number }) {
    const capitalEfficiency = useMemo(() => {
        if (!tvl || !claims) return 0;
        return (claims / tvl) * 100;
    }, [tvl, claims]);

    return (
        <article className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6">Solvency Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Efficiency Bar */}
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Capital Efficiency</span>
                        <span className="text-lg font-bold text-primary">{capitalEfficiency.toFixed(2)}%</span>
                    </div>
                    <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-1000 ease-out" 
                            style={{ width: `${Math.min(capitalEfficiency, 100)}%` }} 
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">Target Range: 2% - 15%</p>
                </div>

                {/* Hard Metrics */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-sm text-muted-foreground">Total Capital Pool</span>
                        <span className="font-mono text-sm text-foreground font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tvl)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Claims Settled</span>
                        <span className="font-mono text-sm text-foreground font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(claims)}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
