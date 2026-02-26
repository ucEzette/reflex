"use client";

import React from 'react';
import { Policy } from '@/types/dashboard';
import { Plane, Cloud, CloudRain, Zap, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const iconMap = {
    Flight: Plane,
    Cloud: Cloud,
    Weather: CloudRain,
    Energy: Zap
};

interface PolicyCardProps {
    policy: Policy;
    onClick?: () => void;
}

export function PolicyCard({ policy, onClick }: PolicyCardProps) {
    const Icon = iconMap[policy.type];
    
    const isClaimable = policy.status === 'Claimable';
    const isActive = policy.status === 'Active';

    return (
        <article 
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-2xl border bg-black/40 backdrop-blur-xl p-5 transition-all hover:bg-black/60 cursor-pointer",
                isClaimable ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-white/5 shadow-lg",
                isActive ? "hover:border-primary/30" : ""
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2.5 rounded-xl border",
                        isClaimable ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        isActive ? "bg-primary/10 border-primary/20 text-primary" :
                        "bg-slate-800/50 border-slate-700 text-slate-400"
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white tracking-tight">{policy.metadata.flightNumber || policy.metadata.serviceName || policy.metadata.location}</h3>
                        <p className="text-xs text-slate-400 font-mono">{policy.id}</p>
                    </div>
                </div>
                <StatusBadge status={policy.status} />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">Coverage</span>
                    <span className="text-lg font-bold text-white tracking-tight">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(policy.payout).replace('$', '')} <span className="text-xs text-slate-500 font-medium">USDC</span>
                    </span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">Premium</span>
                    <span className="text-sm font-medium text-slate-300">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(policy.premium).replace('$', '')} <span className="text-[10px] text-slate-500">USDC</span>
                    </span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires {new Date(policy.expiration).toLocaleDateString()}</span>
                </div>
                {isClaimable && (
                    <button className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg hover:bg-emerald-400/20 transition-colors">
                        Claim Now
                    </button>
                )}
            </div>
        </article>
    );
}

function StatusBadge({ status }: { status: Policy['status'] }) {
    switch(status) {
        case 'Active':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Active
                </span>
            );
        case 'Claimable':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest border border-amber-500/20">
                    <AlertCircle className="w-3 h-3" /> Claimable
                </span>
            );
        case 'Processing':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest border border-blue-500/20">
                    <span className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full" /> Processing
                </span>
            );
        case 'Claimed':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-700">
                    <CheckCircle2 className="w-3 h-3" /> Claimed
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-700">
                    Expired
                </span>
            );
    }
}
