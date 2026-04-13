"use client";
import React, { useState, useEffect } from "react";
import { useUserPolicies } from "@/hooks/useUserPolicies";
import { Shield, Zap, Search, Clock, ExternalLink, Activity, Terminal, AlertTriangle, Scale, Fingerprint, ChevronRight } from "lucide-react";
import Link from "next/link";

export function ActivePolicies() {
    const { activePolicies, isLoading } = useUserPolicies();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-4">
                        <Activity className="w-8 h-8 text-[#D31027] animate-spin" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Querying Protocol Nodes...</span>
                    </div>
                </div>
            ) : activePolicies.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <Shield className="w-8 h-8 text-zinc-700" />
                        </div>
                        <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">No Active Coverage Detected</p>
                        <p className="text-[10px] text-zinc-700 max-w-xs">Visit the Marketplace to underwrite your first parametric risk vector.</p>
                    </div>
                </div>
            ) : (
                activePolicies.map((p: any) => (
                    <ActivePolicyCard key={p.policyId} policy={p} />
                ))
            )}
        </div>
    );
}

function ActivePolicyCard({ policy }: { policy: any }) {
    const { policyId, identifier: apiTarget, premium, maxPayout, expiresAt, txHash, productLabel } = policy;

    const expDate = new Date(Number(expiresAt) * 1000);
    const dateFormatted = expDate.toLocaleDateString();
    
    const payoutDollars = (Number(maxPayout) / 1e6).toFixed(2);
    const premiumDollars = (Number(premium) / 1e6).toFixed(2);

    return (
        <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden group hover:border-[#D31027]/30 transition-all duration-500 shadow-2xl">
            {/* Background Scanner Effect */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D31027] opacity-40" />
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Fingerprint className="w-24 h-24" />
            </div>

            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-[#D31027]/10 transition-colors">
                  <Shield className="w-6 h-6 text-[#D31027]" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest block mb-1">Policy Identity</span>
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">
                     {policyId.slice(0, 10)}<span className="text-[#D31027]">...</span>{policyId.slice(-6)}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest block mb-1">Matrix Status</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active_Node</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-10 relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Coverage Vector</span>
                <p className="text-lg font-black text-white italic tracking-tighter uppercase">{apiTarget}</p>
                <p className="text-[9px] font-medium text-zinc-700 uppercase tracking-[0.2em]">{productLabel}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Stake At Risk</span>
                <p className="text-2xl font-black text-emerald-500 italic tracking-tighter uppercase">${payoutDollars}</p>
                <p className="text-[9px] font-medium text-zinc-800 uppercase tracking-widest">Collateralized USDT</p>
              </div>
            </div>

            <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 mb-10 space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-[#D31027]" />
                        Premium Locked
                    </span>
                    <span className="mono-data text-xs text-white font-bold">${premiumDollars}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Temporal Expiry
                    </span>
                    <span className="mono-data text-xs text-zinc-400 font-bold">{dateFormatted}</span>
                </div>
            </div>

            <div className="flex gap-4 relative z-10">
              {txHash && (
                <a
                  href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-3 bg-white/5 border border-white/5 py-4 rounded-2xl transition-all hover:bg-white/10 hover:border-white/10 group/btn"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover/btn:text-white" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-white">Verify Node</span>
                </a>
              )}
              <Link
                href={`/claims/evidence/${policyId}`}
                className="flex-[1.5] flex items-center justify-center gap-3 bg-[#D31027] py-4 rounded-2xl transition-all hover:bg-[#A9081E] shadow-xl group/btn"
              >
                <div className="flex items-center gap-3">
                    <Scale className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Dispute Node</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>

            {/* Matrix Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>
    );
}
