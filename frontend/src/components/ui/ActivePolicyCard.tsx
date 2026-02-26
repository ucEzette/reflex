import React, { useState } from 'react';
import { ActivePolicy } from '../../types/core';
import { Plane, Cloud, CloudRain, Zap, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IconMap = {
    Flight: Plane,
    Cloud: Cloud,
    Weather: CloudRain,
    Web3: Zap
};

export function ActivePolicyCard({ policy }: { policy: ActivePolicy }) {
    const [expanded, setExpanded] = useState(false);
    const Icon = IconMap[policy.type];

    const getStatusColor = () => {
        if (policy.status === "Monitoring") return "bg-emerald-500";
        if (policy.status === "Risk Detected") return "bg-amber-500";
        if (policy.status === "Claim Triggered") return "bg-red-500";
        return "bg-blue-500";
    };

    return (
        <article className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors shadow-sm">
            {/* Header */}
            <header className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent text-primary border border-border">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-lg tracking-tight">{policy.id}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{new Date(policy.purchaseDate).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-full border border-border">
                    <span className="relative flex h-2 w-2">
                        {policy.status !== 'Settled' && (
                            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", getStatusColor())} />
                        )}
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", getStatusColor())} />
                    </span>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{policy.status}</span>
                </div>
            </header>

            {/* Context Data Row */}
            <div className="bg-accent/30 rounded-xl p-4 mb-4 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{policy.context}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border/50">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Premium</p>
                        <p className="font-mono text-sm text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(policy.premium)} USDC</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Max Payout</p>
                        <p className="font-mono text-sm text-foreground font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(policy.payout)} USDC</p>
                    </div>
                </div>
            </div>

            {/* Oracle Proof Accordion */}
            <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    View Oracle Proof
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
            </button>

            {expanded && (
                <div className="mt-3 p-3 bg-black/40 rounded-lg border border-border/50 overflow-x-auto">
                    <pre className="text-[10px] font-mono text-emerald-400">
                        <code>{policy.oracleData.rawPayload}</code>
                    </pre>
                    <p className="text-[9px] text-muted-foreground mt-2 block w-full text-right">
                        Last synced: {new Date(policy.oracleData.lastCheck).toLocaleTimeString()}
                    </p>
                </div>
            )}
        </article>
    );
}
