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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-black/[0.04] shadow-2xl">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0AAA4] transition-colors group-focus-within:text-[#FF6B00]" />
                    <input
                        type="text"
                        placeholder="Search by Policy ID or target..."
                        className="w-full bg-white border border-black/[0.04] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF6B00]/40 transition-all placeholder:text-[#B0AAA4]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {(["All", "Active", "Claimed", "Expired", "Disputed"] as PolicyStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${filter === s
                                ? "bg-[#FF6B00] border-[#FF6B00] text-[#1A1A1A] shadow-[0_0_20px_rgba(255,107,0,0.3)]"
                                : "bg-black/[0.03] border-black/[0.04] text-[#71717A] hover:text-zinc-300 hover:bg-black/[0.05]"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-black/[0.04] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white text-[9px] text-[#71717A] font-bold uppercase tracking-[0.25em]">
                            <th className="py-6 px-8 font-bold">Risk Vector / Target</th>
                            <th className="py-6 px-8 font-bold font-mono">Premium</th>
                            <th className="py-6 px-8 font-bold">Settlement</th>
                            <th className="py-6 px-8 font-bold">Status</th>
                            <th className="py-6 px-8 font-bold">Authorization Date</th>
                            <th className="py-6 px-8 font-bold">Protocol ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="p-16 text-center text-[#71717A] animate-pulse font-bold uppercase tracking-wider text-[10px]">Syncing protocol history...</td>
                            </tr>
                        ) : !policies || policies.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-20 text-center bg-zinc-900/10 m-4 rounded-[2rem] border border-dashed border-black/[0.04]">
                                    <Shield className="w-12 h-12 text-[#D1CBC5] mx-auto mb-6 opacity-20" />
                                    <p className="text-[#B0AAA4] font-bold uppercase tracking-widest text-[10px]">No historical data found in sector</p>
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
                    <div className="w-1.5 h-6 bg-[#FF6B00]/40 rounded-full group-hover:bg-[#FF6B00] transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#FF8A33] uppercase mb-0.5">
                            {sectorTag}
                        </span>
                        <span className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight">{targetName}</span>
                    </div>
                </div>
            </td>
            
            <td className="py-6 px-8">
                <span className="text-sm text-[#71717A] font-mono font-bold group-hover:text-zinc-300 transition-colors">
                    ${premiumDollars}
                </span>
            </td>
            
            <td className="py-6 px-8">
                <span className={`text-sm font-bold font-mono ${Number(payoutDollars) > 0 ? 'text-emerald-400' : 'text-[#B0AAA4]'}`}>
                    ${payoutDollars}
                </span>
            </td>
            
            <td className="py-6 px-8">
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 ${
                        isClaimed ? "bg-emerald-500/10 border-emerald-500/20 text-[#2CFFB5]" : 
                        isExpired ? "bg-black/[0.03] border-black/[0.04] text-[#B0AAA4]" : 
                        isDisputed ? "bg-[#FF6B00]/10 border-[#FF6B00]/20 text-[#FF8A33]" :
                        "bg-primary/10 border-primary/20 text-primary"
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isClaimed ? "bg-emerald-400" : isExpired ? "bg-zinc-700" : isDisputed ? "bg-[#FF6B00]" : "bg-primary"} animate-pulse`} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{displayStatus}</span>
                    </div>
                </div>
            </td>
            
            <td className="py-6 px-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#71717A] font-mono font-bold whitespace-nowrap">
                        {dateFormatted}, {timeFormatted}
                    </span>
                    <span className={`text-[9px] uppercase font-bold tracking-widest ${isExpired ? "text-[#B0AAA4]" : "text-emerald-500"}`}>
                        Finalized Settlement
                    </span>
                </div>
            </td>
            
            <td className="py-6 px-8">
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-[#B0AAA4] font-mono font-bold tracking-widest lowercase group-hover:text-[#71717A] transition-colors">
                        {policyId.slice(0, 16).toUpperCase()}...
                    </span>
                    <div className="flex items-center gap-2">
                        <a
                            href={txHash ? `https://sepolia.arbiscan.io/tx/${txHash}` : `#`}
                            target={txHash ? "_blank" : "_self"}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[9px] font-bold uppercase tracking-widest text-[#71717A] transition-all duration-300 ${txHash ? "hover:text-[#1A1A1A] hover:bg-[#FF6B00] hover:border-[#FF6B00]" : "opacity-30 cursor-not-allowed"}`}
                        >
                            <span>Verify Node</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                        
                        {(isExpired || isDisputed) && (
                            <Link
                                href={`/claims/evidence/${policyId}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[9px] font-bold uppercase tracking-widest text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-all duration-300 shadow-[0_10px_20px_rgba(255,107,0,0.1)] hover:shadow-[0_10px_30px_rgba(255,107,0,0.2)]"
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
