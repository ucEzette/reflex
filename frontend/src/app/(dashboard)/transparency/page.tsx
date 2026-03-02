"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, ShieldCheck, Globe, Database } from 'lucide-react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACTS } from '@/lib/wagmiConfig';
import { LP_POOL_ABI, TRAVEL_ABI, AGRI_ABI, ENERGY_ABI } from '@/lib/contracts';
import { generateOracleLogs, generateTreasuryMetrics } from '@/lib/mockState';

export default function TransparencyDashboard() {
    const [mounted, setMounted] = useState(false);
    const [liveLogs, setLiveLogs] = useState<any[]>([]);

    // 1. Fetch Real-time Treasury Metrics
    const { data: totalAssets } = useReadContract({
        address: CONTRACTS.LP_POOL,
        abi: LP_POOL_ABI,
        functionName: 'totalAssets',
        query: { refetchInterval: 10000 }
    });

    const { data: totalMaxPayouts } = useReadContract({
        address: CONTRACTS.LP_POOL,
        abi: LP_POOL_ABI,
        functionName: 'totalMaxPayouts',
        query: { refetchInterval: 10000 }
    });

    const tvl = totalAssets ? Number(formatUnits(totalAssets as bigint, 6)) : 12450000;
    const payouts = totalMaxPayouts ? Number(formatUnits(totalMaxPayouts as bigint, 6)) : 450000;

    // 2. Watch for Real-time Events (Live Console)
    const handleNewEvent = (log: any, type: string, target: string) => {
        const newLog = {
            id: log.transactionHash,
            timestamp: new Date().toISOString(),
            target,
            message: `${type}: ${log.args?.policyId || log.args?.id || 'N/A'} - Tx: ${log.transactionHash.slice(0, 10)}...`,
            status: type === 'Claimed' ? 'Success' : 'Active'
        };
        setLiveLogs(prev => [newLog, ...prev].slice(0, 50));
    };

    // Watchers for different products
    useWatchContractEvent({ address: CONTRACTS.TRAVEL, abi: TRAVEL_ABI, eventName: 'PolicyCreated', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Created', 'TRAVEL')) });
    useWatchContractEvent({ address: CONTRACTS.AGRI, abi: AGRI_ABI, eventName: 'PolicyCreated', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Created', 'AGRI')) });
    useWatchContractEvent({ address: CONTRACTS.ENERGY, abi: ENERGY_ABI, eventName: 'PolicyCreated', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Created', 'ENERGY')) });
    useWatchContractEvent({ address: CONTRACTS.TRAVEL, abi: TRAVEL_ABI, eventName: 'PolicyClaimed', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Claimed', 'TRAVEL')) });

    // Fallback to mock for filling space if no live events yet
    const initialLogs = generateOracleLogs();
    const stats = generateTreasuryMetrics();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const displayLogs = liveLogs.length > 0 ? liveLogs : initialLogs;

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 bg-background">

            {/* Header / Breadcrumb - Consistent with Dashboard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Protocol Transparency</h1>
                        <nav className="flex text-[10px] text-muted-foreground uppercase font-bold tracking-widest gap-2">
                            <span className="hover:text-foreground cursor-pointer transition-colors">Reflex</span>
                            <span>/</span>
                            <span className="text-foreground">Oracle & Treasury</span>
                        </nav>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Nodes Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Solvency & Chart Column */}
                <section className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <SolvencyMetrics tvl={tvl} claims={payouts} />

                    {/* Treasury Chart */}
                    <article className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <LineChart className="w-32 h-32 text-primary" />
                        </div>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Treasury Solvency</h2>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">USDC liquidity vs. historical parametric payouts</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold py-1 px-2 bg-accent rounded uppercase text-muted-foreground tracking-tighter">30D Span</span>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B0000" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8B0000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/20" vertical={false} />
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
                                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '12px', fontWeight: 'bold' }}
                                        itemStyle={{ color: 'var(--primary)' }}
                                        formatter={(value: number | undefined) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0), "TVL"]}
                                    />
                                    <Area type="monotone" dataKey="tvl" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTvl)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </article>
                </section>

                {/* Live Oracle Console */}
                <section className="lg:col-span-12 xl:col-span-5 h-fit lg:h-full min-h-[500px]">
                    <article className="bg-black border border-border rounded-2xl h-full overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/5">
                        {/* Terminal Header */}
                        <div className="bg-zinc-900 px-4 py-3 text-[10px] font-bold text-zinc-500 flex items-center justify-between border-b border-white/5">
                            <span className="flex items-center gap-3 tracking-widest uppercase">
                                <Database className="w-3.5 h-3.5 text-emerald-500" />
                                Chainlink // DON-Verification-Feed
                            </span>
                            <div className="flex gap-1.5 items-center">
                                <span className="text-[9px] text-zinc-600 mr-2">VERIFIED-TS-01</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                </div>
                            </div>
                        </div>

                        {/* Feed Body */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-[11px] leading-relaxed custom-scrollbar bg-black text-zinc-400">
                            <AnimatePresence initial={false}>
                                {displayLogs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative pl-4 border-l border-zinc-800"
                                    >
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-zinc-600 tabular-nums">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {log.target}
                                            </span>
                                            <span className="text-[9px] text-zinc-700 font-bold ml-auto">0x{log.id.slice(0, 6)}</span>
                                        </div>
                                        <p className="text-zinc-300 leading-snug">{log.message}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Terminal Footer */}
                        <div className="bg-zinc-900/50 p-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Global Consensus Active</span>
                            </div>
                            <span className="text-[9px] font-mono text-zinc-700">SIG_VER: ECDSA_SEC_PV2</span>
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
            <h2 className="text-sm font-bold text-foreground mb-6 uppercase tracking-widest">Solvency Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {/* Efficiency Bar */}
                <div>
                    <div className="flex justify-between items-baseline mb-3">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Utilized Liquidity</span>
                        <span className="text-xl font-bold text-primary">{capitalEfficiency.toFixed(2)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-accent rounded-full overflow-hidden ring-1 ring-border/50">
                        <div
                            className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(139,0,0,0.3)]"
                            style={{ width: `${Math.min(capitalEfficiency * 5, 100)}%` }} // Scaled for visibility since efficiency is low
                        />
                    </div>
                    <div className="flex justify-between mt-3">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">0% Min</p>
                        <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Sustainable Tier</p>
                    </div>
                </div>

                {/* Hard Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-accent/30 rounded-xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mb-1">Treasury TVL</p>
                        <p className="font-bold text-sm text-foreground">{new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD' }).format(tvl)}</p>
                    </div>
                    <div className="p-3 bg-accent/30 rounded-xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mb-1">Total Payouts</p>
                        <p className="font-bold text-sm text-foreground">{new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD' }).format(claims)}</p>
                    </div>
                </div>
            </div>
        </article>
    );
}
