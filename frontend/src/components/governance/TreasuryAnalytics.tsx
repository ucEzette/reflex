"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { InstitutionalTooltip } from '@/components/ui/InstitutionalTooltip';
import { DollarSign, TrendingUp, Landmark, Shield, ArrowUpRight, ArrowDownRight, Activity, Info } from 'lucide-react';

const treasuryData = [
    { month: 'Sep', revenue: 45000, yield: 12000, claims: 5000 },
    { month: 'Oct', revenue: 68000, yield: 18000, claims: 12000 },
    { month: 'Nov', revenue: 92000, yield: 24000, claims: 0 },
    { month: 'Dec', revenue: 125000, yield: 31000, claims: 45000 },
    { month: 'Jan', revenue: 148000, yield: 38000, claims: 82000 },
    { month: 'Feb', revenue: 195000, yield: 46000, claims: 15000 },
    { month: 'Mar', revenue: 242000, yield: 55000, claims: 5000 },
];

const reserveAllocation = [
    { name: 'Claims Buffer', value: 4500000, color: '#800020' },
    { name: 'Aave aUSDC', value: 8200000, color: '#22c55e' },
    { name: 'Protocol Treasury', value: 1200000, color: '#8b5cf6' },
    { name: 'Operational Fund', value: 300000, color: '#f59e0b' },
];

export function TreasuryAnalytics() {
    const totalAssets = reserveAllocation.reduce((sum, item) => sum + item.value, 0);
    const lastMonth = treasuryData[treasuryData.length - 1];
    const prevMonth = treasuryData[treasuryData.length - 2];

    const revenueGrowth = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <InstitutionalTooltip title="DAO Treasury Oversight" content="Provides transparency into protocol revenue, administrative reserves, and secondary yield performance from Aave V3.">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 cursor-help">
                            <Landmark className="w-6 h-6 text-emerald-400" />
                            DAO Treasury Oversight
                            <Info className="w-4 h-4 text-zinc-500 opacity-50" />
                        </h2>
                    </InstitutionalTooltip>
                    <p className="text-slate-400 text-sm mt-1">Real-time transparency into protocol revenue, reserves, and yield performance.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest block">Treasury Health</span>
                        <span className="text-sm font-bold text-foreground">Overcollateralized</span>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Total Value Locked</span>
                        <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">${(totalAssets / 1000000).toFixed(1)}M</div>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">+4.2%</span>
                        <span className="text-slate-500">vs last week</span>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Accumulated Fees</span>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">${(lastMonth.revenue / 1000).toFixed(0)}k</div>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">+{revenueGrowth.toFixed(1)}%</span>
                        <span className="text-slate-500">this month</span>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Aave Yield (aUSDC)</span>
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">${(lastMonth.yield / 1000).toFixed(1)}k</div>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <Activity className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-400 font-bold">4.82% APY</span>
                        <span className="text-slate-500">variable baseline</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue vs Yield Trend */}
                <div className="lg:col-span-8 bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-foreground mb-6">Revenue & Yield Growth</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={treasuryData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#800020" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#800020" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                                    itemStyle={{ fontSize: 12 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#800020" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Protocol Fees" />
                                <Area type="monotone" dataKey="yield" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorYield)" name="Aave Yield" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Capital Allocation */}
                <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl flex flex-col">
                    <h3 className="text-lg font-bold text-foreground mb-6">Asset Allocation</h3>
                    <div className="flex-1 min-h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reserveAllocation} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" hide />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {reserveAllocation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-3">
                        {reserveAllocation.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[11px] text-slate-500 font-medium">{item.name}</span>
                                </div>
                                <span className="text-[11px] text-foreground font-bold">${(item.value / 1000000).toFixed(1)}M</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
