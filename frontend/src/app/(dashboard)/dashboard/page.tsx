"use client";

import React from "react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { usePrivy } from "@privy-io/react-auth";
import { CONTRACTS, ESCROW_ABI } from "@/lib/contracts";
import { formatUnits } from "viem";
import Link from "next/link";
import { ClaimHistory } from "@/components/profile/ClaimHistory";
import { ActivePolicies } from "@/components/profile/ActivePolicies";
import { useUserPolicies } from "@/hooks/useUserPolicies";
import { ShieldCheck, Zap, Activity, Wallet, Info, ArrowUpRight, History, Terminal, Fingerprint } from "lucide-react";

function HUDCard({ title, value, icon: Icon, color, subText, subColor }: any) {
  return (
    <div className="bg-[#101216] p-6 rounded-2xl border border-white/5 relative group overflow-hidden">
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{title}</span>
          <Info className="w-3 h-3 text-zinc-600" />
        </div>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="mono-data text-2xl text-white font-bold mb-1 relative z-10">{value}</div>
      <div className={`text-[10px] font-bold ${subColor} uppercase tracking-wider relative z-10`}>{subText}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { authenticated, user } = usePrivy();
  const { address: eoaAddress, isConnected } = useAccount();
  const { client } = useSmartWallets();

  // Robust Identity Search
  const embeddedWallet = user?.linkedAccounts.find(account => account.type === 'wallet');
  const privyAddress = (embeddedWallet as any)?.address;
  const address = client?.account?.address || privyAddress || eoaAddress;

  const isUserConnected = authenticated || isConnected;

  const { policies, activePolicies, claimedPolicies, isLoading } = useUserPolicies();

  const { data: usdtBalance } = useBalance({ address, token: CONTRACTS.USDT });
  const formattedBalance = usdtBalance ? (Number(usdtBalance.value) / 1e6).toFixed(2) : "0.00";
  
  const totalActive = activePolicies.length;
  const lockedPremiums = activePolicies.reduce((sum, p) => sum + Number(p.premium), 0) / 1e6;
  const settledReturns = claimedPolicies.reduce((sum, p) => sum + Number(p.maxPayout), 0) / 1e6;

  return (
    <div className="pt-40 pb-32 px-12 max-w-[1700px] mx-auto">
      {/* Header */}
      <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Vault Authorization Active</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-6 text-white uppercase italic">
            Portfolio <span className="text-[#D31027]">Core</span>
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed font-medium max-w-xl">
             Manage your active parametric coverages. Monitor real-time oracle event triggers and claim history on the Arbitrum ledger.
          </p>
        </div>
        
        {isUserConnected && (
          <div className="flex flex-col items-end gap-3">
             <div className="flex items-center gap-6 p-6 bg-white/2 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-md">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group">
                    <Wallet className={`w-6 h-6 ${client ? 'text-emerald-500' : 'text-zinc-400'} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest leading-none">
                      {client ? 'Smart Vault Active' : 'Access Node'}
                    </span>
                    <span className="mono-data text-sm text-white font-black italic tracking-tight uppercase">
                      {address?.slice(0, 10)}<span className="text-[#D31027]">...</span>{address?.slice(-6)}
                    </span>
                </div>
                {client && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(address!);
                      toast.success("Wallet address copied!");
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
                  </button>
                )}
             </div>
          </div>
        )}
      </header>

      {!isUserConnected ? (
        <div className="text-center py-44 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/5 mb-10 shadow-2xl">
             <Fingerprint className="w-10 h-10 text-zinc-800" />
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Identity Unverified</h2>
          <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed mb-10">
            Secure connection required. Please authenticate your wallet to access the portfolio ledger and active protection matrix.
          </p>
          <button className="px-10 py-4 bg-[#D31027] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#A9081E] transition-all shadow-[0_20px_40px_rgba(211,16,39,0.2)]">
             Establish Secure Link
          </button>
        </div>
      ) : (
        <>
          {/* HUD Bento */}
          {/* HUD Bento */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            <div className="bg-[#101216] p-8 rounded-[2rem] border border-white/5 relative group transition-all hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck className="w-12 h-12 text-[#D31027]" />
                </div>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Active Coverage</span>
                        <Info className="w-3 h-3 text-zinc-800" />
                    </div>
                </div>
                <div className="mono-data text-4xl text-white font-black italic tracking-tighter mb-1 relative z-10">
                    {isLoading ? "..." : totalActive.toString()}
                </div>
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic tracking-[0.1em]">Scanning Live Events</div>
            </div>

            <div className="bg-[#101216] p-8 rounded-[2rem] border border-white/5 relative group transition-all hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap className="w-12 h-12 text-amber-500" />
                </div>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Locked Premiums</span>
                        <Info className="w-3 h-3 text-zinc-800" />
                    </div>
                </div>
                <div className="mono-data text-4xl text-white font-black italic tracking-tighter mb-1 relative z-10">
                    ${isLoading ? "..." : lockedPremiums.toFixed(2)}
                </div>
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic tracking-[0.1em]">Escrowed in Protocol</div>
            </div>

            <div className="bg-[#101216] p-8 rounded-[2rem] border border-white/5 relative group transition-all hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <History className="w-12 h-12 text-white" />
                </div>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Settled Returns</span>
                        <Info className="w-3 h-3 text-zinc-800" />
                    </div>
                </div>
                <div className="mono-data text-4xl text-zinc-400 font-black italic tracking-tighter mb-1 relative z-10">
                    ${isLoading ? "..." : settledReturns.toFixed(2)}
                </div>
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic tracking-[0.1em]">Verified Finality</div>
            </div>

            <div className="bg-[#101216] p-8 rounded-[2rem] border border-white/5 relative group transition-all hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Wallet className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">USDT Liquid</span>
                        <Info className="w-3 h-3 text-zinc-800" />
                    </div>
                </div>
                <div className="mono-data text-4xl text-emerald-500 font-black italic tracking-tighter mb-1 relative z-10">${formattedBalance}</div>
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic tracking-[0.1em]">Arbitrum Liquidity</div>
            </div>
          </section>

          {/* Active Policies */}
          <section className="mb-20">
            <div className="flex justify-between items-end mb-8 px-1">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-[#D31027] rounded-full" />
                 <h2 className="text-xl font-bold uppercase tracking-tight">Active Coverage Matrix</h2>
              </div>
              <Link href="/market" className="text-[10px] font-black text-[#D31027] hover:text-[#A9081E] uppercase tracking-widest flex items-center gap-1 transition-colors">
                Initiate New Coverage <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ActivePolicies />
          </section>

          {/* Claim History */}
          <section className="mb-20">
             <div className="flex items-center gap-3 mb-8 px-1">
                 <div className="w-1.5 h-6 bg-zinc-800 rounded-full" />
                 <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-400">Archived Settlement Ledger</h2>
              </div>
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden">
                <ClaimHistory />
            </div>
          </section>

          {/* Oracle Event Stream */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8 px-1">
                <Terminal className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Live Oracle Telemetry</h2>
            </div>
            <div className="bg-[#050505] rounded-3xl p-10 border border-white/5 h-80 overflow-y-auto no-scrollbar shadow-inner relative group/terminal">
              <div className="absolute top-4 right-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                 <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Feed: Arbitrum_Sepolia_Nodes</span>
              </div>
              <div className="flex flex-col gap-4">
                <OracleEvent time="TELEMETRY_INIT" msg="Establishing secure connection to decentralized oracle network..." type="info" />
                <OracleEvent time="LISTENING" msg="Monitoring contract events: [PolicyPurchased, PolicyClaimed, PolicyExpired]" type="system" />
                <OracleEvent time="INFO" msg="User authentication confirmed on-chain. Scanning for local state updates." type="info" />
                <OracleEvent time="WAIT" msg="Awaiting next block finality (estimated 2.4s)..." type="system" />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-surface-container-low p-6 rounded-lg specular-border">
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </div>
      <span className="text-institutional block mb-2">{label}</span>
      <span className="mono-data text-2xl text-on-surface">{value}</span>
    </div>
  );
}

function OracleEvent({ time, msg, type }: { time: string; msg: string; type: string }) {
  return (
    <div className="flex items-start gap-8 group/line hover:bg-white/5 py-1 px-2 rounded -mx-2 transition-colors duration-200">
      <span className="text-[9px] text-zinc-700 min-w-[90px] font-black uppercase tracking-widest font-mono pt-0.5">{time}</span>
      <div className="flex-1">
        <span className={`mono-data text-xs leading-relaxed ${
            type === "info" ? "text-zinc-500" 
            : type === "system" ? "text-[#D31027] font-bold" 
            : "text-zinc-300"
        }`}>
            <span className="text-zinc-800 mr-2 opacity-50">›</span>
            {msg}
        </span>
      </div>
    </div>
  );
}
