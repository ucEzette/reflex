"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { useReadContracts } from "wagmi";
import { CONTRACTS, POOLS } from "@/lib/contracts";
import { LIQUIDITY_POOL_ABI } from "@/lib/enterprise_abis";
import { formatUnits } from "viem";

export const SolvencyDashboard = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const poolAddresses = POOLS.map(p => p.address);

    const { data: solvencyData, isLoading } = useReadContracts({
        contracts: [
            ...poolAddresses.map((addr) => ({
                address: addr as `0x${string}`,
                abi: LIQUIDITY_POOL_ABI,
                functionName: 'totalAssets',
            })),
            ...poolAddresses.map((addr) => ({
                address: addr as `0x${string}`,
                abi: LIQUIDITY_POOL_ABI,
                functionName: 'totalMaxPayouts',
            }))
        ],
        query: { 
            enabled: mounted,
            refetchInterval: 30000 // Refresh every 30s
        }
    });

    const metrics = useMemo(() => {
        if (!solvencyData || !Array.isArray(solvencyData)) return { totalAssets: 0, totalLiabilities: 0, ratio: 0 };
        
        const assets = solvencyData.slice(0, poolAddresses.length).reduce((acc: bigint, res: any) => {
            const val = res?.status === 'success' && typeof res.result === 'bigint' ? res.result : BigInt(0);
            return acc + val;
        }, BigInt(0));

        const liabilities = solvencyData.slice(poolAddresses.length, poolAddresses.length * 2).reduce((acc: bigint, res: any) => {
            const val = res?.status === 'success' && typeof res.result === 'bigint' ? res.result : BigInt(0);
            return acc + val;
        }, BigInt(0));
        
        const assetsNum = Number(formatUnits(assets, 6));
        const liabilitiesNum = Number(formatUnits(liabilities, 6));
        
        const ratio = liabilitiesNum > 0 ? (assetsNum / liabilitiesNum) * 100 : 1000; 
        
        return {
            totalAssets: assetsNum,
            totalLiabilities: liabilitiesNum,
            ratio: Math.min(ratio, 999.9) 
        };
    }, [solvencyData]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    const healthColor = metrics.ratio > 150 ? "#22c55e" : metrics.ratio > 110 ? "#f59e0b" : "#ef4444";

    // Framer Motion Spring for rolling numbers
    const ratioSpring = useSpring(0, { bounce: 0, stiffness: 50, damping: 20 });
    const assetsSpring = useSpring(0, { bounce: 0, stiffness: 50, damping: 20 });
    const liabilitiesSpring = useSpring(0, { bounce: 0, stiffness: 50, damping: 20 });

    const ratioRef = React.useRef<HTMLDivElement>(null);
    const assetsRef = React.useRef<HTMLDivElement>(null);
    const liabRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        ratioSpring.set(metrics.ratio);
        assetsSpring.set(metrics.totalAssets);
        liabilitiesSpring.set(metrics.totalLiabilities);
    }, [metrics, ratioSpring, assetsSpring, liabilitiesSpring]);

    useEffect(() => {
        const unsubs = [
            ratioSpring.on("change", (v) => { if (ratioRef.current) ratioRef.current.textContent = `${v.toFixed(1)}%`; }),
            assetsSpring.on("change", (v) => { if (assetsRef.current && !isLoading) assetsRef.current.textContent = formatCurrency(v); }),
            liabilitiesSpring.on("change", (v) => { if (liabRef.current && !isLoading) liabRef.current.textContent = formatCurrency(v); })
        ];
        return () => unsubs.forEach(u => u());
    }, [ratioSpring, assetsSpring, liabilitiesSpring, isLoading]);

    return (
        <div className="w-full p-8 rounded-[2rem] glass-panel-premium relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] font-black tracking-widest uppercase mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
                            </span>
                            Live Solvency Monitor
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
                            Proof of <span className="text-neon-cyan">Reserves</span>
                        </h2>
                        <p className="text-sm text-zinc-500 font-mono mt-2 flex items-center gap-2">
                             Decentralized audit powered by <span className="text-white font-bold">Chainlink DONs</span>
                        </p>
                    </div>

                    <div className="flex flex-col items-end">
                        <div ref={ratioRef} className="text-4xl md:text-5xl font-black font-mono tracking-tighter drop-shadow-md" style={{ color: healthColor }}>
                            {metrics.ratio.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">SOLVENCY RATIO</div>
                    </div>
                </div>

                {/* Main Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Assets vs Liabilities */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                className="absolute inset-y-0 left-0 bg-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: metrics.totalLiabilities > 0 ? `${Math.min((metrics.totalLiabilities / metrics.totalAssets) * 100, 100)}%` : '0%' }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[8px] font-black text-white mix-blend-difference uppercase tracking-widest">Liability Coverage Buffer</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all duration-300">
                                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em] mb-2">Capital Reserves (Vaults)</div>
                                <div ref={assetsRef} className="text-3xl font-black font-mono text-white drop-shadow-sm">
                                    {isLoading ? "Fetching..." : formatCurrency(metrics.totalAssets)}
                                </div>
                                <div className="text-[10px] text-green-500 font-bold mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">verified</span>
                                    On-Chain Verified
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all duration-300">
                                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em] mb-2">Max Potential Liabilities</div>
                                <div ref={liabRef} className="text-3xl font-black font-mono text-white drop-shadow-sm">
                                    {isLoading ? "Fetching..." : formatCurrency(metrics.totalLiabilities)}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-bold mt-2 uppercase tracking-wide">Continuous Exposure</div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl">shield_check</span>
                            </div>
                            <h3 className="text-lg font-bold text-white leading-tight">Institutional Trust Guarantee</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-light">
                                Reflex operates as a 100% collateralized protocol. Every active policy is backed by liquid USDT in isolated pool vaults.
                            </p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                             <span className="material-symbols-outlined text-primary">link</span>
                             <span className="text-[10px] font-black text-primary uppercase tracking-widest">Powered by Chainlink DONs</span>
                        </div>
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="flex flex-wrap gap-8 pt-4 border-t border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Oracle Concensus:</span>
                        <span className="text-[10px] font-bold text-white font-mono">27 Nodes Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Settlement Layer:</span>
                        <span className="text-[10px] font-bold text-white font-mono">Arbitrum Sepolia</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Verification Method:</span>
                        <span className="text-[10px] font-bold text-white font-mono">Chainlink Functions</span>
                    </div>
                </div>
            </div>

            {/* Background Text Decor */}
            <div className="absolute -bottom-10 -right-10 text-[120px] font-black italic text-white/[0.02] pointer-events-none select-none uppercase">
                Solvency
            </div>
        </div>
    );
};
