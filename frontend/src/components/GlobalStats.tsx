"use client";

import React, { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { LIQUIDITY_POOL_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';

export function GlobalStats() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: totalAssets } = useReadContract({
        address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets',
        query: { enabled: mounted }
    });

    const { data: totalMaxPayouts } = useReadContract({
        address: CONTRACTS.LIQUIDITY_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts',
        query: { enabled: mounted }
    });

    if (!mounted) return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 animate-pulse">
                <span className="h-3 w-24 bg-slate-800 rounded"></span>
                <span className="h-8 w-32 bg-slate-800 rounded mt-2"></span>
            </div>
            <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 animate-pulse">
                <span className="h-3 w-24 bg-slate-800 rounded"></span>
                <span className="h-8 w-32 bg-slate-800 rounded mt-2"></span>
            </div>
        </div>
    );

    const tvl = totalAssets ? Number(formatUnits(totalAssets as bigint, 6)) : 12450000;
    const payouts = totalMaxPayouts ? Number(formatUnits(totalMaxPayouts as bigint, 6)) : 450000;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: val > 1000000 ? 'compact' : 'standard',
            maximumFractionDigits: 1
        }).format(val);
    };

    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 hover:border-primary/30 transition-colors group">
                <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Total Value Locked</span>
                <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {formatCurrency(tvl)}
                </span>
            </div>
            <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 hover:border-neon-cyan/30 transition-colors group">
                <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Active Protection</span>
                <span className="text-2xl font-bold text-foreground group-hover:text-neon-cyan transition-colors">
                    {formatCurrency(payouts)}
                </span>
            </div>
        </div>
    );
}
