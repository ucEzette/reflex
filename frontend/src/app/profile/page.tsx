"use client";

import { useState } from "react";
import { PolicyDashboard } from "@/components/PolicyDashboard";
import { ActivePolicies } from "@/components/ActivePolicies";
import { Shield, History, PlusCircle } from "lucide-react";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('history');

    return (
        <div className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-neon-cyan/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="max-w-6xl w-full relative z-10 flex flex-col gap-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">User Profile</h1>
                        <p className="text-slate-400 max-w-2xl text-lg font-light">Manage your active protection policies and claim history.</p>
                    </div>

                    <div className="flex p-1 bg-zinc-900/50 border border-white/5 rounded-xl">
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <History className="w-4 h-4" />
                            History
                        </button>
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <PlusCircle className="w-4 h-4" />
                            New Policy
                        </button>
                    </div>
                </div>

                <div className="w-full">
                    {activeTab === 'new' ? (
                        <PolicyDashboard />
                    ) : (
                        <div className="space-y-6">
                            <ActivePolicies />

                            {/* Additional Stats / Info for History tab */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-2">Claim Success Rate</span>
                                    <span className="text-3xl font-bold text-emerald-400">100%</span>
                                    <p className="text-xs text-slate-400 mt-2 italic">Based on on-chain verification consensus</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-2">Avg. Payout Time</span>
                                    <span className="text-3xl font-bold text-white">~45s</span>
                                    <p className="text-xs text-slate-400 mt-2 italic">Cross-chain settlement via Avalanche</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-2">Total Savings</span>
                                    <span className="text-3xl font-bold text-primary">$0.00</span>
                                    <p className="text-xs text-slate-400 mt-2 italic">Recovered from negative events</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
