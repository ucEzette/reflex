"use client";

import React from 'react';
import { Shield, Activity, DollarSign } from 'lucide-react';
import { PolicyCard } from '@/components/dashboard/PolicyCard';
import { useActivePolicies, useOracleFeed } from '@/hooks/dashboard';

export default function CommandCenter() {
    const { data: policies, isLoading: policiesLoading } = useActivePolicies();
    const { data: logs, isLoading: logsLoading } = useOracleFeed();

    const activeCount = policies?.filter(p => p.status === 'Active').length || 0;
    const tvl = "$4,521,000"; 
    const claimsPaid = "$124,500";

    return (
        <div className="min-h-screen p-6 lg:p-12 space-y-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
                <p className="text-slate-400 mt-2">Manage your parametric risk portfolio</p>
            </header>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Covered (TVL)" value={tvl} icon={<Shield className="text-primary w-5 h-5" />} trend="+12.5%" />
                <StatCard title="Claims Paid" value={claimsPaid} icon={<DollarSign className="text-emerald-500 w-5 h-5" />} trend="+4.2%" />
                <StatCard title="Active Policies" value={activeCount.toString()} icon={<Activity className="text-blue-500 w-5 h-5" />} trend="+2" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Active Policy List */}
                <section className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white">Your Policies</h2>
                        <button className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">View All</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {policiesLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <PolicySkeleton key={i} />)
                        ) : policies?.length === 0 ? (
                            <div className="col-span-2 p-12 text-center border border-dashed border-white/10 rounded-2xl">
                                <p className="text-slate-500">No active policies found.</p>
                            </div>
                        ) : (
                            policies?.map(policy => (
                                <PolicyCard key={policy.id} policy={policy} />
                            ))
                        )}
                    </div>
                </section>

                {/* Recent Activity Feed */}
                <section className="lg:col-span-4 bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl h-fit">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
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
                                            <span className="text-xs font-bold text-slate-300">{log.target}</span>
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
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
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
