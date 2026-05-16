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
    <div className="bg-white p-6 rounded-2xl border border-black/[0.04] relative group overflow-hidden shadow-card hover:shadow-card-hover transition-all">
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FF6B00]/5 blur-3xl rounded-full group-hover:bg-[#FF6B00]/10 transition-colors" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">{title}</span>
          <Info className="w-3 h-3 text-[#B0AAA4]" />
        </div>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="mono-data text-2xl text-[#1A1A1A] font-bold mb-1 relative z-10">{value}</div>
      <div className={`text-[10px] font-semibold ${subColor} uppercase tracking-wider relative z-10`}>{subText}</div>
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
    <div className="pt-32 pb-32 px-6 md:px-12 max-w-[1700px] mx-auto">
      {/* Header */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
             <span className="w-[6px] h-[6px] rounded-full bg-[#FF6B00] inline-block" />
             <span className="text-[11px] font-semibold text-[#FF6B00] uppercase tracking-[0.15em]">Vault Active</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-[#1A1A1A]">
            Portfolio Overview
          </h1>
          <p className="text-[#71717A] text-lg leading-relaxed max-w-xl">
             Manage your active parametric coverages. Monitor real-time oracle event triggers and claim history on the Arbitrum ledger.
          </p>
        </div>
        
        {isUserConnected && (
          <div className="flex flex-col items-end gap-3">
             <div className="flex items-center gap-6 p-5 bg-white rounded-2xl border border-black/[0.04] shadow-card backdrop-blur-xl">
                <div className="w-11 h-11 bg-[#FF6B00]/10 rounded-xl flex items-center justify-center">
                    <Wallet className={`w-5 h-5 ${client ? 'text-[#FF6B00]' : 'text-[#71717A]'}`} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider leading-none">
                      {client ? 'Smart Account (Safe)' : 'Connected Wallet'}
                    </span>
                    <span className="mono-data text-sm text-[#1A1A1A] font-bold tracking-tight">
                      {address?.slice(0, 10)}...{address?.slice(-6)}
                    </span>
                </div>
                {client && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(address!);
                    }}
                    className="p-2 hover:bg-black/[0.03] rounded-lg transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#71717A]" />
                  </button>
                )}
             </div>
          </div>
        )}
      </header>

      {!isUserConnected ? (
        <div className="text-center py-32 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-black/[0.04] mb-8 shadow-card">
             <Fingerprint className="w-10 h-10 text-[#B0AAA4]" />
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-4">Connect Your Wallet</h2>
          <p className="text-[#71717A] max-w-sm mx-auto leading-relaxed mb-8">
            Please authenticate your wallet to access the portfolio ledger and active protection matrix.
          </p>
          <button className="px-8 py-4 bg-[#FF6B00] text-white text-sm font-semibold rounded-full hover:bg-[#E55E00] transition-all shadow-orange-md">
             Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* HUD Bento */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            <div className="bg-white p-7 rounded-2xl border border-black/[0.04] relative group transition-all hover:shadow-card-hover overflow-hidden shadow-card">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck className="w-12 h-12 text-[#FF6B00]" />
                </div>
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Active Coverage</span>
                        <Info className="w-3 h-3 text-[#B0AAA4]" />
                    </div>
                </div>
                <div className="mono-data text-3xl text-[#1A1A1A] font-bold tracking-tight mb-1 relative z-10">
                    {isLoading ? "..." : totalActive.toString()}
                </div>
                <div className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Scanning Live Events</div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-black/[0.04] relative group transition-all hover:shadow-card-hover overflow-hidden shadow-card">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap className="w-12 h-12 text-amber-500" />
                </div>
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Locked Premiums</span>
                        <Info className="w-3 h-3 text-[#B0AAA4]" />
                    </div>
                </div>
                <div className="mono-data text-3xl text-[#1A1A1A] font-bold tracking-tight mb-1 relative z-10">
                    ${isLoading ? "..." : lockedPremiums.toFixed(2)}
                </div>
                <div className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Escrowed in Protocol</div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-black/[0.04] relative group transition-all hover:shadow-card-hover overflow-hidden shadow-card">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <History className="w-12 h-12 text-[#71717A]" />
                </div>
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Settled Returns</span>
                        <Info className="w-3 h-3 text-[#B0AAA4]" />
                    </div>
                </div>
                <div className="mono-data text-3xl text-[#71717A] font-bold tracking-tight mb-1 relative z-10">
                    ${isLoading ? "..." : settledReturns.toFixed(2)}
                </div>
                <div className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Verified Finality</div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-black/[0.04] relative group transition-all hover:shadow-card-hover overflow-hidden shadow-card">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Wallet className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">USDT Balance</span>
                        <Info className="w-3 h-3 text-[#B0AAA4]" />
                    </div>
                </div>
                <div className="mono-data text-3xl text-emerald-500 font-bold tracking-tight mb-1 relative z-10">${formattedBalance}</div>
                <div className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Arbitrum Liquidity</div>
            </div>
          </section>

          {/* Active Policies */}
          <section className="mb-16">
            <div className="flex justify-between items-end mb-6 px-1">
              <div className="flex items-center gap-3">
                 <div className="w-1 h-5 bg-[#FF6B00] rounded-full" />
                 <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Active Policies</h2>
              </div>
              <Link href="/market" className="text-[12px] font-semibold text-[#FF6B00] hover:text-[#E55E00] uppercase tracking-wider flex items-center gap-1 transition-colors">
                New Coverage <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ActivePolicies />
          </section>

          {/* Claim History */}
          <section className="mb-16">
             <div className="flex items-center gap-3 mb-6 px-1">
                 <div className="w-1 h-5 bg-[#B0AAA4] rounded-full" />
                 <h2 className="text-xl font-bold text-[#71717A] tracking-tight">Settlement History</h2>
              </div>
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-card">
                <ClaimHistory />
            </div>
          </section>

          {/* Oracle Event Stream */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6 px-1">
                <Terminal className="w-4 h-4 text-[#FF6B00]" />
                <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Live Oracle Telemetry</h2>
            </div>
            <div className="bg-[#1A1A1A] rounded-2xl p-8 border border-black/[0.04] h-72 overflow-y-auto no-scrollbar shadow-card relative">
              <div className="absolute top-4 right-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                 <span className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-wider">Feed: Arbitrum_Sepolia</span>
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
    <div className="bg-white p-6 rounded-2xl border border-black/[0.04] shadow-card">
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </div>
      <span className="text-institutional block mb-2">{label}</span>
      <span className="mono-data text-2xl text-[#1A1A1A]">{value}</span>
    </div>
  );
}

function OracleEvent({ time, msg, type }: { time: string; msg: string; type: string }) {
  return (
    <div className="flex items-start gap-8 group/line hover:bg-black/[0.03] py-1 px-2 rounded -mx-2 transition-colors duration-200">
      <span className="text-[9px] text-[#1A1A1A]/30 min-w-[90px] font-bold uppercase tracking-widest font-mono pt-0.5">{time}</span>
      <div className="flex-1">
        <span className={`mono-data text-xs leading-relaxed ${
            type === "info" ? "text-[#1A1A1A]/50" 
            : type === "system" ? "text-[#FF6B00] font-medium" 
            : "text-[#1A1A1A]/70"
        }`}>
            <span className="text-[#1A1A1A]/20 mr-2">›</span>
            {msg}
        </span>
      </div>
    </div>
  );
}
