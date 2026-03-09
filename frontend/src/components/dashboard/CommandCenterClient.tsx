"use client";
import React from 'react';
import { Shield, Activity, DollarSign, Landmark } from 'lucide-react';
import { PolicyCard } from '@/components/dashboard/PolicyCard';
import { PortfolioPerformanceChart } from '@/components/dashboard/PortfolioPerformanceChart';
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { readContract } from "wagmi/actions";
import { config } from '@/lib/wagmiConfig';
import { CONTRACTS, ESCROW_ABI, TRAVEL_ABI, GENERIC_PRODUCT_ABI, LP_POOL_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';
import { useState, useEffect, useMemo } from 'react';

export function CommandCenterClient() {
    const { address } = useAccount();
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);

    // Global Stats Aggregation
    const poolAddresses = [
        CONTRACTS.LP_TRAVEL,
        CONTRACTS.LP_AGRI,
        CONTRACTS.LP_ENERGY,
        CONTRACTS.LP_CAT,
        CONTRACTS.LP_MARITIME
    ];

    const { data: globalStats } = useReadContracts({
        contracts: [
            ...poolAddresses.map(address => ({
                address: address as `0x${string}`,
                abi: LP_POOL_ABI,
                functionName: 'totalAssets',
            })),
            ...poolAddresses.map(address => ({
                address: address as `0x${string}`,
                abi: LP_POOL_ABI,
                functionName: 'totalMaxPayouts',
            }))
        ]
    });

    const totalAssets = useMemo(() => {
        if (!globalStats) return BigInt(0);
        return globalStats.slice(0, 5).reduce((acc, res) => acc + (res.result as bigint || BigInt(0)), BigInt(0));
    }, [globalStats]);

    const totalMaxPayouts = useMemo(() => {
        if (!globalStats) return BigInt(0);
        return globalStats.slice(5, 10).reduce((acc, res) => acc + (res.result as bigint || BigInt(0)), BigInt(0));
    }, [globalStats]);

    // Multi-contract User Policy Fetching
    const { data: escrowIds } = useReadContract({ address: CONTRACTS.ESCROW as `0x${string}`, abi: ESCROW_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address } });
    const { data: travelIds } = useReadContract({ address: CONTRACTS.TRAVEL as `0x${string}`, abi: TRAVEL_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address } });
    const { data: agriIds } = useReadContract({ address: CONTRACTS.AGRI as `0x${string}`, abi: GENERIC_PRODUCT_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address } });
    const { data: energyIds } = useReadContract({ address: CONTRACTS.ENERGY as `0x${string}`, abi: GENERIC_PRODUCT_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address } });
    const { data: catIds } = useReadContract({ address: CONTRACTS.CATASTROPHE as `0x${string}`, abi: GENERIC_PRODUCT_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address } });
    const { data: maritimeIds } = useReadContract({ address: CONTRACTS.MARITIME as `0x${string}`, abi: GENERIC_PRODUCT_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address } });

    useEffect(() => {
        const fetchAllPolicyDetails = async () => {
            if (!address) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const results: any[] = [];

                // Helper to fetch details for a set of IDs
                const fetchGroup = async (ids: string[], contract: string, abi: any, isEscrow: boolean) => {
                    const group = await Promise.all(
                        ids.map(async (id) => {
                            try {
                                const data = await readContract(config, {
                                    address: contract as `0x${string}`,
                                    abi: abi,
                                    functionName: isEscrow ? 'getPolicy' : 'policies',
                                    args: [id]
                                }) as any[];

                                // Normalizing different product struct returns
                                if (isEscrow) {
                                    return { id, data };
                                } else {
                                    // Product mapping (Travel): [holder, premium, payout, status, expiry, flightId]
                                    // Product mapping (Agri/Generic): [holder, premium, payout, strike, exit, status, expiry, zone]
                                    // Escrow format: [holder, target, premium, payout, expiry, isActive, isClaimed]

                                    if (abi === TRAVEL_ABI) {
                                        const [holder, premium, payout, status, expiry, target] = data;
                                        return {
                                            id,
                                            data: [holder, target, premium, payout, expiry, status === 0, status === 1]
                                        };
                                    } else {
                                        const [holder, premium, payout, , , status, expiry, target] = data;
                                        return {
                                            id,
                                            data: [holder, target, premium, payout, expiry, status === 0, status === 1]
                                        };
                                    }
                                }
                            } catch (e) {
                                console.error(`Failed to fetch policy ${id} from ${contract}:`, e);
                                return null;
                            }
                        })
                    );
                    results.push(...group.filter(item => item !== null));
                };

                if (escrowIds) await fetchGroup(escrowIds as string[], CONTRACTS.ESCROW, ESCROW_ABI, true);
                if (travelIds) await fetchGroup(travelIds as string[], CONTRACTS.TRAVEL, TRAVEL_ABI, false);
                if (agriIds) await fetchGroup(agriIds as string[], CONTRACTS.AGRI, GENERIC_PRODUCT_ABI, false);
                if (energyIds) await fetchGroup(energyIds as string[], CONTRACTS.ENERGY, GENERIC_PRODUCT_ABI, false);
                if (catIds) await fetchGroup(catIds as string[], CONTRACTS.CATASTROPHE, GENERIC_PRODUCT_ABI, false);
                if (maritimeIds) await fetchGroup(maritimeIds as string[], CONTRACTS.MARITIME, GENERIC_PRODUCT_ABI, false);

                setPolicies(results);
            } catch (err) {
                console.error("Error fetching policy details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPolicyDetails();
    }, [address, escrowIds, travelIds, agriIds, energyIds, catIds, maritimeIds]);

    useEffect(() => {
        const fetchLogs = async () => {
            setLogsLoading(true);
            try {
                setLogs([]);
            } catch (err) {
                console.error("Error fetching logs:", err);
            } finally {
                setLogsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const activeCount = policies.filter(p => p.data[5]).length; // p.data[5] is isActive
    const tvlValue = totalAssets ? `$${(Number(formatUnits(totalAssets as bigint, 6)) / 1e6).toFixed(1)}M` : "$0.0M";
    const payoutValue = totalMaxPayouts ? `$${(Number(formatUnits(totalMaxPayouts as bigint, 6)) / 1e6).toFixed(1)}M` : "$0.0M";

    // Calculate personal stats
    const totalPersonalCoverage = policies.reduce((acc, p) => acc + Number(formatUnits(p.data[3], 6)), 0);
    const totalPersonalPremiums = policies.reduce((acc, p) => acc + Number(formatUnits(p.data[2], 6)), 0);

    const tvl = tvlValue;
    const claimsPaid = payoutValue;
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
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Personal Coverage</span>
                        <span className="text-lg font-bold text-foreground">${totalPersonalCoverage.toLocaleString()}</span>
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
                            <button onClick={() => {
                                const el = document.getElementById('active-policies');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }} className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">View All</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => <PolicySkeleton key={i} />)
                            ) : policies.length === 0 ? (
                                <div className="col-span-2 p-12 text-center border border-dashed border-white/10 rounded-2xl">
                                    <p className="text-slate-500">No active policies found.</p>
                                </div>
                            ) : (
                                policies.slice(0, 4).map(policy => (
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
                            <div className="text-center py-8">
                                <p className="text-xs text-slate-500">Live network activity logs streaming...</p>
                            </div>
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
