"use client";

import React from 'react';
import { Shield, Activity, DollarSign, Landmark } from 'lucide-react';
import { PolicyCard } from '@/components/dashboard/PolicyCard';
import { PortfolioPerformanceChart } from '@/components/dashboard/PortfolioPerformanceChart';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { ESCROW_ABI, LIQUIDITY_POOL_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';
import { useState, useEffect } from 'react';

export function CommandCenterClient() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);

    // Fetch Global Stats
    const { data: totalAssets } = useReadContract({
        address: CONTRACTS.LP_POOL,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets',
    });

    const { data: totalMaxPayouts } = useReadContract({
        address: CONTRACTS.LP_POOL,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts',
    });

    const { data: policyIds } = useReadContract({
        address: CONTRACTS.ESCROW,
        abi: ESCROW_ABI,
        functionName: 'getUserPolicies',
        args: [address as `0x${string}`],
        query: { enabled: !!address }
    });

    useEffect(() => {
        const fetchPolicyDetails = async () => {
            if (!address || !policyIds || !publicClient) {
                setLoading(false);
                return;
            }

            try {
                const details = await Promise.all(
                    (policyIds as `0x${string}`[]).map(async (id) => {
                        const data = await publicClient.readContract({
                            address: CONTRACTS.ESCROW,
                            abi: ESCROW_ABI,
                            functionName: 'getPolicy',
                            args: [id]
                        });
                        return { id, data };
                    })
                );
                setPolicies(details);
            } catch (err) {
                console.error("Error fetching policy details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicyDetails();
    }, [address, policyIds, publicClient]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!publicClient) return;
            setLogsLoading(true);
            try {
                const [purchaseLogs, claimLogs] = await Promise.all([
                    publicClient.getLogs({
                        address: CONTRACTS.ESCROW,
                        event: ESCROW_ABI.find(x => x.type === 'event' && x.name === 'PolicyPurchased') as any,
                        fromBlock: BigInt(0), // Restricted by time/block in production
                    }),
                    publicClient.getLogs({
                        address: CONTRACTS.ESCROW,
                        event: ESCROW_ABI.find(x => x.type === 'event' && x.name === 'PolicyClaimed') as any,
                        fromBlock: BigInt(0),
                    })
                ]);

                const formattedLogs = [
                    ...purchaseLogs.map(log => ({
                        id: log.transactionHash,
                        target: (log.args as any).apiTarget || "Policy Purchased",
                        status: "Success",
                        timestamp: Date.now(), // Real block timestamp would be better but requires more calls
                        message: `New policy issued for ${formatUnits((log.args as any).premiumPaid, 6)} USDC premium.`
                    })),
                    ...claimLogs.map(log => ({
                        id: log.transactionHash,
                        target: "Claim Settled",
                        status: "Success",
                        timestamp: Date.now(),
                        message: `Parametric payout of ${formatUnits((log.args as any).payoutAmount, 6)} USDC executed.`
                    }))
                ].sort((a, b) => b.timestamp - a.timestamp);

                setLogs(formattedLogs);
            } catch (err) {
                console.error("Error fetching logs:", err);
            } finally {
                setLogsLoading(false);
            }
        };

        fetchLogs();
    }, [publicClient]);

    const activeCount = policies.filter(p => p.data[5]).length; // p.data[5] is isActive
    const tvlValue = totalAssets ? `$${(Number(formatUnits(totalAssets as bigint, 6)) / 1e6).toFixed(1)}M` : "$0.0M";
    const payoutValue = totalMaxPayouts ? `$${(Number(formatUnits(totalMaxPayouts as bigint, 6)) / 1e6).toFixed(1)}M` : "$0.0M";

    // Calculate personal stats
    const totalPersonalCoverage = policies.reduce((acc, p) => acc + Number(formatUnits(p.data[3], 6)), 0);
    const totalPersonalPremiums = policies.reduce((acc, p) => acc + Number(formatUnits(p.data[2], 6)), 0);

    // Original stats, updated to use new data
    const tvl = tvlValue;
    const claimsPaid = payoutValue; // Assuming totalMaxPayouts represents claims paid or potential claims
    const totalPremiums = `$${totalPersonalPremiums.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


    return (
        <div className="min-h-screen p-6 lg:p-12 space-y-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Command Center</h1>
                    <p className="text-slate-400 mt-2">Manage your parametric risk portfolio</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Portfolio Value</span>
                        <span className="text-lg font-bold text-foreground">$4,660,700.00</span>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Covered (TVL)" value={tvl} icon={<Shield className="text-primary w-5 h-5" />} trend="+12.5%" />
                <StatCard title="Total Premiums" value={totalPremiums} icon={<DollarSign className="text-amber-500 w-5 h-5" />} trend="+1.2%" />
                <StatCard title="Claims Settled" value={claimsPaid} icon={<Shield className="text-emerald-500 w-5 h-5" />} trend="+4.2%" />
                <StatCard title="Active Policies" value={activeCount.toString()} icon={<Activity className="text-blue-500 w-5 h-5" />} trend="+2" />
                <StatCard title="Governance Power" value="450.2k" icon={<Landmark className="text-purple-500 w-5 h-5" />} trend="Top 5%" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Insights Area */}
                <section className="lg:col-span-8 space-y-8">
                    {/* Performance Chart */}
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Portfolio Performance</h2>
                                <p className="text-sm text-slate-500">Historical growth of your protection assets</p>
                            </div>
                            <div className="flex gap-2">
                                {['1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
                                    <button key={range} className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${range === '1Y' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}>
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <PortfolioPerformanceChart />
                    </div>

                    {/* Active Policy List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-foreground">Your Policies</h2>
                            <button className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">View All</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => <PolicySkeleton key={i} />)
                            ) : policies.length === 0 ? (
                                <div className="col-span-2 p-12 text-center border border-dashed border-white/10 rounded-2xl">
                                    <p className="text-slate-500">No active policies found.</p>
                                </div>
                            ) : (
                                policies.map(policy => (
                                    <PolicyCard
                                        key={policy.id}
                                        policyId={policy.id}
                                        policyData={policy.data}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Recent Activity Feed */}
                <section className="lg:col-span-4 bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl h-fit">
                    <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> Network Activity
                    </h2>
                    <div className="space-y-6">
                        {logsLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-800" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-24 bg-slate-800 rounded" />
                                        <div className="h-3 w-full bg-slate-800 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            logs?.slice(0, 5).map(log => (
                                <div key={log.id} className="relative flex gap-4">
                                    <div className="absolute left-[3px] top-4 bottom-[-24px] w-[1px] bg-white/5" />
                                    <div className={`w-2 h-2 mt-1.5 rounded-full z-10 shrink-0 ${log.status === 'Success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : log.status === 'Reverted' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-bold text-foreground">{log.target}</span>
                                            <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{log.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-black/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <span className="text-sm text-slate-400 font-medium">{title}</span>
                <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
            </div>
            <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
                <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-primary'}`}>{trend}</span>
            </div>
        </div>
    );
}

function PolicySkeleton() {
    return (
        <div className="h-[200px] rounded-2xl border border-white/5 bg-black/40 p-5 animate-pulse flex flex-col justify-between">
            <div className="flex justify-between">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800" />
                    <div className="space-y-2 pt-1">
                        <div className="w-24 h-4 bg-slate-800 rounded" />
                        <div className="w-16 h-3 bg-slate-800 rounded" />
                    </div>
                </div>
                <div className="w-16 h-5 rounded-full bg-slate-800" />
            </div>
            <div className="space-y-3">
                <div className="w-full h-4 bg-slate-800 rounded" />
                <div className="w-3/4 h-4 bg-slate-800 rounded" />
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="w-32 h-3 bg-slate-800 rounded" />
            </div>
        </div>
    );
}
