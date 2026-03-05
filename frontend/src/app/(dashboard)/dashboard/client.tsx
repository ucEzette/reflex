"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCcw, Bell, BellRing, Zap, CheckCircle2, TrendingUp, Filter, Clock, Shield, AlertTriangle, Plane, CloudRain, Flame, Anchor } from 'lucide-react';
import { WalletManager } from '@/components/ui/WalletManager';
import { useUserPolicies, UserPolicy } from '@/hooks/useUserPolicies';
import { useAccount } from 'wagmi';
import { SkeletonCard, SkeletonStats } from '@/components/ui/Skeleton';

const IconMap: Record<string, React.ElementType> = {
    Plane, CloudRain, Zap, Flame, Anchor
};

const STATUS_LABELS: Record<number, { label: string; color: string; bg: string }> = {
    0: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    1: { label: 'Claimed', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    2: { label: 'Expired', color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
};

function PolicyCard({ policy }: { policy: UserPolicy }) {
    const Icon = IconMap[policy.icon] || Shield;
    const status = STATUS_LABELS[policy.status] || STATUS_LABELS[2];
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = Number(policy.expiresAt) - now;
    const isExpiringSoon = policy.status === 0 && expiresIn > 0 && expiresIn < 86400 * 3; // 3 days

    const formatTimeLeft = () => {
        if (expiresIn <= 0) return 'Expired';
        const days = Math.floor(expiresIn / 86400);
        const hours = Math.floor((expiresIn % 86400) / 3600);
        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    return (
        <div className={`bg-card border rounded-xl p-4 transition-all card-hover animate-fade-in-up ${isExpiringSoon ? 'border-amber-500/40' : 'border-border'}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status.bg}`}>
                        <Icon className={`w-4 h-4 ${status.color}`} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">{policy.productLabel}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{policy.policyId.slice(0, 10)}...{policy.policyId.slice(-6)}</p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
                <div>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Premium</p>
                    <p className="text-sm font-bold text-foreground">${(Number(policy.premium) / 1e6).toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Max Payout</p>
                    <p className="text-sm font-bold text-emerald-400">${(Number(policy.maxPayout) / 1e6).toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">
                        {policy.status === 0 ? 'Time Left' : 'Settled'}
                    </p>
                    <p className={`text-sm font-bold ${isExpiringSoon ? 'text-amber-400' : 'text-foreground'}`}>
                        {policy.status === 0 ? formatTimeLeft() : new Date(Number(policy.expiresAt) * 1000).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {policy.identifier && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Identifier</p>
                    <p className="text-xs text-zinc-400 font-mono">{policy.identifier}</p>
                </div>
            )}
        </div>
    );
}

export default function UserDashboard() {
    const [mounted, setMounted] = useState(false);
    const { isConnected } = useAccount();
    const {
        policies,
        activePolicies,
        claimedPolicies,
        expiredPolicies,
        totalPremiumsPaid,
        totalPayoutsReceived,
        isLoading,
    } = useUserPolicies();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'claimed' | 'expired'>('all');

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const filteredPolicies = filter === 'all' ? policies :
        filter === 'active' ? activePolicies :
            filter === 'claimed' ? claimedPolicies : expiredPolicies;

    const winRate = policies.length > 0 ? ((claimedPolicies.length / policies.length) * 100).toFixed(0) : '0';

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">

            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Policy Dashboard</h1>
                        <nav className="flex text-[10px] text-muted-foreground uppercase font-bold tracking-widest gap-2">
                            <span className="hover:text-foreground cursor-pointer transition-colors">Reflex</span>
                            <span>/</span>
                            <span className="text-foreground">My Policies</span>
                        </nav>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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

                {/* Left Column: Policies */}
                <section className="lg:col-span-8 space-y-6">

                    {/* KPI Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-card border border-border rounded-xl p-4">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Active Policies</p>
                            <p className="text-2xl font-black text-foreground mt-1">{activePolicies.length}</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Premiums</p>
                            <p className="text-2xl font-black text-foreground mt-1">${(Number(totalPremiumsPaid) / 1e6).toFixed(2)}</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Payouts Won</p>
                            <p className="text-2xl font-black text-emerald-400 mt-1">${(Number(totalPayoutsReceived) / 1e6).toFixed(2)}</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Claim Rate</p>
                            <p className="text-2xl font-black text-cyan-400 mt-1">{winRate}%</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {(['all', 'active', 'claimed', 'expired'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(128,0,32,0.3)]'
                                    : 'bg-white/5 text-zinc-500 border border-white/10 hover:text-foreground'}`}
                            >
                                {f} {f === 'all' ? `(${policies.length})` :
                                    f === 'active' ? `(${activePolicies.length})` :
                                        f === 'claimed' ? `(${claimedPolicies.length})` :
                                            `(${expiredPolicies.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Policies Grid */}
                    {isLoading ? (
                        <div className="space-y-6">
                            <SkeletonStats />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        </div>
                    ) : !isConnected ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-card border border-border rounded-xl">
                            <Shield className="w-12 h-12 text-zinc-700" />
                            <p className="text-sm text-zinc-500">Connect wallet to view your policies</p>
                        </div>
                    ) : filteredPolicies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-card border border-border rounded-xl">
                            <Zap className="w-12 h-12 text-zinc-700" />
                            <p className="text-sm text-zinc-500">{filter === 'all' ? 'No policies found. Purchase your first policy from the Market.' : `No ${filter} policies.`}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPolicies.map(policy => (
                                <PolicyCard key={policy.policyId} policy={policy} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Right Column: Wallet & Stats */}
                <aside className="lg:col-span-4 space-y-6">
                    <WalletManager />

                    {/* On-Chain Stats */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Insurance Summary
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Total Policies</span>
                                <span className="text-sm font-bold text-foreground">{policies.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Claims Won</span>
                                <span className="text-sm font-bold text-emerald-500">{claimedPolicies.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Expired (No Claim)</span>
                                <span className="text-sm font-bold text-zinc-500">{expiredPolicies.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Claim Rate</span>
                                <span className="text-sm font-bold text-cyan-400">{winRate}%</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Net P&L</span>
                                <span className={`text-sm font-bold ${Number(totalPayoutsReceived) - Number(totalPremiumsPaid) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ${((Number(totalPayoutsReceived) - Number(totalPremiumsPaid)) / 1e6).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Automation Status */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-500" /> Automation Status
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs text-zinc-400">Chainlink Keepers: <span className="text-emerald-400 font-bold">Active</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs text-zinc-400">DON Oracle Feed: <span className="text-emerald-400 font-bold">Connected</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs text-zinc-400">Auto-Expiration: <span className="text-emerald-400 font-bold">Enabled</span></span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
