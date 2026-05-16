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
                        <Activity className="w-8 h-8 text-[#FF6B00] animate-spin" />
                        <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest">Querying Protocol Nodes...</span>
                    </div>
                </div>
            ) : activePolicies.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-black/[0.03] rounded-2xl flex items-center justify-center border border-black/[0.06]">
                            <Shield className="w-8 h-8 text-[#B0AAA4]" />
                        </div>
                        <p className="text-[11px] font-bold text-[#B0AAA4] uppercase tracking-widest">No Active Coverage Detected</p>
                        <p className="text-[10px] text-[#B0AAA4] max-w-xs">Visit the Marketplace to underwrite your first parametric risk vector.</p>
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
        <div className="bg-white rounded-[2.5rem] border border-black/[0.04] p-8 relative overflow-hidden group hover:border-[#FF6B00]/30 transition-all duration-500 shadow-2xl">
            {/* Background Scanner Effect */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B00] opacity-40" />
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Fingerprint className="w-24 h-24" />
            </div>

            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black/[0.03] rounded-2xl flex items-center justify-center border border-black/[0.06] group-hover:bg-[#FF6B00]/10 transition-colors">
                  <Shield className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest block mb-1">Policy Identity</span>
                  <h3 className="text-xl font-bold text-[#1A1A1A] tracking-tighter uppercase">
                     {policyId.slice(0, 10)}...{policyId.slice(-6)}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest block mb-1">Matrix Status</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active_Node</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-10 relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest block">Coverage Vector</span>
                <p className="text-lg font-bold text-[#1A1A1A] tracking-tighter uppercase">{apiTarget}</p>
                <p className="text-[9px] font-medium text-[#B0AAA4] uppercase tracking-wider">{productLabel}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest block">Stake At Risk</span>
                <p className="text-2xl font-bold text-emerald-500 tracking-tighter uppercase">${payoutDollars}</p>
                <p className="text-[9px] font-medium text-[#D1CBC5] uppercase tracking-widest">Collateralized USDT</p>
              </div>
            </div>

            <div className="bg-white/[0.02] rounded-2xl p-6 border border-black/[0.04] mb-10 space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-[#FF6B00]" />
                        Premium Locked
                    </span>
                    <span className="mono-data text-xs text-[#1A1A1A] font-bold">${premiumDollars}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Temporal Expiry
                    </span>
                    <span className="mono-data text-xs text-[#71717A] font-bold">{dateFormatted}</span>
                </div>
            </div>

            <div className="flex gap-4 relative z-10">
              {txHash && (
                <a
                  href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-3 bg-black/[0.03] border border-black/[0.04] py-4 rounded-2xl transition-all hover:bg-black/[0.05] hover:border-black/[0.06] group/btn"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#B0AAA4] group-hover/btn:text-[#1A1A1A]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#71717A] group-hover/btn:text-[#1A1A1A]">Verify Node</span>
                </a>
              )}
              <Link
                href={`/claims/evidence/${policyId}`}
                className="flex-[1.5] flex items-center justify-center gap-3 bg-[#FF6B00] py-4 rounded-2xl transition-all hover:bg-[#E55E00] shadow-xl group/btn"
              >
                <div className="flex items-center gap-3">
                    <Scale className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]">Dispute Node</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#1A1A1A] transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>

            {/* Matrix Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>
    );
}
