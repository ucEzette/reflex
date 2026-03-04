"use client";

import React, { useState } from 'react';
import {
    ShieldAlert,
    TrendingUp,
    UserPlus,
    UserMinus,
    Pause,
    Play,
    RefreshCcw,
    Zap,
    Lock,
    Unlock,
    Shield
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminControl() {
    const [isPaused, setIsPaused] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [isManagingRelayers, setIsManagingRelayers] = useState(false);

    const handleTogglePause = () => {
        setIsPaused(!isPaused);
        toast.success(isPaused ? "Protocol Resumed" : "Protocol Paused", {
            description: isPaused ? "All markets are now accepting new policies." : "Emergency stop active. All markets are currently disabled.",
        });
    };

    const handleHarvestYield = () => {
        setIsHarvesting(true);
        toast.info("Triggering Yield Harvest...", {
            description: "Calculating performance fees from Aave yield profit."
        });

        setTimeout(() => {
            setIsHarvesting(false);
            toast.success("Performance Fee Harvested!", {
                description: "Treasury balance updated with 10% profit share."
            });
        }, 2000);
    };

    return (
        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                    Protocol Command Center
                </h2>
                <p className="text-slate-400 text-sm mt-1">High-privileged administrative controls for protocol governance and emergency management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Emergency Killswitch */}
                <div className={`p-6 rounded-2xl border transition-all ${isPaused ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${isPaused ? 'bg-red-500/20' : 'bg-white/10'}`}>
                            {isPaused ? <Play className="w-5 h-5 text-red-500" /> : <Pause className="w-5 h-5 text-slate-400" />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isPaused ? 'bg-red-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {isPaused ? 'Paused' : 'Active'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Emergency Pause</h3>
                    <p className="text-xs text-slate-400 font-light mb-6">Instantly halt all product creation and settlements across the entire ecosystem.</p>
                    <button
                        onClick={handleTogglePause}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isPaused ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                    >
                        {isPaused ? 'Resume Protocol' : 'Trigger Emergency Pause'}
                    </button>
                </div>

                {/* Yield Harvesting */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <Zap className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Harvest Performance</h3>
                    <p className="text-xs text-slate-400 font-light mb-6">Collect the 10% protocol performance fee from accumulated Aave yield profit.</p>
                    <button
                        onClick={handleHarvestYield}
                        disabled={isHarvesting}
                        className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-emerald-500/50 text-foreground text-xs font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        {isHarvesting ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        {isHarvesting ? 'Harvesting...' : 'Harvest Profits'}
                    </button>
                </div>

                {/* Relayer Management */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <Lock className="w-4 h-4 text-slate-500 group-hover:text-foreground transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Relayer Network</h3>
                    <p className="text-xs text-slate-400 font-light mb-6">Manage authorized relayers and adjust the M-of-N quorum threshold.</p>
                    <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-white/5 border border-white/10 hover:border-primary/50 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">
                            Add Relayer
                        </button>
                        <button className="flex-1 py-2 bg-white/5 border border-white/10 hover:border-red-500/50 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">
                            Adjust Quorum
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                <div className="flex items-center gap-2 mb-4">
                    <Unlock className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global State Variables</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total TVL</p>
                        <p className="text-xl font-bold text-foreground">$45,204,182</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Utilization Rate</p>
                        <p className="text-xl font-bold text-foreground">42.8%</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Unclaimed Fees</p>
                        <p className="text-xl font-bold text-emerald-400">$2.4k</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Active Quorum</p>
                        <p className="text-xl font-bold text-foreground">2 / 3</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
