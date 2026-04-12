"use client";

import React, { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { CONTRACTS, LP_POOL_ABI, POOLS } from "@/lib/contracts";
import { formatUnits } from "viem";
import { toast } from "sonner";

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
    <div className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Governance <span className="text-primary">Forum</span>
        </h1>
        <p className="text-zinc-400 text-lg">Vote on proposals, manage disputes, and monitor protocol infrastructure.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Proposals */}
        <div className="w-full lg:w-[65%] flex flex-col gap-8">
          {/* Proposals */}
          <section>
            <h2 className="text-xl font-bold mb-6">Active Proposals</h2>
            <div className="flex flex-col gap-4">
              {MOCK_PROPOSALS.map((proposal) => (
                <button
                  key={proposal.id}
                  onClick={() => setSelectedProposal(proposal)}
                  className={`w-full text-left p-6 rounded-lg transition-all specular-border ${
                    selectedProposal.id === proposal.id
                      ? "bg-primary-container/10 ring-1 ring-primary/30"
                      : "bg-surface-container-low hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="mono-data text-xs text-primary">{proposal.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        proposal.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                    <span className="mono-data text-[10px] text-zinc-600">{proposal.author}</span>
                  </div>
                  <h3 className="font-bold mb-3">{proposal.title}</h3>
                  <p className="text-zinc-500 text-sm mb-4">{proposal.description}</p>
                  {/* Voting Bar */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-emerald-400 mono-data">For: {proposal.forVotes}%</span>
                      <span className="text-red-400 mono-data">Against: {proposal.againstVotes}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${proposal.forVotes}%` }} />
                      <div className="h-full bg-red-500 transition-all" style={{ width: `${proposal.againstVotes}%` }} />
                    </div>
                  </div>
                </button>
              ))}

              {/* Create Proposal */}
              <div className="p-6 rounded-lg specular-border bg-surface-container-lowest flex items-center justify-center gap-3 opacity-50 cursor-not-allowed min-h-[100px]">
                <span className="material-symbols-outlined text-zinc-600">add</span>
                <span className="text-zinc-600 font-bold">Create New Proposal</span>
              </div>
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
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-4">Emergency Controls</span>
              <button
                onClick={() => {
                  if (!isConnected) {
                    toast.error("Connect wallet first");
                    return;
                  }
                  toast.warning("Emergency pause requires admin privileges");
                }}
                className="w-full bg-red-500/10 text-red-400 py-3 rounded-lg font-bold text-institutional flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
              >
                <span className="material-symbols-outlined text-sm">emergency</span>
                Emergency Pause
              </button>
            </div>

            {/* Global State */}
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-4">Global State Variables</span>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Protocol Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="mono-data text-xs text-emerald-400">LIVE</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Treasury Balance</span>
                  <span className="mono-data text-xs">{formattedTvl}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Active Pools</span>
                  <span className="mono-data text-xs">{POOLS.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Network</span>
                  <span className="mono-data text-xs text-secondary">Arbitrum Sepolia</span>
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
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-4">Treasury Health</span>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                  <span className="mono-data text-lg text-emerald-400">A+</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Fully Solvent</p>
                  <p className="text-zinc-500 text-xs">100% collateral backing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
