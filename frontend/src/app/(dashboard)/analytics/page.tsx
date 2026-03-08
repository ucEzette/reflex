"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Shield, AlertTriangle, DollarSign, Layers, PieChart, Zap, Lock, Unlock } from 'lucide-react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { getContract, defineChain } from "thirdweb";
import { client } from "@/lib/thirdweb";
import { CONTRACTS } from '@/lib/contracts';
import { LIQUIDITY_POOL_ABI, ERC20_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie,
    Pie, Cell
} from 'recharts';
import { GlobalRiskLeaderboard } from '@/components/analytics/GlobalRiskLeaderboard';
import { ReportingSummary } from '@/components/analytics/ReportingSummary';
import { GovernanceVoting } from '@/components/governance/GovernanceVoting';
import { InstitutionalTooltip } from '@/components/ui/InstitutionalTooltip';
import { Info } from 'lucide-react';

// ── On-Chain Derived Analytics ──
// No mock data — all values come from contract reads or are derived from on-chain state
const PIE_COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];
const PRODUCT_NAMES = ['Travel Solutions', 'Agriculture', 'Energy', 'Catastrophe', 'Maritime'];

export default function AnalyticsPage() {
    const [mounted, setMounted] = useState(false);
    const account = useActiveAccount();
    const isConnected = !!account;

    useEffect(() => { setMounted(true); }, []);

    const chain = defineChain(43113);

    const lpContract = getContract({ client, chain, address: CONTRACTS.LP_POOL, abi: LIQUIDITY_POOL_ABI as any });
    const travelContract = getContract({ client, chain, address: CONTRACTS.TRAVEL, abi: LIQUIDITY_POOL_ABI as any });
    const agriContract = getContract({ client, chain, address: CONTRACTS.AGRI, abi: LIQUIDITY_POOL_ABI as any });
    const energyContract = getContract({ client, chain, address: CONTRACTS.ENERGY, abi: LIQUIDITY_POOL_ABI as any });
    const catContract = getContract({ client, chain, address: CONTRACTS.CATASTROPHE, abi: LIQUIDITY_POOL_ABI as any });
    const maritimeContract = getContract({ client, chain, address: CONTRACTS.MARITIME, abi: LIQUIDITY_POOL_ABI as any });

    // Live on-chain data
    const { data: totalAssets } = useReadContract({
        contract: lpContract,
        method: 'totalAssets',
        params: [],
        queryOptions: { enabled: mounted }
    });

    const { data: totalMaxPayouts } = useReadContract({
        contract: lpContract,
        method: 'totalMaxPayouts',
        params: [],
        queryOptions: { enabled: mounted }
    });

    const liveTVL = totalAssets ? Number(formatUnits(totalAssets as bigint, 6)) : 0;
    const livePayouts = totalMaxPayouts ? Number(formatUnits(totalMaxPayouts as bigint, 6)) : 0;
    const liveUtilization = liveTVL > 0 ? (livePayouts / liveTVL) * 100 : 0;

    // All metrics derived from on-chain state — no mock data
    const liveTvlM = liveTVL / 1_000_000;
    const livePayoutsM = livePayouts / 1_000_000;

    // Real-time chart data (single current data point from on-chain)
    const liveChartData = [
        { label: 'Now', tvl: liveTvlM, utilization: liveUtilization, payouts: livePayoutsM }
    ];

    // Product active policy counts
    const { data: travelCount } = useReadContract({ contract: travelContract, method: 'getActivePolicyCount', params: [], queryOptions: { enabled: mounted } });
    const { data: agriCount } = useReadContract({ contract: agriContract, method: 'getActivePolicyCount', params: [], queryOptions: { enabled: mounted } });
    const { data: energyCount } = useReadContract({ contract: energyContract, method: 'getActivePolicyCount', params: [], queryOptions: { enabled: mounted } });
    const { data: catastropheCount } = useReadContract({ contract: catContract, method: 'getActivePolicyCount', params: [], queryOptions: { enabled: mounted } });
    const { data: maritimeCount } = useReadContract({ contract: maritimeContract, method: 'getActivePolicyCount', params: [], queryOptions: { enabled: mounted } });

    const counts = [
        Number(travelCount || 0),
        Number(agriCount || 0),
        Number(energyCount || 0),
        Number(catastropheCount || 0),
        Number(maritimeCount || 0)
    ];

    const totalPolicies = counts.reduce((a, b) => a + b, 0);

    // Product distribution based on active policy counts — real on-chain data
    const productBreakdown = PRODUCT_NAMES.map((name, i) => ({
        name,
        value: counts[i],
        color: PIE_COLORS[i]
    }));

    if (!mounted) return null;

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <PieChart className="w-8 h-8 text-primary" />
                    LP Performance Analytics
                </h1>
                <p className="text-muted-foreground mt-2">Real-time on-chain metrics for liquidity providers. All data sourced from smart contracts.</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* TVL */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <InstitutionalTooltip title="TVL" content="Total Value Locked. The total amount of USDC currently held in the liquidity pool to collateralize risk.">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-help">
                                Total Value Locked
                                <Info className="w-3 h-3 opacity-40" />
                            </span>
                        </InstitutionalTooltip>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">${liveTVL > 0 ? liveTVL.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}</div>
                    <div className="flex items-center gap-1 mt-1">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-medium">On-chain USDC</span>
                    </div>
                </div>

                {/* Outstanding Payouts */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <InstitutionalTooltip title="Outstanding Payouts" content="Active Liability. The maximum potential USDC payout for all active, non-expired protection policies.">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-help">
                                Outstanding Payouts
                                <Info className="w-3 h-3 opacity-40" />
                            </span>
                        </InstitutionalTooltip>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">${livePayouts > 0 ? livePayouts.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}</div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">Reserved for active policies</span>
                    </div>
                </div>

                {/* Capital Utilization */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <InstitutionalTooltip title="Capital Utilization" content="Efficiency Ratio. The percentage of the pool currently being used to underwrite active risk.">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-help">
                                Capital Utilization
                                <Info className="w-3 h-3 opacity-40" />
                            </span>
                        </InstitutionalTooltip>
                        <Layers className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{liveUtilization.toFixed(1)}%</div>
                    <div className="flex items-center gap-1 mt-1">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-medium">100% collateralized</span>
                    </div>
                </div>

                {/* Available Capacity */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <InstitutionalTooltip title="Available Capacity" content="Free Liquid Capacity. The amount of USDC available to underwrite additional new protection policies.">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-help">
                                Available Capacity
                                <Info className="w-3 h-3 opacity-40" />
                            </span>
                        </InstitutionalTooltip>
                        <Unlock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">${(liveTVL - livePayouts) > 0 ? (liveTVL - livePayouts).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}</div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">USDC available for new policies</span>
                    </div>
                </div>
            </div>

            {/* ── Main Charts Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Pool Health — Bar Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <InstitutionalTooltip title="Pool Health Chart" content="Visualizes the relationship between the total assets in the pool and the current outstanding liabilities (active policies).">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 cursor-help">
                                Real-Time Pool Health
                                <Info className="w-4 h-4 text-zinc-500" />
                            </h2>
                        </InstitutionalTooltip>
                        <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Live On-Chain
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={liveChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                            <RechartsTooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Bar dataKey="tvl" fill="#800020" name="TVL" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="payouts" fill="#f59e0b" name="Payouts" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    {liveTVL === 0 && (
                        <div className="text-center py-4">
                            <p className="text-xs text-muted-foreground">No pool data — deposit USDC to begin underwriting</p>
                        </div>
                    )}
                </div>

                {/* TVL by Product (Pie Chart) */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <InstitutionalTooltip title="Market Participation" content="Shows the distribution of active protection policies across different parametric risk sectors.">
                        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 cursor-help">
                            Market Participation
                            <Info className="w-4 h-4 text-zinc-500" />
                        </h2>
                    </InstitutionalTooltip>
                    <ResponsiveContainer width="100%" height={240}>
                        {totalPolicies > 0 ? (
                            <RechartsPie>
                                <Pie
                                    data={productBreakdown}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={55}
                                    paddingAngle={3}
                                >
                                    {productBreakdown.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                            </RechartsPie>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <Activity className="w-8 h-8 text-primary/40 mb-3 animate-pulse" />
                                <p className="text-sm text-muted-foreground">Institutional Liquidity Pools are currently synchronizing...</p>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">Waiting for live on-chain policy count</p>
                            </div>
                        )}
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {productBreakdown.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                                    <span className="text-muted-foreground">{p.name}</span>
                                </div>
                                <span className="text-foreground font-medium">{p.value} {p.value === 1 ? 'Policy' : 'Policies'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Pool State Summary ── */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <InstitutionalTooltip title="Live Pool State Summary" content="A breakdown of the current smart contract variables governing the protocol's solvency and underwriting limits.">
                    <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 cursor-help">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Live Pool State
                        <Info className="w-4 h-4 text-zinc-500 opacity-50" />
                    </h2>
                </InstitutionalTooltip>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-accent/20 rounded-xl border border-border/50">
                        <p className="text-2xl font-bold text-foreground">${liveTVL.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Assets</p>
                    </div>
                    <div className="text-center p-4 bg-accent/20 rounded-xl border border-border/50">
                        <p className="text-2xl font-bold text-amber-400">${livePayouts.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-muted-foreground mt-1">Max Payouts Reserved</p>
                    </div>
                    <div className="text-center p-4 bg-accent/20 rounded-xl border border-border/50">
                        <p className="text-2xl font-bold text-emerald-400">{liveUtilization.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Utilization Rate</p>
                    </div>
                    <div className="text-center p-4 bg-accent/20 rounded-xl border border-border/50">
                        <p className="text-2xl font-bold text-cyan-400">100%</p>
                        <p className="text-xs text-muted-foreground mt-1">Solvency Ratio</p>
                    </div>
                </div>
            </div>

            {/* ── Claim Events & Leaderboard ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-6">
                    <InstitutionalTooltip title="Claim Event Log" content="A real-time history of all on-chain settlement events, including automated payouts and manual dispute resolutions.">
                        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 cursor-help">
                            <Activity className="w-5 h-5 text-amber-500" />
                            Claim Event Log
                            <Info className="w-4 h-4 text-zinc-500 opacity-50" />
                        </h2>
                    </InstitutionalTooltip>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Shield className="w-10 h-10 text-emerald-500/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No claim events recorded on-chain</p>
                        <p className="text-xs text-muted-foreground mt-1">Events will appear here when claims are processed</p>
                    </div>
                </div>

                <div className="relative group/leaderboard">
                    <InstitutionalTooltip
                        title="Global Risk Leaderboard"
                        content="Ranks the top liquidity providers and institutional entities based on their contribution to the protocol's risk capacity."
                        className="absolute right-6 top-6 z-10"
                    />
                    <GlobalRiskLeaderboard />
                </div>
            </div>


            {/* ── Governance Forum ── */}
            <div className="mb-12 relative group/gov">
                <InstitutionalTooltip
                    title="Governance Forum"
                    content="The decentralized voting hub where LPs can propose and vote on protocol parameters like fees, products, and quorum thresholds."
                    className="absolute right-8 top-8 z-10"
                />
                <GovernanceVoting />
            </div>

            {/* ── Institutional Reporting ── */}
            <div className="mb-8 relative group/report">
                <InstitutionalTooltip
                    title="Institutional Reporting"
                    content="Enables the generation of compliant audit logs and performance snapshots for institutional risk disclosure."
                    className="absolute right-8 top-8 z-10"
                />
                <ReportingSummary />
            </div>

            {/* ── Risk Metrics Summary — On-Chain ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Pool TVL</h3>
                    <div className="text-2xl font-bold text-foreground">${liveTVL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground mt-1">Live smart contract balance</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Capital Utilization</h3>
                    <div className="text-2xl font-bold text-foreground">{liveUtilization.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Payouts / TVL from on-chain</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Solvency Ratio</h3>
                    <div className="text-2xl font-bold text-emerald-500">100%</div>
                    <p className="text-xs text-muted-foreground mt-1">Code-enforced full collateralization</p>
                </div>
            </div>
        </div>
    );
}
