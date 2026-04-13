"use client";

import React, { useState, useEffect } from 'react';
import { InstitutionalTooltip } from '@/components/ui/InstitutionalTooltip';
import { ShieldAlert, Landmark, Database, Info } from 'lucide-react';
import { AdminControl } from '@/components/governance/AdminControl';
import { TreasuryAnalytics } from '@/components/governance/TreasuryAnalytics';
import { LiveOracleConsole } from '@/components/analytics/LiveOracleConsole';

export default function AdminPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground flex items-center gap-4 tracking-tight">
                        <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                        Protocol Administration
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg font-light">
                        High-privileged command center for protocol governance, treasury oversight, and oracle monitoring.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest text-[10px]">Authorized Session Active</span>
                </div>
            </div>

            {/* Admin Controls Section */}
            <section id="controls">
                <AdminControl />
            </section>

            {/* Treasury & Oracle Oversight */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section id="treasury" className="space-y-6">
                    <TreasuryAnalytics />
                </section>

                <section id="oracle" className="space-y-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <InstitutionalTooltip title="Live Oracle Feed" content="A real-time console monitoring the Chainlink Decentralized Oracle Networks (DONs) and heartbeat verification signatures.">
                            <div className="flex items-center gap-3 cursor-help">
                                <Database className="w-6 h-6 text-emerald-500" />
                                <h2 className="text-2xl font-bold text-foreground">Live Oracle Feed</h2>
                                <Info className="w-4 h-4 text-zinc-500 opacity-50" />
                            </div>
                        </InstitutionalTooltip>
                    </div>
                    <div className="flex-1 min-h-[500px]">
                        <LiveOracleConsole />
                    </div>
                </section>
            </div>

            {/* Footer / Safety Notice */}
            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4">
                <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-500">Security Invariant Enforcement</p>
                    <p className="text-xs text-amber-500/70 leading-relaxed">
                        All administrative actions executed here are permanently recorded on the Avalanche Fuji network.
                        Actions involving treasury movement or protocol pausing require either direct owner signatures or decentralized relayer quorum consensus.
                    </p>
                </div>
            </div>
        </div>
    );
}
