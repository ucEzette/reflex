"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, Shield, AlertTriangle, DollarSign, Layers, PieChart, ArrowUpRight, ArrowDownRight, RefreshCcw, Zap, Lock, Unlock } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { LIQUIDITY_POOL_ABI, ERC20_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie,
    Pie, Cell, Legend, ComposedChart
} from 'recharts';
import { GlobalRiskLeaderboard } from '@/components/analytics/GlobalRiskLeaderboard';
import { ReportingSummary } from '@/components/analytics/ReportingSummary';
import { GovernanceVoting } from '@/components/governance/GovernanceVoting';
import { TreasuryAnalytics } from '@/components/governance/TreasuryAnalytics';
import { AdminControl } from '@/components/governance/AdminControl';
import { LiveOracleConsole } from '@/components/analytics/LiveOracleConsole';

// ── Mock Analytics Data ──
const RISK_FREE_RATE = 4.2; // Aave baseline APY

const historicalData = [
    { month: 'Sep', tvl: 2.1, aaveYield: 4.1, underwYield: 8.2, totalYield: 12.3, utilization: 38, drawdown: 0, sharpe: 1.42 },
    { month: 'Oct', tvl: 3.4, aaveYield: 4.0, underwYield: 9.8, totalYield: 13.8, utilization: 45, drawdown: -2.1, sharpe: 1.51 },
    { month: 'Nov', tvl: 5.2, aaveYield: 4.2, underwYield: 11.4, totalYield: 15.6, utilization: 52, drawdown: 0, sharpe: 1.68 },
    { month: 'Dec', tvl: 7.8, aaveYield: 4.3, underwYield: 14.1, totalYield: 18.4, utilization: 61, drawdown: -5.3, sharpe: 1.45 },
    { month: 'Jan', tvl: 9.1, aaveYield: 4.1, underwYield: 12.8, totalYield: 16.9, utilization: 72, drawdown: -8.7, sharpe: 1.32 },
    { month: 'Feb', tvl: 11.5, aaveYield: 4.2, underwYield: 15.9, totalYield: 20.1, utilization: 68, drawdown: -3.2, sharpe: 1.71 },
    { month: 'Mar', tvl: 14.2, aaveYield: 4.4, underwYield: 18.2, totalYield: 22.6, utilization: 75, drawdown: 0, sharpe: 1.89 },
];

const productBreakdown = [
    { name: 'Travel Solutions', tvl: 4.5, apy: 14.2, utilization: 65, claims: 12, premiums: 0.64, color: '#ef4444' },
    { name: 'Agriculture', tvl: 8.2, apy: 18.5, utilization: 82, claims: 3, premiums: 1.52, color: '#22c55e' },
    { name: 'Energy', tvl: 5.1, apy: 12.8, utilization: 45, claims: 7, premiums: 0.65, color: '#f59e0b' },
    { name: 'Catastrophe', tvl: 12.5, apy: 22.4, utilization: 98, claims: 1, premiums: 2.80, color: '#8b5cf6' },
    { name: 'Maritime', tvl: 3.6, apy: 15.1, utilization: 58, claims: 5, premiums: 0.54, color: '#06b6d4' },
];

const drawdownEvents = [
    { date: 'Oct 14', event: 'Hurricane Milton Claims', amount: -2.1, product: 'Catastrophe' },
    { date: 'Dec 22', event: 'Winter Storm Freeze (ERCOT)', amount: -5.3, product: 'Energy' },
    { date: 'Jan 08', event: 'Coral Sea Cyclone Port Closures', amount: -8.7, product: 'Maritime' },
    { date: 'Feb 15', event: 'Midwest Drought Index Breach', amount: -3.2, product: 'Agriculture' },
];

