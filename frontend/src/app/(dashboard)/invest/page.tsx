"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, LP_POOL_ABI, ERC20_ABI, POOLS } from "@/lib/contracts";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

type PoolInfo = typeof POOLS[0];

export default function InvestPage() {
  const { address, isConnected } = useAccount();
  const { data: usdtBalance } = useBalance({ address, token: CONTRACTS.USDT });
  const formattedBalance = usdtBalance ? (Number(usdtBalance.value) / 1e6).toFixed(2) : "0.00";

  const [selectedPool, setSelectedPool] = useState<PoolInfo>(POOLS[0]);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  // Read pool data
  const { data: totalAssets } = useReadContract({
    address: selectedPool.address,
    abi: LP_POOL_ABI,
    functionName: "totalAssets",
  });

  const { data: userShares } = useReadContract({
    address: selectedPool.address,
    abi: LP_POOL_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // USDT allowance check for LP pool
  const { data: allowance } = useReadContract({
    address: CONTRACTS.USDT,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, selectedPool.address] : undefined,
  });

  const parsedAmount = amount ? parseUnits(amount, 6) : BigInt(0);
  const needsApproval = mode === "deposit" && allowance !== undefined && (allowance as bigint) < parsedAmount;

  // Write operations
  const { writeContract: approve, data: approveTxHash, isPending: isApproving } = useWriteContract();
  const { writeContract: execute, data: executeTxHash, isPending: isExecuting } = useWriteContract();

  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isSuccess: executeConfirmed } = useWaitForTransactionReceipt({ hash: executeTxHash });

  useEffect(() => {
    if (approveConfirmed) toast.success("USDT approved for deposit");
  }, [approveConfirmed]);

  useEffect(() => {
    if (executeConfirmed) toast.success(mode === "deposit" ? "Deposit successful!" : "Withdrawal successful!");
  }, [executeConfirmed, mode]);

  const handleApprove = () => {
    approve({
      address: CONTRACTS.USDT,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [selectedPool.address, parsedAmount * BigInt(2)],
    });
  };

  const handleExecute = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (mode === "deposit") {
      execute({
        address: selectedPool.address,
        abi: LP_POOL_ABI,
        functionName: "deposit",
        args: [parsedAmount, address!],
      });
    } else {
      execute({
        address: selectedPool.address,
        abi: LP_POOL_ABI,
        functionName: "withdraw",
        args: [parsedAmount, address!, address!],
      });
    }
  };

  const poolTvl = totalAssets ? (Number(formatUnits(totalAssets as bigint, 6))).toFixed(2) : "0.00";
  const userSharesFormatted = userShares ? (Number(formatUnits(userShares as bigint, 6))).toFixed(2) : "0.00";

  return (
    <div className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-16 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Underwriting <span className="text-primary">Terminal</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Provide liquidity to isolated risk pools and earn premiums from policy underwriting.
        </p>
      </header>

      {/* Step Guide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
        {[
          { step: "01", title: "Select Pool", desc: "Choose a risk sector" },
          { step: "02", title: "Deposit USDT", desc: "Fund the liquidity vault" },
          { step: "03", title: "Earn Premiums", desc: "Yield from policy sales" },
          { step: "04", title: "Withdraw", desc: "Exit anytime" },
        ].map((s) => (
          <div key={s.step} className="bg-surface-container-low p-6 rounded-lg specular-border">
            <span className="mono-data text-xs text-primary">{s.step}</span>
            <h3 className="font-bold mt-2">{s.title}</h3>
            <p className="text-zinc-500 text-xs mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-surface-container-low p-6 rounded-lg specular-border">
          <span className="text-institutional block mb-2">Your LP Shares</span>
          <span className="mono-data text-2xl">{userSharesFormatted}</span>
        </div>
        <div className="bg-surface-container-low p-6 rounded-lg specular-border">
          <span className="text-institutional block mb-2">Pool TVL</span>
          <span className="mono-data text-2xl text-secondary">${poolTvl}</span>
        </div>
        <div className="bg-surface-container-low p-6 rounded-lg specular-border">
          <span className="text-institutional block mb-2">USDT Balance</span>
          <span className="mono-data text-2xl">${formattedBalance}</span>
        </div>
        <div className="bg-surface-container-low p-6 rounded-lg specular-border">
          <span className="text-institutional block mb-2">Protocol Solvency</span>
          <span className="mono-data text-2xl text-tertiary">100%</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Pool Selector */}
        <div className="w-full lg:w-[55%] flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-4">Risk Pool Selector</h2>
          {POOLS.map((pool) => (
            <button
              key={pool.id}
              onClick={() => setSelectedPool(pool)}
              className={`w-full flex items-center justify-between p-6 rounded-lg transition-all ${
                selectedPool.id === pool.id
                  ? "bg-primary-container/20 specular-border ring-1 ring-primary/30"
                  : "bg-surface-container-low specular-border hover:bg-surface-container-high"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`material-symbols-outlined ${pool.color} text-2xl`}>{pool.icon}</span>
                <div className="text-left">
                  <h3 className="font-bold text-sm">{pool.name}</h3>
                  <p className="text-zinc-500 text-xs mt-1">{pool.sector}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="mono-data text-xs text-zinc-400">{pool.address.slice(0, 6)}...{pool.address.slice(-4)}</span>
                {selectedPool.id === pool.id && (
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Deposit/Withdraw Panel */}
        <div className="w-full lg:w-[45%]">
          <div className="sticky top-32 bg-surface-container-high rounded-lg p-8 specular-border flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedPool.sector} Pool</h3>
              <div className="flex bg-surface-container-lowest rounded-full overflow-hidden">
                <button
                  onClick={() => setMode("deposit")}
                  className={`px-6 py-2 text-institutional transition-all ${mode === "deposit" ? "bg-primary-container text-on-primary-fixed" : ""}`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setMode("withdraw")}
                  className={`px-6 py-2 text-institutional transition-all ${mode === "withdraw" ? "bg-primary-container text-on-primary-fixed" : ""}`}
                >
                  Withdraw
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-institutional">Amount (USDT)</label>
                <button onClick={() => setAmount(formattedBalance)} className="mono-data text-[10px] text-primary">MAX</button>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-none p-0 w-full mono-data text-2xl focus:ring-0 text-on-surface placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 py-4 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-sm opacity-70">Pool Address</span>
                <span className="mono-data text-xs text-zinc-400">{selectedPool.address.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-70">Action</span>
                <span className="mono-data text-xs text-secondary capitalize">{mode}</span>
              </div>
            </div>

            {!isConnected ? (
              <p className="text-center text-zinc-500 text-sm">Connect wallet to interact with pools.</p>
            ) : mode === "deposit" && needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full bg-surface-container-highest text-on-surface py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-surface-bright transition-all disabled:opacity-50"
              >
                {isApproving ? "Approving..." : "Approve USDT"}
              </button>
            ) : (
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full bg-primary-container text-white py-4 rounded-lg font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_24px_rgba(128,0,32,0.3)] disabled:opacity-50"
              >
                {isExecuting ? "Processing..." : mode === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
