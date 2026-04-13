"use client";

import React, { useState } from "react";
import { useAccount, useDisconnect, useReadContract, useBalance } from "wagmi";
import { CONTRACTS, ESCROW_ABI } from "@/lib/contracts";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: usdtBalance } = useBalance({ address, token: CONTRACTS.USDT });
  const formattedBalance = usdtBalance ? (Number(usdtBalance.value) / 1e6).toFixed(2) : "0.00";

  const [notifEmail, setNotifEmail] = useState("");
  const [claimAlerts, setClaimAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);

  // Read user's policies
  const { data: policyIds } = useReadContract({
    address: CONTRACTS.ESCROW,
    abi: ESCROW_ABI,
    functionName: "getUserPolicies",
    args: address ? [address] : undefined,
  });

  const totalPolicies = policyIds ? (policyIds as readonly `0x${string}`[]).length : 0;

  if (!isConnected || !address) {
    return (
      <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto text-center">
        <span className="material-symbols-outlined text-6xl text-zinc-700 mb-6">account_circle</span>
        <h1 className="text-3xl font-bold mb-4">Connect Wallet</h1>
        <p className="text-zinc-500 max-w-md mx-auto">Connect your wallet to access your profile and settings.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left: Profile Info */}
        <div className="w-full lg:w-[60%] flex flex-col gap-12">
          {/* Header */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-3xl font-bold text-white">
              {address.slice(2, 4).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">{address.slice(0, 6)}...{address.slice(-4)}</h1>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    toast.success("Address copied to clipboard");
                  }}
                  className="material-symbols-outlined text-sm text-zinc-500 hover:text-on-surface transition-colors cursor-pointer"
                >
                  content_copy
                </button>
              </div>
              <a
                href={`https://sepolia.arbiscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary hover:underline"
              >
                View on Arbiscan →
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-2">Active Policies</span>
              <span className="mono-data text-3xl text-on-surface">{totalPolicies}</span>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-2">USDT Balance</span>
              <span className="mono-data text-3xl text-secondary">${formattedBalance}</span>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-2">Trust Score</span>
              <span className="mono-data text-3xl text-tertiary">A</span>
            </div>
          </div>

          {/* Claim History */}
          <section>
            <h2 className="text-xl font-bold mb-6">Claim History</h2>
            <div className="bg-surface-container-low rounded-lg specular-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-institutional">Policy ID</th>
                    <th className="text-left p-4 text-institutional">Type</th>
                    <th className="text-left p-4 text-institutional">Amount</th>
                    <th className="text-left p-4 text-institutional">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {totalPolicies > 0 ? (
                    (policyIds as readonly `0x${string}`[]).slice(0, 5).map((id, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-surface-container-high/50 transition-colors">
                        <td className="p-4 mono-data text-xs">{id.slice(0, 10)}...{id.slice(-6)}</td>
                        <td className="p-4 text-sm">Premium</td>
                        <td className="p-4 mono-data text-xs text-primary">$5.00</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-400/10 text-blue-400">
                            Monitoring
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-600">
                        No claim history yet. <Link href="/market" className="text-primary hover:underline">Purchase a policy →</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Settings */}
        <div className="w-full lg:w-[40%]">
          <div className="sticky top-32 flex flex-col gap-6">
            <h2 className="text-xl font-bold">Settings</h2>

            {/* Notifications */}
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-6">Notifications</span>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Claim Alerts</span>
                  <button
                    onClick={() => setClaimAlerts(!claimAlerts)}
                    className={`w-10 h-6 rounded-full transition-colors ${claimAlerts ? 'bg-primary-container' : 'bg-surface-container-highest'} relative`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${claimAlerts ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Price Alerts</span>
                  <button
                    onClick={() => setPriceAlerts(!priceAlerts)}
                    className={`w-10 h-6 rounded-full transition-colors ${priceAlerts ? 'bg-primary-container' : 'bg-surface-container-highest'} relative`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${priceAlerts ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-4">Email Notifications</span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-surface-container-lowest p-3 rounded text-sm font-body focus:ring-1 focus:ring-secondary/50"
                />
                <button
                  onClick={() => toast.info("Email notifications coming soon")}
                  className="px-4 py-3 bg-primary-container text-on-primary-fixed rounded text-institutional hover:brightness-110 transition-all"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="bg-surface-container-low p-6 rounded-lg specular-border">
              <span className="text-institutional block mb-6">Security</span>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => toast.info("Token approvals can be revoked via Arbiscan")}
                  className="w-full py-3 bg-surface-container-highest text-on-surface rounded-lg text-institutional flex items-center justify-center gap-2 hover:bg-surface-bright transition-all"
                >
                  <span className="material-symbols-outlined text-sm">shield</span>
                  Revoke Permissions
                </button>
                <button
                  onClick={() => { disconnect(); toast.info("Wallet disconnected"); }}
                  className="w-full py-3 bg-red-500/10 text-red-400 rounded-lg text-institutional flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
