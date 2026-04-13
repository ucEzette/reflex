"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ESCROW_ABI, CONTRACTS } from "@/lib/contracts";
import { Shield, ExternalLink, Calendar, CheckCircle, XCircle, AlertCircle, Search, Filter } from "lucide-react";
import Link from "next/link";

type PolicyStatus = "All" | "Claimed" | "Expired" | "Disputed";

export function ClaimHistory() {
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<PolicyStatus>("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: policyIds, isLoading } = useReadContract({
        address: CONTRACTS.ESCROW as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getUserPolicies',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && mounted }
    });

    if (!mounted) return null;
    if (!isConnected) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by Policy ID or target..."
                        className="w-full bg-accent/30 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {(["All", "Claimed", "Expired", "Disputed"] as PolicyStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${filter === s
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                : "bg-accent/50 border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500 animate-pulse">Loading history...</div>
                ) : !policyIds || (policyIds as any[]).length === 0 ? (
                    <div className="p-12 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-3xl">
                        <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No policy history found</p>
                        <p className="text-slate-600 text-sm mt-1">Settled policies will appear here.</p>
                    </div>
                ) : (
                    (policyIds as any[]).map((id) => (
                        <ClaimHistoryRow key={id} policyId={id} filter={filter} search={searchQuery} />
                    ))
                )}
            </div>
        </div>
    );
}

function ClaimHistoryRow({ policyId, filter, search }: { policyId: string; filter: PolicyStatus; search: string }) {
    const { data } = useReadContract({
        address: CONTRACTS.ESCROW as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getPolicy',
        args: [policyId as `0x${string}`],
    });

    const policyData = data as any[];

    if (!policyData) return null;

    const [, apiTarget, premiumPaid, payoutAmount, expirationTime, isActive, isClaimed] = policyData;

    // Status Logic
    const isExpired = !isActive && !isClaimed;
    // For this phase, we mock "Disputed" if a CID exists in a hypothetical registry (or just show it for all expired for the demo)
    const isDisputed = isExpired && !isClaimed && policyId.length > 60; // Just a mock condition for now

    const status: PolicyStatus = isClaimed ? "Claimed" : isDisputed ? "Disputed" : isExpired ? "Expired" : "All";

    // Filter & Search Logic
    if (isActive) return null; // Only show non-active (historical) in this view
    if (filter !== "All" && filter !== status) return null;
    if (search && !policyId.toLowerCase().includes(search.toLowerCase()) && !apiTarget.toLowerCase().includes(search.toLowerCase())) return null;

    return (
        <div className="group bg-card border border-border rounded-2xl p-5 hover:bg-accent/30 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-xl border ${isClaimed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        isExpired ? "bg-slate-500/10 border-slate-500/20 text-slate-400" :
                            "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                        {isClaimed ? <CheckCircle className="w-5 h-5" /> :
                            isExpired ? <XCircle className="w-5 h-5" /> :
                                <AlertCircle className="w-5 h-5" />}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{apiTarget.split('/').pop()?.toUpperCase() || apiTarget}</h4>
                            <span className="text-[10px] bg-accent px-2 py-0.5 rounded text-muted-foreground uppercase font-mono">
                                {policyId.slice(0, 8)}...
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3 h-3" />
                                {new Date(Number(expirationTime) * 1000).toLocaleDateString()}
                            </span>
                            <span className="font-medium">Premium: ${(Number(premiumPaid) / 1e6).toFixed(2)} USDT</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Settlement</p>
                        <p className={`text-lg font-black tracking-tighter ${isClaimed ? "text-emerald-400" : "text-slate-400 line-through opacity-50"}`}>
                            ${(Number(payoutAmount) / 1e6).toFixed(2)} USDT
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isDisputed && (
                            <a
                                href={`https://ipfs.io/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3hlgtv7ctc5geba`} // Mock CID for proof of concept
                                target="_blank"
                                className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2"
                            >
                                <Shield className="w-3 h-3" />
                                View Evidence
                            </a>
                        )}
                        {isExpired && !isClaimed && !isDisputed && (
                            <Link
                                href={`/claims/evidence/${policyId}`}
                                className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-all"
                            >
                                Dispute
                            </Link>
                        )}
                        <a
                            href={`https://testnet.snowscan.xyz/tx/${policyId}`}
                            target="_blank"
                            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-foreground hover:bg-white/10 transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
