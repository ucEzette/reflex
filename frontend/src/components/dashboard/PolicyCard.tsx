"use client";

import React from 'react';
import { Policy, PolicyStatus } from '@/types/dashboard';
import { Plane, Cloud, CloudRain, Zap, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { ESCROW_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';
import { toast } from 'sonner';

const iconMap = {
    'Travel': Plane,
    'Agriculture': Cloud,
    'Weather': CloudRain,
    'Energy': Zap,
    'Catastrophe': Zap,
    'Maritime': Plane
};

interface PolicyCardProps {
    policyId: `0x${string}`;
    policyData: [address: string, apiTarget: string, premiumPaid: bigint, payoutAmount: bigint, expirationTime: bigint, isActive: boolean, isClaimed: boolean];
    onActionSuccess?: () => void;
    txHash?: string;
}

export function PolicyCard({ policyId, policyData, onActionSuccess, txHash }: PolicyCardProps) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const [policyholder, apiTarget, premiumPaid, payoutAmount, expirationTime, isActive, isClaimed] = policyData;

    // Determine type from apiTarget or contract address
    const type = apiTarget.toLowerCase().includes('ua') || apiTarget.toLowerCase().includes('ba') ? 'Travel' :
        apiTarget.toLowerCase().includes('mato') ? 'Agriculture' :
            apiTarget.toLowerCase().includes('generic') ? 'Weather' : 'Energy';
    const Icon = iconMap[type as keyof typeof iconMap] || Plane;

    // In parametric insurance, claimable state usually depends on oracle data.
    // For this UI, we'll assume if it's expired and not claimed, and theoretically met conditions (mock logic for now)
    // In production, we'd check an `isTriggered` state or similar.
    const isExpired = Number(expirationTime) < (Date.now() / 1000);
    
    // Status logic:
    // 1. If claimed -> Claimed
    // 2. If expired -> Claimable (allows user to trigger relayer consensus in this demo)
    // 3. If active -> Active
    // 4. Else -> Processing
    const status: PolicyStatus = isClaimed ? 'Claimed' : (isExpired ? 'Claimable' : (isActive ? 'Active' : 'Processing'));

    const formatExpiry = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    };

    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash });

    const handleClaim = (e: React.MouseEvent) => {
        e.stopPropagation();
        writeContract({
            address: CONTRACTS.ESCROW,
            abi: ESCROW_ABI,
            functionName: 'submitRelayerConsensus', // In the current Escrow, this triggers the check/payout
            args: [policyId],
        });
        toast.info("Submitting Consensus Request...", { description: "Verifying parametric trigger with relayer network." });
    };

    if (!mounted) return null;

    return (
        <article
            className={cn(
                "group relative overflow-hidden rounded-2xl border bg-black/40 backdrop-blur-xl p-5 transition-all hover:bg-black/60",
                status === 'Claimable' ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-white/5 shadow-lg",
                status === 'Active' ? "hover:border-primary/30" : ""
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2.5 rounded-xl border",
                        status === 'Claimable' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            status === 'Active' ? "bg-primary/10 border-primary/20 text-primary" :
                                "bg-slate-800/50 border-slate-700 text-slate-400"
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground tracking-tight">{apiTarget}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">{policyId.slice(0, 18)}...</p>
                    </div>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">Coverage</span>
                    <span className="text-lg font-bold text-foreground tracking-tight">
                        {formatUnits(payoutAmount, 6)} <span className="text-xs text-slate-500 font-medium">USDT</span>
                    </span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">Premium</span>
                    <span className="text-sm font-medium text-foreground">
                        {formatUnits(premiumPaid, 6)} <span className="text-[10px] text-slate-500">USDT</span>
                    </span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{status === 'Claimed' ? 'Settled' : (isExpired ? 'Expired' : `Expires ${formatExpiry(expirationTime)}`)}</span>
                    </div>
                    {txHash && (
                        <>
                            <div className="w-px h-3 bg-white/10" />
                            <a
                                href={`https://testnet.snowtrace.io/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-bold uppercase tracking-widest text-[9px]"
                            >
                                Explorer
                            </a>
                        </>
                    )}
                </div>
                {status === 'Claimable' && (
                    <button
                        onClick={handleClaim}
                        className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg hover:bg-emerald-400/20 transition-colors"
                    >
                        {isWaiting ? 'Processing...' : 'Execute Claim'}
                    </button>
                )}
            </div>
        </article>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
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
                    <CheckCircle2 className="w-3 h-3" /> Paid
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
