"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Activity, DollarSign, History, RefreshCcw, Wallet, Bell, BellRing, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ActivePolicyCard } from '@/components/ui/ActivePolicyCard';
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
        <div className="min-h-screen bg-background p-6 lg:p-12 space-y-8 max-w-7xl mx-auto">

            {/* Mission Control Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Command Center</h1>
                    <p className="text-muted-foreground mt-2">Mission control for your active parametric risk portfolio.</p>
                </div>

                {/* User Status / Wallet / Notifications */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    {/* Notification Prefs */}
                    <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${notificationsEnabled ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : 'bg-accent/50 text-muted-foreground border-border hover:bg-accent'}`}
                    >
                        {notificationsEnabled ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        Alerts {notificationsEnabled ? 'On' : 'Off'}
                    </button>

                    {/* Wallet Status */}
                    <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 border-r border-border pr-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">0x74...A12b</span>
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                            <Wallet className="w-4 h-4 text-primary" />
                            <span className="font-bold text-sm text-foreground">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(12450.50)} <span className="text-[10px] text-muted-foreground">USDC</span>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Active Policy Column */}
                <section className="lg:col-span-8 space-y-8">

                    {/* Quick Buy Interface */}
                    <div className="bg-gradient-to-r from-primary/10 via-background to-background border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0 hidden sm:block">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="flex-1 w-full">
                            <h3 className="font-bold text-foreground text-sm mb-1 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary sm:hidden" />
                                Quick-Buy Coverage
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">Instantly insure new flights or events.</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                    value={quickBuyType}
                                    onChange={(e) => setQuickBuyType(e.target.value)}
                                    className="bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                >
                                    <option value="flight">Flight Delay</option>
                                    <option value="weather">Rain Check</option>
                                    <option value="web3">Gas Hedge</option>
                                </select>
                                <input
                                    type="text"
                                    value={quickBuyInput}
                                    onChange={(e) => setQuickBuyInput(e.target.value)}
                                    placeholder={quickBuyType === 'flight' ? "Flight # (e.g. EK202)" : "Enter parameters..."}
                                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                                />
                                <button className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
                                    Quote
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Missions */}
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" /> Active Policies
                            </h2>
                            <span className="bg-accent text-muted-foreground text-xs font-mono px-2 py-1 rounded">{policies.length} Live</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {policies.map(policy => (
                                <ActivePolicyCard key={policy.id} policy={policy} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right Column: Financials & Timeline */}
                <aside className="lg:col-span-4 space-y-8">

                    {/* PayoutWalletWidget */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none transition-all group-hover:bg-emerald-500/20" />

                        <div className="relative z-10 flex items-start justify-between mb-6">
                            <span className="text-sm text-muted-foreground font-medium">Yield & Recoveries</span>
                            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total USDC Saved / Claimed</p>
                            <p className="text-4xl font-bold text-foreground tracking-tight flex items-baseline gap-1">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(150.00).replace('$', '')}
                                <span className="text-sm font-medium text-muted-foreground uppercase">usdc</span>
                            </p>
                        </div>
                    </div>

                    {/* Timeline / Claims Log */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" /> Claims Log
                            </h2>
                            <button className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wider font-bold">
                                View All <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border/50 overflow-hidden">
                            {logs.map((log) => (
                                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-shrink-0 relative z-10 ${log.status === 'Success' ? 'bg-emerald-500' : log.status === 'Pending' ? 'bg-blue-500' : 'bg-red-500'}`}>
                                        {log.status === 'Success' && <CheckCircle2 className="w-3 h-3 text-background" />}
                                    </div>
                                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl bg-accent border border-border flex flex-col justify-center">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-foreground text-xs">{log.target}</span>
                                            <span className="font-mono text-[9px] text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-muted-foreground text-[11px] leading-relaxed">{log.message}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}
