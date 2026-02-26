"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCcw, Bell, BellRing, Zap, CheckCircle2, TrendingUp, Filter } from 'lucide-react';
import { ActivePolicyCard } from '@/components/ui/ActivePolicyCard';
import { WalletManager } from '@/components/ui/WalletManager';
import { generateMockPolicies, generateOracleLogs } from '@/lib/mockState';

export default function UserDashboard() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const policies = generateMockPolicies();
    const logs = generateOracleLogs();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [quickBuyType, setQuickBuyType] = useState('flight');
    const [quickBuyInput, setQuickBuyInput] = useState('');

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">

            {/* Dashboard Header - Polymarket Style (Clean, Breadcrumb-like) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
                        <nav className="flex text-[10px] text-muted-foreground uppercase font-bold tracking-widest gap-2">
                            <span className="hover:text-foreground cursor-pointer transition-colors">Reflex</span>
                            <span>/</span>
                            <span className="text-foreground">Dashboard</span>
                        </nav>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-accent border border-border rounded-lg text-xs font-bold hover:bg-accent/80 transition-colors">
                        <Filter className="w-4 h-4" />
                        Sort & Filter
                    </button>
                    <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${notificationsEnabled ? 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10' : 'bg-transparent text-muted-foreground border-border hover:bg-accent'}`}
                    >
                        {notificationsEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        {notificationsEnabled ? 'Alerts On' : 'Muted'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Feed & Active Assets */}
                <section className="lg:col-span-8 space-y-6">

                    {/* Quick Quoting / Activity Hub */}
                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex-1 w-full">
                                <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Parametric Hedge Hub
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">Insure your risks with millisecond-grade precision.</p>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1 flex gap-2">
                                        <select
                                            value={quickBuyType}
                                            onChange={(e) => setQuickBuyType(e.target.value)}
                                            className="bg-accent border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                        >
                                            <option value="flight">Flight Delay</option>
                                            <option value="weather">Rain Check</option>
                                            <option value="web3">Gas Hedge</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={quickBuyInput}
                                            onChange={(e) => setQuickBuyInput(e.target.value)}
                                            placeholder={quickBuyType === 'flight' ? "Add Flight #" : "Parameters..."}
                                            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                    <button className="bg-primary text-primary-foreground font-bold px-8 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                        Instant Quote
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Assets Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">Active Coverage</h2>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
                                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Pending</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {policies.map(policy => (
                                <ActivePolicyCard key={policy.id} policy={policy} />
                            ))}
                        </div>
                    </div>

                    {/* Claims History Table-like list (Polymarket style) */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="font-bold text-foreground">Recent Activity</h2>
                            <button className="text-xs font-bold text-primary hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-border">
                            {logs.slice(0, 5).map((log) => (
                                <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {log.status === 'Success' ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{log.target}</p>
                                            <p className="text-xs text-muted-foreground">{log.message}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()}</p>
                                        <span className={`text-[10px] font-bold uppercase ${log.status === 'Success' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right Column: Wallet & Stats */}
                <aside className="lg:col-span-4 space-y-6">
                    {/* Integrated Wallet Manager */}
                    <WalletManager />

                    {/* Stats Widget */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h4 className="text-sm font-bold text-foreground mb-4">Account Stats</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Total Payouts</span>
                                <span className="text-sm font-bold text-foreground">$1,240.00</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Win Rate</span>
                                <span className="text-sm font-bold text-emerald-500">68%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Active Policies</span>
                                <span className="text-sm font-bold text-foreground">{policies.length}</span>
                            </div>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}
