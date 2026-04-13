"use client";

import React, { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { CONTRACTS, LP_POOL_ABI, POOLS } from "@/lib/contracts";
import { formatUnits } from "viem";
import { toast } from "sonner";
import { 
  Gavel, 
  ShieldAlert, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Info, 
  Terminal,
  Cpu,
  Unplug,
  Vote,
  HeartPulse,
  Plus
} from "lucide-react";

const MOCK_PROPOSALS = [
  {
    id: "RFX-001",
    title: "Increase Catastrophe Pool Cap to $500K",
    author: "0x7FaF...5431",
    status: "active",
    forVotes: 72,
    againstVotes: 28,
    description: "Proposal to increase the Catastrophe & Reinsurance pool maximum capacity to $500,000 USDT to accommodate growing demand.",
  },
  {
    id: "RFX-002",
    title: "Add Cyber Risk Insurance Market",
    author: "0xa5C9...3e72",
    status: "active",
    forVotes: 85,
    againstVotes: 15,
    description: "Introduction of a new Cyber Risk insurance market targeting DeFi smart contract exploits with Chainlink Functions as oracle.",
  },
  {
    id: "RFX-003",
    title: "Reduce Travel Pool Premium to $3 USDT",
    author: "0x8f3f...7Db3",
    status: "closed",
    forVotes: 41,
    againstVotes: 59,
    description: "Reduce the base premium for Travel Solutions from $5 to $3 USDT to increase adoption.",
  },
];

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [selectedProposal, setSelectedProposal] = useState(MOCK_PROPOSALS[0]);

  // Read total TVL from Travel pool as representative
  const { data: protocolTvl } = useReadContract({
    address: CONTRACTS.LP_TRAVEL,
    abi: LP_POOL_ABI,
    functionName: "totalAssets",
  });

  const formattedTvl = protocolTvl ? `$${Number(formatUnits(protocolTvl as bigint, 6)).toLocaleString()}` : "$0.00";

  return (
    <div className="pt-40 pb-32 px-12 max-w-[1700px] mx-auto">
      {/* Header */}
      <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-1.5 bg-[#D31027] rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-[#D31027] uppercase tracking-[0.4em]">Governance Quorum Active</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-6 text-white uppercase italic">
            Governance <span className="text-[#D31027]">Core</span>
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed font-medium max-w-xl">
            Authorize protocol mutations, manage decentralized disputes, and monitor global system health through the Arbitrum consensus layer.
          </p>
        </div>

        <div className="bg-[#101216] p-6 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-md flex items-center gap-6">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group">
                <Cpu className="w-6 h-6 text-zinc-400 group-hover:text-[#D31027] transition-colors" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest leading-none">Global TVL</span>
                <span className="mono-data text-xl text-white font-black italic tracking-tighter uppercase">{formattedTvl}</span>
            </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Proposals */}
        <div className="w-full lg:w-[65%] flex flex-col gap-8">
          <section className="flex flex-col gap-10">
            <div className="flex items-center gap-4">
                <Vote className="w-5 h-5 text-[#D31027]" />
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Active Proposals</h2>
                <div className="w-full h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-1 gap-6">
              {MOCK_PROPOSALS.map((proposal) => (
                <button
                  key={proposal.id}
                  onClick={() => setSelectedProposal(proposal)}
                  className={`group relative text-left p-10 rounded-[3rem] transition-all border duration-500 overflow-hidden ${
                    selectedProposal.id === proposal.id
                      ? "bg-[#D31027]/5 border-[#D31027]/30 shadow-[0_40px_100px_rgba(211,16,39,0.1)]"
                      : "bg-[#101216] border-white/5 hover:border-white/10 hover:bg-[#15171c]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <span className="mono-data text-[10px] font-black text-[#D31027] uppercase tracking-[0.2em]">{proposal.id}</span>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        proposal.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-500"
                      }`}>
                         <div className={`w-1 h-1 rounded-full ${proposal.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                        {proposal.status}
                      </div>
                    </div>
                    <span className="mono-data text-[10px] text-zinc-700 font-medium uppercase tracking-widest">{proposal.author}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">{proposal.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium mb-10 leading-relaxed max-w-xl">{proposal.description}</p>
                  
                  {/* Voting HUD */}
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-emerald-500">Ayes: {proposal.forVotes}%</span>
                      <span className="text-[#D31027]">Nays: {proposal.againstVotes}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${proposal.forVotes}%` }} />
                      <div className="h-full bg-[#D31027] transition-all duration-700" style={{ width: `${proposal.againstVotes}%` }} />
                    </div>
                  </div>
                </button>
              ))}

              {/* Create Proposal */}
              <button className="p-10 rounded-[3rem] border-2 border-dashed border-white/5 bg-transparent flex items-center justify-center gap-4 hover:border-[#D31027]/20 hover:bg-[#D31027]/5 transition-all group duration-500">
                <Plus className="w-6 h-6 text-zinc-800 group-hover:text-[#D31027] transition-transform group-hover:scale-110" />
                <span className="text-zinc-700 group-hover:text-zinc-300 font-black uppercase tracking-[0.3em] text-[10px]">Initialize New Proposal</span>
              </button>
            </div>
          </section>

          {/* Dispute Review */}
          <section>
            <h2 className="text-xl font-bold mb-6">Dispute Review</h2>
            <div className="bg-surface-container-low p-8 rounded-lg specular-border text-center">
              <span className="material-symbols-outlined text-4xl text-zinc-700 mb-4">gavel</span>
              <p className="text-zinc-500">No open disputes. All claims settled correctly.</p>
            </div>
          </section>
        </div>

        {/* Right: Command Center */}
        <div className="w-full lg:w-[35%]">
          <div className="sticky top-32 flex flex-col gap-6">
            <h2 className="text-xl font-bold">Command Center</h2>

            {/* Emergency Actions */}
            <div className="bg-[#101216] p-10 rounded-[3rem] border border-white/5 relative group/pause overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/pause:opacity-10 transition-opacity">
                    <Unplug className="w-12 h-12 text-[#D31027]" />
                </div>
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-10">Consensus Intercept</span>
              <button
                onClick={() => {
                  if (!isConnected) {
                    toast.error("IDENTITY_MISSING: Authenticate wallet");
                    return;
                  }
                  toast.warning("EMERGENCY_STATUS: Admin authorization required");
                }}
                className="w-full bg-[#D31027]/10 text-[#D31027] border border-[#D31027]/20 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 hover:bg-[#D31027]/20 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                Trigger Halt
              </button>
            </div>

            {/* Global State */}
            <div className="bg-[#101216] p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group/state shadow-2xl">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/state:opacity-10 transition-opacity">
                    <Terminal className="w-12 h-12" />
                </div>
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-10">Global Telemetry</span>
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white/2 p-4 rounded-xl border border-white/5">
                  <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Protocol Stance</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="mono-data text-[10px] text-emerald-400 font-black tracking-widest uppercase">Operational</span>
                  </div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">System Revenue</span>
                  <span className="mono-data text-sm text-white font-black italic tracking-tighter uppercase">{formattedTvl}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Markets</span>
                  <span className="mono-data text-sm text-white font-black italic tracking-tighter uppercase">{POOLS.length}</span>
                </div>
              </div>
            </div>

            {/* Relayer Management */}
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-4">Relayer Nodes</span>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Chainlink DON #1", status: "Active" },
                  { name: "Chainlink DON #2", status: "Active" },
                  { name: "CCIP Router", status: "Standby" },
                ].map((node) => (
                  <div key={node.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${node.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span className="text-sm">{node.name}</span>
                    </div>
                    <span className={`mono-data text-[10px] ${node.status === "Active" ? "text-emerald-400" : "text-amber-400"}`}>
                      {node.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treasury Health */}
            <div className="bg-[#101216] p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group/health border-dashed shadow-2xl">
              <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.2em] block mb-10">Solvency Matrix</span>
              <div className="flex items-center gap-8 px-2">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                   <HeartPulse className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                   <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] block mb-1">STABLE</span>
                   <p className="text-2xl font-black text-white italic tracking-tighter uppercase">Fully Solvent</p>
                   <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-1">100% COLLATERAL_OFFSET_RESERVE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
