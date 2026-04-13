"use client";
import React, { useState, useEffect } from "react";
import { useUserPolicies } from "@/hooks/useUserPolicies";
import { Shield, ExternalLink, Activity, Search, AlertCircle } from "lucide-react";
import Link from "next/link";

type PolicyStatus = "All" | "Active" | "Claimed" | "Expired" | "Disputed";

export function ClaimHistory() {
    const { policies, isLoading } = useUserPolicies();
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<PolicyStatus>("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 shadow-2xl">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors group-focus-within:text-[#D31027]" />
                    <input
                        type="text"
                        placeholder="Search by Policy ID or target..."
                        className="w-full bg-[#101216] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#D31027]/40 transition-all placeholder:text-zinc-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {(["All", "Active", "Claimed", "Expired", "Disputed"] as PolicyStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${filter === s
                                ? "bg-[#D31027] border-[#D31027] text-white shadow-[0_0_20px_rgba(211,16,39,0.3)]"
                                : "bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#0A0A0A] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#101216] text-[9px] text-zinc-500 font-black uppercase tracking-[0.25em]">
                            <th className="py-6 px-8 font-black">Risk Vector / Target</th>
                            <th className="py-6 px-8 font-black font-mono">Premium</th>
                            <th className="py-6 px-8 font-black">Settlement</th>
                            <th className="py-6 px-8 font-black">Status</th>
                            <th className="py-6 px-8 font-black">Authorization Date</th>
                            <th className="py-6 px-8 font-black">Protocol ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="p-16 text-center text-zinc-500 animate-pulse font-black uppercase tracking-[0.2em] text-[10px]">Syncing protocol history...</td>
                            </tr>
                        ) : !policies || policies.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-20 text-center bg-zinc-900/10 m-4 rounded-[2rem] border border-dashed border-white/5">
                                    <Shield className="w-12 h-12 text-zinc-800 mx-auto mb-6 opacity-20" />
                                    <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No historical data found in sector</p>
                                </td>
                            </tr>
                        ) : (
                            policies.map((p) => (
                                <ClaimHistoryRow key={p.policyId} policy={p} filter={filter} search={searchQuery} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ClaimHistoryRow({ policy, filter, search }: { policy: any; filter: PolicyStatus; search: string }) {
    const { policyId, identifier: apiTarget, premium, maxPayout, expiresAt, status: statusCode, txHash } = policy;

    // Status Logic mapping from hook status to display status
    const isExpired = statusCode === 2;
    const isClaimed = statusCode === 1;
    const isActive = statusCode === 0;
    const isDisputed = isExpired && policyId.length > 61; // Simple mock or enhanced logic
    
    const displayStatus: PolicyStatus = isActive ? "Active" : isClaimed ? "Claimed" : isDisputed ? "Disputed" : "Expired";

    // Filter & Search Logic
    if (filter !== "All" && filter !== displayStatus) return null;
    if (search && !policyId.toLowerCase().includes(search.toLowerCase()) && !apiTarget.toLowerCase().includes(search.toLowerCase())) return null;

    const expDate = new Date(Number(expiresAt) * 1000);
    const dateFormatted = expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeFormatted = expDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Attempting to deduce the sector from the apiTarget structure
    const isFlight = apiTarget.match(/^[A-Za-z]{2}\d{2,4}$/);
    const sectorTag = isFlight ? "TRAVEL" : "GENERIC";
    const targetName = apiTarget;

    const payoutDollars = (Number(maxPayout) / 1e6).toFixed(2);
    const premiumDollars = (Number(premium) / 1e6).toFixed(3);

    return (
        <tr className="hover:bg-white/[0.02] transition-colors group">
            <td className="py-6 px-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-[#D31027]/40 rounded-full group-hover:bg-[#D31027] transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black tracking-[0.15em] text-[#FFB3B5] uppercase mb-0.5">
                            {sectorTag}
                        </span>
                        <span className="text-sm font-bold text-white uppercase italic tracking-tight">{targetName}</span>
                    </div>
                </div>
            </td>
            
            <td className="py-6 px-8">
                <span className="text-sm text-zinc-500 font-mono font-bold group-hover:text-zinc-300 transition-colors">
                    ${premiumDollars}
                </span>
            </td>
            
            <td className="py-6 px-8">
                <span className={`text-sm font-black font-mono ${Number(payoutDollars) > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    ${payoutDollars}
                </span>
            </td>
            
            <td className="py-6 px-8">
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 ${
                        isClaimed ? "bg-emerald-500/10 border-emerald-500/20 text-[#2CFFB5]" : 
                        isExpired ? "bg-white/5 border-white/5 text-zinc-600" : 
                        isDisputed ? "bg-[#D31027]/10 border-[#D31027]/20 text-[#FFB3B5]" :
                        "bg-primary/10 border-primary/20 text-primary"
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isClaimed ? "bg-emerald-400" : isExpired ? "bg-zinc-700" : isDisputed ? "bg-[#D31027]" : "bg-primary"} animate-pulse`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{displayStatus}</span>
                    </div>
                </div>
            </td>
            
            <td className="py-6 px-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-400 font-mono font-bold whitespace-nowrap">
                        {dateFormatted}, {timeFormatted}
                    </span>
                    <span className={`text-[9px] uppercase font-black tracking-widest ${isExpired ? "text-zinc-700" : "text-emerald-500"}`}>
                        Finalized Settlement
                    </span>
                </div>
            </td>
            
            <td className="py-6 px-8">
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-zinc-700 font-mono font-black tracking-widest lowercase group-hover:text-zinc-500 transition-colors">
                        {policyId.slice(0, 16).toUpperCase()}...
                    </span>
                    <div className="flex items-center gap-2">
                        <a
                            href={txHash ? `https://sepolia.arbiscan.io/tx/${txHash}` : `#`}
                            target={txHash ? "_blank" : "_self"}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-all duration-300 ${txHash ? "hover:text-white hover:bg-[#D31027] hover:border-[#D31027]" : "opacity-30 cursor-not-allowed"}`}
                        >
                            <span>Verify Node</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                        
                        {(isExpired || isDisputed) && (
                            <Link
                                href={`/claims/evidence/${policyId}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#D31027]/10 border border-[#D31027]/20 text-[9px] font-black uppercase tracking-widest text-[#D31027] hover:bg-[#D31027] hover:text-white transition-all duration-300 shadow-[0_10px_20px_rgba(211,16,39,0.1)] hover:shadow-[0_10px_30px_rgba(211,16,39,0.2)]"
                            >
                                <span>Relay Dispute</span>
                                <AlertCircle className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
}
