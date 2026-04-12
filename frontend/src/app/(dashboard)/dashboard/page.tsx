"use client";

import React, { useMemo } from "react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { CONTRACTS, ESCROW_ABI, LP_POOL_ABI } from "@/lib/contracts";
import { formatUnits } from "viem";
import Link from "next/link";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  // Read user's policies
  const { data: policyIds } = useReadContract({
    address: CONTRACTS.ESCROW,
    abi: ESCROW_ABI,
    functionName: "getUserPolicies",
    args: address ? [address] : undefined,
  });

  const { data: usdtBalance } = useBalance({ address, token: CONTRACTS.USDT });
  const formattedBalance = usdtBalance ? (Number(usdtBalance.value) / 1e6).toFixed(2) : "0.00";
  const totalPolicies = policyIds ? (policyIds as readonly `0x${string}`[]).length : 0;

  return (
    <div className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2">
            Portfolio <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-zinc-500">Monitor active positions. Track claims and oracle events in real-time.</p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full specular-border">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="mono-data text-xs text-zinc-400">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        )}
      </header>

      {!isConnected ? (
        <div className="text-center py-40">
          <span className="material-symbols-outlined text-6xl text-zinc-700 mb-6">account_balance_wallet</span>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Connect your wallet to view your active policies, claim history, and portfolio analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Bento Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <StatCard label="Active Policies" value={totalPolicies.toString()} icon="policy" color="text-primary" />
            <StatCard label="Total Premiums Paid" value={`${(totalPolicies * 5).toFixed(2)} USDT`} icon="payments" color="text-secondary" />
            <StatCard label="Claims Received" value="—" icon="credit_score" color="text-tertiary" />
            <StatCard label="USDT Balance" value={`${formattedBalance}`} icon="account_balance" color="text-on-surface" />
          </div>

          {/* Active Policies */}
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Active Policies</h2>
              <Link href="/market" className="text-sm text-primary hover:underline">Purchase New →</Link>
            </div>
            <div className="bg-surface-container-low rounded-lg specular-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-institutional">Policy ID</th>
                    <th className="text-left p-4 text-institutional">Status</th>
                    <th className="text-left p-4 text-institutional hidden md:table-cell">Premium</th>
                    <th className="text-left p-4 text-institutional hidden md:table-cell">Max Payout</th>
                    <th className="text-left p-4 text-institutional hidden lg:table-cell">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {totalPolicies > 0 ? (
                    (policyIds as readonly `0x${string}`[]).map((id: `0x${string}`, i: number) => (
                      <PolicyRow key={i} policyId={id} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-zinc-600">
                        <span className="material-symbols-outlined text-4xl text-zinc-700 mb-2 block">inbox</span>
                        No active policies. <Link href="/market" className="text-primary hover:underline">Purchase one →</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Oracle Event Stream */}
          <section>
            <h2 className="text-xl font-bold mb-8">Oracle Event Stream</h2>
            <div className="bg-surface-container-lowest rounded-lg p-6 specular-border h-64 overflow-y-auto no-scrollbar">
              <div className="flex flex-col gap-3">
                <OracleEvent time="Just now" msg="Listening for PolicyPurchased, PolicyClaimed, PolicyExpired events..." type="info" />
                <OracleEvent time="—" msg="Connect wallet and purchase a policy to see live events." type="system" />
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

function PolicyRow({ policyId }: { policyId: `0x${string}` }) {
  const { data } = useReadContract({
    address: CONTRACTS.ESCROW,
    abi: ESCROW_ABI,
    functionName: "getPolicy",
    args: [policyId],
  });

  if (!data) {
    return (
      <tr className="border-b border-white/5 animate-pulse">
        <td className="p-4" colSpan={5}><div className="h-4 bg-surface-container-high rounded w-full" /></td>
      </tr>
    );
  }

  const [, apiTarget, premiumPaid, payoutAmount, expirationTime, isActive, isClaimed] = data as [string, string, bigint, bigint, bigint, boolean, boolean];

  const status = isClaimed ? "Claimed" : isActive ? "Active" : "Expired";
  const statusColor = isClaimed ? "text-emerald-400 bg-emerald-400/10" : isActive ? "text-blue-400 bg-blue-400/10" : "text-zinc-500 bg-zinc-500/10";

  return (
    <tr className="border-b border-white/5 hover:bg-surface-container-high/50 transition-colors">
      <td className="p-4 mono-data text-xs text-on-surface">{policyId.slice(0, 10)}...{policyId.slice(-6)}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>{status}</span>
      </td>
      <td className="p-4 mono-data text-xs text-on-surface hidden md:table-cell">${(Number(premiumPaid) / 1e6).toFixed(2)}</td>
      <td className="p-4 mono-data text-xs text-primary hidden md:table-cell">${(Number(payoutAmount) / 1e6).toFixed(2)}</td>
      <td className="p-4 mono-data text-xs text-zinc-400 hidden lg:table-cell">
        {new Date(Number(expirationTime) * 1000).toLocaleString()}
      </td>
    </tr>
  );
}

function OracleEvent({ time, msg, type }: { time: string; msg: string; type: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mono-data text-[10px] min-w-[60px] ${type === "info" ? "text-secondary" : "text-zinc-600"}`}>{time}</span>
      <span className="mono-data text-xs text-zinc-400">{msg}</span>
    </div>
  );
}
