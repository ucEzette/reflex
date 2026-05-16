"use client";

import React, { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { 
  Vote, 
  PenTool, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  ChevronRight, 
  Gavel, 
  Activity, 
  Shield, 
  Zap,
  Clock,
  ArrowUpRight,
  History
} from "lucide-react";
import { useUserPolicies } from "@/hooks/useUserPolicies";

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-[#15151A] text-[10px] text-[#71717A] leading-relaxed p-4 rounded-2xl border border-black/[0.06] shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
           <div className="text-[#FF6B00] font-bold uppercase tracking-widest mb-2 text-[8px]">Consensus Protocol</div>
          {text}
        </span>
      )}
    </span>
  );
}

export function GovernanceForum() {
  const { address, isConnected } = useAccount();
  const { totalVotingPower } = useUserPolicies();

  const votingPowerDetails = useMemo(() => ({
      percent: Number(totalVotingPower.toFixed(2))
  }), [totalVotingPower]);

  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: "Activate Real Estate Risk Matrix",
      description: "Initialize isolated liquidity pool for global residential parametric insurance.",
      author: "0x123...ABC",
      status: "Active",
      forVotes: 45.2,
      againstVotes: 12.1,
      hasVoted: false,
      timeLeft: "14h 22m"
    },
    {
      id: 2,
      title: "Scale Travel Pool Premium x0.5",
      description: "Adjust risk-weighted premium base to account for decreased global volatility.",
      author: "0x456...DEF",
      status: "Active",
      forVotes: 89.4,
      againstVotes: 4.2,
      hasVoted: false,
      timeLeft: "2d 04h"
    }
  ]);

  const [isDrafting, setIsDrafting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleVote = (id: number, type: "for" | "against") => {
      if (!isConnected) {
        toast.error("IDENTITY_REJECTED: Authentication required.");
        return;
      }
      if (votingPowerDetails.percent === 0) {
        toast.error("VOTING_POWER_ERROR: Zero liquidity detected in connected wallet.");
        return;
      }

      setProposals(prev => prev.map(p => {
          if (p.id === id) {
              if (p.hasVoted) {
                  toast.error("VOTE_ALREADY_COMMITTED: Consensus reached.");
                  return p;
              }
              toast.success(`Consensus finality achieved: ${votingPowerDetails.percent}% cast ${type.toUpperCase()}`);
              return {
                  ...p,
                  forVotes: type === "for" ? p.forVotes + votingPowerDetails.percent : p.forVotes,
                  againstVotes: type === "against" ? p.againstVotes + votingPowerDetails.percent : p.againstVotes,
                  hasVoted: true
              };
          }
          return p;
      }));
  };

  const handlePropose = () => {
    if (!isConnected) return toast.error("Connect wallet to propose");
    if (votingPowerDetails.percent < 0.1) return toast.error("VOTING_POWER_INSUFFICIENT: 0.1% Minimum Required");
    if (!newTitle.trim()) return;

    setProposals(prev => [
        {
            id: prev.length + 1,
            title: newTitle,
            description: newDesc || "Manual intervention proposal.",
            author: `${address?.slice(0,6)}...${address?.slice(-4)}`.toUpperCase(),
            status: "Active",
            forVotes: votingPowerDetails.percent,
            againstVotes: 0,
            hasVoted: true,
            timeLeft: "7d 00h"
        },
        ...prev
    ]);
    setNewTitle("");
    setNewDesc("");
    setIsDrafting(false);
    toast.success("Consensus proposal broadcasted to the quorum.");
  };

  return (
    <div className="space-y-16">
        {/* Participation Vector HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-[2.5rem] border border-black/[0.04] shadow-2xl">
             <Tooltip text="Currently operational and verifying external risk vectors in the global matrix.">
                <div className="flex flex-col gap-1 p-6 bg-black/[0.02] rounded-2xl border border-black/[0.04] w-full">
                    <span className="text-[8px] font-bold text-[#B0AAA4] uppercase tracking-widest">Active Nodes</span>
                    <span className="mono-data text-sm text-emerald-500 font-bold">1,242 Online</span>
                </div>
             </Tooltip>
             <Tooltip text="The average time for the quorum to reach consensus and finalize policy claims.">
                <div className="flex flex-col gap-1 p-6 bg-black/[0.02] rounded-2xl border border-black/[0.04] w-full">
                    <span className="text-[8px] font-bold text-[#B0AAA4] uppercase tracking-widest">Consensus Latency</span>
                    <span className="mono-data text-sm text-[#1A1A1A] font-bold">140ms Avg</span>
                </div>
             </Tooltip>
             <Tooltip text="Real-time protocol solvency and capital efficiency score across all pools.">
                <div className="flex flex-col gap-1 p-6 bg-black/[0.02] rounded-2xl border border-black/[0.04] w-full">
                    <span className="text-[8px] font-bold text-[#B0AAA4] uppercase tracking-widest">Matrix Health</span>
                    <span className="mono-data text-sm text-emerald-500 font-bold">100.0%</span>
                </div>
             </Tooltip>
             <Tooltip text="Your current share of the total protocol liquidity, determining your voting influence.">
                <div className="flex flex-col gap-1 p-6 bg-black/[0.02] rounded-2xl border border-black/[0.04] w-full">
                    <span className="text-[8px] font-bold text-[#B0AAA4] uppercase tracking-widest">Your Influence</span>
                    <span className="mono-data text-sm text-[#FF6B00] font-bold">{votingPowerDetails.percent}% Power</span>
                </div>
             </Tooltip>
        </div>

        {/* Governance Header */}
        <header className="flex justify-between items-end border-b border-black/[0.04] pb-10">
            <div>
                 <div className="flex items-center gap-3 mb-4">
                    <Gavel className="w-5 h-5 text-[#FF6B00]" />
                    <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider">Consensus Forum</span>
                </div>
                <h2 className="text-6xl font-bold text-[#1A1A1A] uppercase tracking-tighter">Governance <span className="opacity-30">Matrix</span></h2>
            </div>
            
            <button 
                  onClick={() => setIsDrafting(!isDrafting)}
                  className="px-10 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-3 shadow-2xl"
            >
                {isDrafting ? "CLOSE DRAFT" : "NEW PROPOSAL"}
                {isDrafting ? <ChevronRight className="w-4 h-4 rotate-90" /> : <Plus className="w-4 h-4" />}
            </button>
        </header>

        {/* Proposals List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {isDrafting && (
                <div className="bg-white border border-[#FF6B00]/40 rounded-[2.5rem] p-10 space-y-8 animate-in slide-in-from-left-4 duration-500 shadow-[0_40px_100px_rgba(255,107,0,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <PenTool className="w-20 h-20 text-[#FF6B00]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A1A1A] uppercase tracking-tighter">Draft Proposal</h3>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest px-2">Proposal_Call_Title</label>
                             <input 
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="E.g. ADAPTIVE_PREMIUM_RESCALE"
                                className="w-full bg-black border border-black/[0.04] p-5 rounded-2xl text-[#1A1A1A] font-mono text-sm placeholder:text-[#D1CBC5] focus:ring-1 focus:ring-[#FF6B00]/50 transition-all"
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest px-2">Technical_Summary</label>
                             <textarea 
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Define the technical parameters and logic adjustments required for the proposed quorum update..."
                                className="w-full h-32 bg-black border border-black/[0.04] p-5 rounded-2xl text-[#1A1A1A] font-mono text-sm placeholder:text-[#D1CBC5] focus:ring-1 focus:ring-[#FF6B00]/50 transition-all resize-none"
                             />
                        </div>
                    </div>

                    <button 
                        onClick={handlePropose}
                        className="w-full py-5 bg-[#FF6B00] text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-[#E55E00] transition-all shadow-2xl"
                    >
                        BROADCAST PROPOSAL TO THE MATRIX
                    </button>
                </div>
            )}

            {proposals.map((p) => (
                <div key={p.id} className="bg-white border border-black/[0.04] rounded-[3rem] p-10 hover:border-[#FF6B00]/40 transition-all duration-500 group relative overflow-hidden shadow-2xl">
                    {/* Diagnostic Background Element */}
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                         <Gavel className="w-32 h-32" />
                    </div>

                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div className="flex flex-col gap-3">
                             <div className="flex items-center gap-3">
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Quorum_Active</span>
                                <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest">Protocol_ID: #REF-00{p.id}</span>
                             </div>
                             <h4 className="text-3xl font-bold text-[#1A1A1A] uppercase tracking-tighter group-hover:text-[#FF8A33] transition-colors leading-none">{p.title}</h4>
                        </div>
                        <div className="text-right">
                             <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest block mb-1">Time Remaining</span>
                             <div className="flex items-center gap-2 text-zinc-300 font-bold text-base">
                                <Clock className="w-4 h-4 text-[#FF6B00]" />
                                {p.timeLeft}
                             </div>
                        </div>
                    </div>

                    <p className="text-[#71717A] text-sm font-medium leading-relaxed mb-12 max-w-xl relative z-10">
                        {p.description}
                    </p>

                    <div className="space-y-8 mb-12 relative z-10">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-emerald-500">FOR_CONSENSUS_FINALITY</span>
                                <span className="text-[#1A1A1A] mono-data">{p.forVotes.toFixed(1)}%</span>
                            </div>
                            <div className="h-3 bg-black/[0.03] rounded-full overflow-hidden border border-black/[0.04]">
                                 <div className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-1000" style={{ width: `${p.forVotes}%` }} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                AGAINST_CONSENSUS_FINALITY
                                <span className="text-[#1A1A1A] mono-data">{p.againstVotes.toFixed(1)}%</span>
                            </div>
                            <div className="h-3 bg-black/[0.03] rounded-full overflow-hidden border border-black/[0.04]">
                                 <div className="h-full bg-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all duration-1000" style={{ width: `${p.againstVotes}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 border-t border-black/[0.04] pt-10 relative z-10">
                         <button 
                            onClick={() => handleVote(p.id, "for")}
                            disabled={p.hasVoted}
                            className={`flex-1 py-5 text-[10px] font-bold uppercase tracking-wider rounded-[1.5rem] transition-all duration-300 ${p.hasVoted ? 'bg-zinc-900/50 text-[#D1CBC5] border border-black/[0.04] cursor-not-allowed' : 'bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black shadow-xl'}`}
                         >
                            {p.hasVoted && p.forVotes > p.againstVotes ? "VOTE_RECORDED" : "VOTE_FOR"}
                         </button>
                         <button 
                             onClick={() => handleVote(p.id, "against")}
                             disabled={p.hasVoted}
                             className={`flex-1 py-5 text-[10px] font-bold uppercase tracking-wider rounded-[1.5rem] transition-all duration-300 ${p.hasVoted ? 'bg-zinc-900/50 text-[#D1CBC5] border border-black/[0.04] cursor-not-allowed' : 'bg-[#FF6B00]/5 text-[#FF8A33] border border-[#FF6B00]/20 hover:bg-[#FF6B00] hover:text-white shadow-xl'}`}
                         >
                            {p.hasVoted && p.againstVotes > p.forVotes ? "VOTE_RECORDED" : "VOTE_AGAINST"}
                         </button>
                    </div>

                    <div className="mt-10 flex items-center justify-between relative z-10">
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-black/[0.03] border border-black/[0.06] flex items-center justify-center group-hover:bg-[#FF6B00]/10 transition-colors">
                                <PenTool className="w-4 h-4 text-[#B0AAA4] group-hover:text-[#FF6B00]" />
                             </div>
                             <div>
                                <p className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest leading-none">Market Proposer</p>
                                <p className="text-[11px] font-bold text-[#71717A] mt-1.5 uppercase tracking-tighter">{p.author}</p>
                             </div>
                         </div>
                         <button className="text-[9px] font-bold text-[#FF6B00] hover:text-[#1A1A1A] transition-colors uppercase tracking-wider flex items-center gap-3 bg-[#FF6B00]/5 px-4 py-2.5 rounded-xl border border-[#FF6B00]/10">
                            DETAILS_LEDGER
                            <ArrowUpRight className="w-3.5 h-3.5" />
                         </button>
                    </div>
                </div>
            ))}
        </div>

        {/* Global Archives Entry */}
        <div className="bg-white rounded-[2rem] border border-black/[0.04] py-12 px-8 flex flex-col md:flex-row items-center justify-between gap-8 h-full shadow-2xl">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black/[0.03] flex items-center justify-center border border-black/[0.06]">
                    <History className="w-6 h-6 text-[#B0AAA4]" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-tighter">Settlement Archives</h3>
                    <p className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest mt-1">Audit historical quorum consensus results</p>
                </div>
            </div>
            <button className="px-10 py-4 bg-black/[0.02] hover:bg-black/[0.03] text-[#71717A] hover:text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider rounded-xl border border-black/[0.04] transition-all flex items-center gap-3">
                VIEW ARCHIVES
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    </div>
  );
}