const PIE_COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();
    const [activeChart, setActiveChart] = useState<'yield' | 'tvl' | 'utilization'>('yield');

    useEffect(() => { setMounted(true); }, []);

    // Live on-chain data
    const { data: totalAssets } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets',
        query: { enabled: mounted }
    });

    const { data: totalMaxPayouts } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts',
        query: { enabled: mounted }
    });

    const liveTVL = totalAssets ? Number(formatUnits(totalAssets as bigint, 6)) : 0;
    const livePayouts = totalMaxPayouts ? Number(formatUnits(totalMaxPayouts as bigint, 6)) : 0;
    const liveUtilization = liveTVL > 0 ? (livePayouts / liveTVL) * 100 : 0;

    // Calculate aggregated metrics
    const latestData = historicalData[historicalData.length - 1];
    const prevData = historicalData[historicalData.length - 2];
    const totalPremiums = productBreakdown.reduce((sum, p) => sum + p.premiums, 0);
    const totalClaims = productBreakdown.reduce((sum, p) => sum + p.claims, 0);
    const maxDrawdown = Math.min(...historicalData.map(d => d.drawdown));
    const avgSharpe = historicalData.reduce((s, d) => s + d.sharpe, 0) / historicalData.length;

    if (!mounted) return null;

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <PieChart className="w-8 h-8 text-primary" />
                    LP Performance Analytics
                </h1>
                <p className="text-muted-foreground mt-2">Institutional-grade risk and return metrics for liquidity providers.</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Sharpe Ratio */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sharpe Ratio</span>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{latestData.sharpe.toFixed(2)}</div>
                    <div className="flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-medium">
                            +{((latestData.sharpe - prevData.sharpe) / prevData.sharpe * 100).toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                    </div>
                </div>

                {/* Max Drawdown */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Max Drawdown</span>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{maxDrawdown.toFixed(1)}%</div>
                    <div className="flex items-center gap-1 mt-1">
                        <ArrowDownRight className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-500 font-medium">Jan 08</span>
                        <span className="text-xs text-muted-foreground ml-1">Cyclone event</span>
                    </div>
                </div>

                {/* Blended APY */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Blended APY</span>
                        <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{latestData.totalYield.toFixed(1)}%</div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">
                            {RISK_FREE_RATE}% Aave + {latestData.underwYield.toFixed(1)}% underwriting
                        </span>
                    </div>
                </div>

                {/* Utilization */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Capital Utilization</span>
                        <Layers className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{liveTVL > 0 ? liveUtilization.toFixed(1) : latestData.utilization}%</div>
                    <div className="flex items-center gap-1 mt-1">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-medium">100% collateralized</span>
                    </div>
                </div>
            </div>

            {/* ── Main Charts Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Historical Yield Curve (2/3 width) */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-foreground">Historical Yield Curve</h2>
                        <div className="flex gap-2">
                            {(['yield', 'tvl', 'utilization'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveChart(tab)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeChart === tab ? 'bg-primary text-white' : 'bg-accent/50 text-muted-foreground hover:text-foreground'}`}
                                >
                                    {tab === 'yield' ? 'Yield' : tab === 'tvl' ? 'TVL' : 'Utilization'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        {activeChart === 'yield' ? (
                            <ComposedChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} unit="%" />
                                <RechartsTooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Area type="monotone" dataKey="aaveYield" stackId="1" fill="rgba(34,197,94,0.15)" stroke="#22c55e" name="Aave Baseline" />
                                <Area type="monotone" dataKey="underwYield" stackId="1" fill="rgba(128,0,32,0.2)" stroke="#800020" name="Underwriting Premium" />
                                <Line type="monotone" dataKey="totalYield" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Blended APY" />
                            </ComposedChart>
                        ) : activeChart === 'tvl' ? (
                            <AreaChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} unit="M" />
                                <RechartsTooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Area type="monotone" dataKey="tvl" fill="rgba(128,0,32,0.3)" stroke="#800020" strokeWidth={2} name="TVL ($M)" />
                            </AreaChart>
                        ) : (
                            <AreaChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} unit="%" />
                                <RechartsTooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Area type="monotone" dataKey="utilization" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" strokeWidth={2} name="Utilization %" />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* TVL by Product (Pie Chart) */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-lg font-bold text-foreground mb-6">TVL by Product</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <RechartsPie>
                            <Pie
                                data={productBreakdown}
                                dataKey="tvl"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                innerRadius={55}
                                paddingAngle={3}
                            >
                                {productBreakdown.map((entry, index) => (
                                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                        </RechartsPie>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {productBreakdown.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                                    <span className="text-muted-foreground">{p.name}</span>
                                </div>
                                <span className="text-foreground font-medium">${p.tvl}M</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Product Performance Table ── */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Per-Product Performance
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Product</th>
                                <th className="text-right py-3 px-4 text-muted-foreground font-medium">TVL</th>
                                <th className="text-right py-3 px-4 text-muted-foreground font-medium">APY</th>
                                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Utilization</th>
                                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Premiums</th>
                                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Claims</th>
                                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Loss Ratio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productBreakdown.map((product, i) => {
                                const lossRatio = product.premiums > 0 ? ((product.claims * 0.15) / product.premiums * 100) : 0;
                                return (
                                    <tr key={i} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ background: product.color }} />
                                                <span className="font-medium text-foreground">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4 text-foreground font-medium">${product.tvl}M</td>
                                        <td className="text-right py-3 px-4">
                                            <span className="text-emerald-500 font-semibold">{product.apy}%</span>
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 bg-accent/30 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full transition-all"
                                                        style={{
                                                            width: `${product.utilization}%`,
                                                            background: product.utilization > 90 ? '#ef4444' : product.utilization > 70 ? '#f59e0b' : '#22c55e'
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-muted-foreground">{product.utilization}%</span>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4 text-foreground">${product.premiums}M</td>
                                        <td className="text-right py-3 px-4 text-foreground">{product.claims}</td>
                                        <td className="text-right py-3 px-4">
                                            <span className={`font-medium ${lossRatio > 50 ? 'text-red-500' : lossRatio > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {lossRatio.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-border">
                                <td className="py-3 px-4 font-bold text-foreground">Total</td>
                                <td className="text-right py-3 px-4 font-bold text-foreground">
                                    ${productBreakdown.reduce((s, p) => s + p.tvl, 0).toFixed(1)}M
                                </td>
                                <td className="text-right py-3 px-4 font-bold text-emerald-500">
                                    {(productBreakdown.reduce((s, p) => s + p.apy, 0) / productBreakdown.length).toFixed(1)}%
                                </td>
                                <td className="text-right py-3 px-4 font-bold text-muted-foreground">
                                    {(productBreakdown.reduce((s, p) => s + p.utilization, 0) / productBreakdown.length).toFixed(0)}%
                                </td>
                                <td className="text-right py-3 px-4 font-bold text-foreground">${totalPremiums.toFixed(2)}M</td>
                                <td className="text-right py-3 px-4 font-bold text-foreground">{totalClaims}</td>
                                <td className="text-right py-3 px-4 font-bold text-muted-foreground">—</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* ── Drawdown Events & Leaderboard ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-500" />
                        Drawdown Event Log
                    </h2>
                    <div className="space-y-3">
                        {drawdownEvents.map((event, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-accent/20 border border-border/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <TrendingDown className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{event.event}</p>
                                        <p className="text-xs text-muted-foreground">{event.date} · {event.product}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-red-500">{event.amount}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <GlobalRiskLeaderboard />
            </div>

            {/* ── Treasury Oversight & Live Oracle ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
                <TreasuryAnalytics />
                <div className="h-[500px]">
                    <LiveOracleConsole />
                </div>
            </div>

            {/* ── Admin Command Center (Owner only) ── */}
            <div className="mb-12">
                <AdminControl />
            </div>

            {/* ── Governance Forum ── */}
            <div className="mb-12">
                <GovernanceVoting />
            </div>

            {/* ── Institutional Reporting ── */}
            <div className="mb-8">
                <ReportingSummary />
            </div>

            {/* ── Risk Metrics Summary ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Annualized Volatility</h3>
                    <div className="text-2xl font-bold text-foreground">11.4%</div>
                    <p className="text-xs text-muted-foreground mt-1">Standard deviation of monthly returns</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Sortino Ratio</h3>
                    <div className="text-2xl font-bold text-foreground">2.31</div>
                    <p className="text-xs text-muted-foreground mt-1">Downside risk-adjusted return</p>
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
