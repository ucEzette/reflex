"use client";

import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useSponsoredTx } from "@/hooks/useSponsoredTx";
import { CONTRACTS, LP_POOL_ABI, ERC20_ABI, POOLS } from "@/lib/contracts";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Wallet, 
  Layers, 
  Globe, 
  Info, 
  ChevronDown, 
  CheckCircle2,
  Droplets,
  Zap,
  Activity
} from "lucide-react";
import Link from "next/link";

type PoolInfo = typeof POOLS[0];

export default function InvestPage() {
  const { authenticated, user } = usePrivy();
  const { address: eoaAddress, isConnected } = useAccount();
  const { sendSponsoredTransaction, isExecuting: isSponsoring, smartAccount } = useSponsoredTx();
  
  // Robust Identity Search
  const embeddedWallet = user?.linkedAccounts.find(account => account.type === 'wallet');
  const privyAddress = (embeddedWallet as any)?.address;
  const address = smartAccount || privyAddress || eoaAddress;

  const { data: usdtBalance, refetch: refetchBalance } = useBalance({ address: address as `0x${string}`, token: CONTRACTS.USDT });
  const formattedBalance = usdtBalance ? (Number(usdtBalance.value) / 1e6).toFixed(2) : "0.00";

  const [selectedPool, setSelectedPool] = useState<PoolInfo>(POOLS[0]);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  // Read pool data
  const { data: totalAssets, refetch: refetchAssets } = useReadContract({
    address: selectedPool.address,
    abi: LP_POOL_ABI,
    functionName: "totalAssets",
  });

  const { data: userShares, refetch: refetchShares } = useReadContract({
    address: selectedPool.address,
    abi: LP_POOL_ABI,
    functionName: "lpShares",
    args: address ? [address] : undefined,
  });

  // USDT allowance check for LP pool
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.USDT,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, selectedPool.address] : undefined,
  });

  const parsedAmount = amount ? parseUnits(amount, 6) : BigInt(0);
  const needsApproval = mode === "deposit" && allowance !== undefined && (allowance as bigint) < parsedAmount;

  // Write operations (Fallback for EOA, preferred is Sponsored)
  const { writeContract: approve, data: approveTxHash, isPending: isApproving } = useWriteContract();
  const { writeContract: execute, data: executeTxHash, isPending: isExecuting } = useWriteContract();
  const { writeContract: mint, data: mintTxHash, isPending: isMinting } = useWriteContract();

  const { isLoading: isConfirmingApprove, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isLoading: isConfirmingExecute, isSuccess: executeConfirmed } = useWaitForTransactionReceipt({ hash: executeTxHash });
  const { isLoading: isConfirmingMint, isSuccess: mintConfirmed } = useWaitForTransactionReceipt({ hash: mintTxHash });

  useEffect(() => {
    if (approveConfirmed) {
      toast.success("USDT_APPROVAL_GRANTED", {
        description: `Allowance finalized: ${approveTxHash?.slice(0, 10)}...`,
        action: {
          label: "VIEW_TX",
          onClick: () => window.open(`https://sepolia.arbiscan.io/tx/${approveTxHash}`, "_blank"),
        },
        duration: 8000,
      });
      refetchAllowance();
    }
  }, [approveConfirmed, refetchAllowance, approveTxHash]);

  useEffect(() => {
    if (executeConfirmed) {
      toast.success(mode === "deposit" ? "CAPITAL_INGRESS_SUCCESS" : "LIQUIDITY_EXIT_SUCCESS", {
        description: `Finalized on-chain: ${executeTxHash?.slice(0, 10)}...`,
        action: {
          label: "EXPLORER",
          onClick: () => window.open(`https://sepolia.arbiscan.io/tx/${executeTxHash}`, "_blank"),
        },
        duration: 8000,
      });
      refetchBalance();
      refetchShares();
      refetchAssets();
      setAmount("");
    }
  }, [executeConfirmed, mode, refetchBalance, refetchShares, refetchAssets, executeTxHash]);

  useEffect(() => {
    if (mintConfirmed) {
      toast.success("1000 USDT Mock Minted!");
      refetchBalance();
    }
  }, [mintConfirmed, refetchBalance]);

  const handleMint = async () => {
    if (!address) {
        toast.error("Please connect your wallet/identity first.");
        return;
    }
    
    // Always prefer sponsored mint for social/safe accounts
    if (smartAccount || isConnected === false) {
        try {
            toast.info("Vectoring Sponsored Faucet Claim...");
            await sendSponsoredTransaction({
                address: CONTRACTS.USDT,
                abi: ERC20_ABI,
                functionName: "mint",
                args: [address, parseUnits("1000", 6)],
            });
            refetchBalance();
            return;
        } catch (err) {
            console.error("Sponsored mint failed", err);
            // Fallback handled by hook/toast
            return;
        }
    }

    // Standard Wallet Fallback
    mint({
      address: CONTRACTS.USDT,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [address, parseUnits("1000", 6)],
    });
  };

  const handleApprove = async () => {
    if (smartAccount) {
        await sendSponsoredTransaction({
            address: CONTRACTS.USDT,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [selectedPool.address, parsedAmount * BigInt(2)],
        });
        refetchAllowance();
        return;
    }
    approve({
      address: CONTRACTS.USDT,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [selectedPool.address, parsedAmount * BigInt(2)],
    });
  };

  const handleExecute = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (smartAccount) {
        await sendSponsoredTransaction({
            address: selectedPool.address,
            abi: LP_POOL_ABI,
            functionName: mode === "deposit" ? "depositLiquidity" : "withdrawLiquidity",
            args: [parsedAmount],
        });
        refetchBalance();
        refetchShares();
        refetchAssets();
        setAmount("");
        return;
    }

    if (mode === "deposit") {
      execute({
        address: selectedPool.address,
        abi: LP_POOL_ABI,
        functionName: "depositLiquidity",
        args: [parsedAmount],
      });
    } else {
      execute({
        address: selectedPool.address,
        abi: LP_POOL_ABI,
        functionName: "withdrawLiquidity",
        args: [parsedAmount],
      });
    }
  };

  const poolTvl = totalAssets ? (Number(formatUnits(totalAssets as bigint, 6))).toFixed(2) : "0.00";
  const userSharesFormatted = userShares ? (Number(formatUnits(userShares as bigint, 6))).toFixed(2) : "0.00";

  const isUserConnected = authenticated || isConnected || (smartAccount !== undefined);

  return (
    <div className="pt-40 pb-32 px-12 max-w-[1700px] mx-auto">
      {/* Header */}
      <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-1.5 bg-[#FF6B00] rounded-full" />
             <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-[0.5em]">Capital Allocation</span>
          </div>
          <h1 className="text-7xl font-bold tracking-[-0.05em] mb-6 text-[#1A1A1A] uppercase">
            Underwriting Terminal
          </h1>
          <p className="text-[#71717A] text-lg font-medium leading-relaxed max-w-xl">
             Deploy collateral to isolated risk vectors and capture technical premiums from global parametric markets.
          </p>
        </div>
        <div className="flex items-center gap-8 py-4 px-8 bg-black/[0.02] rounded-3xl border border-black/[0.04]">
             <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest">Global APY</span>
                 <span className="mono-data text-sm text-emerald-500 font-bold">12.4% Avg</span>
             </div>
             <div className="w-[1px] h-8 bg-black/[0.03]" />
             <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest">Open Capacity</span>
                 <span className="mono-data text-sm text-[#1A1A1A] font-bold">$4.2M Lib</span>
             </div>
        </div>
      </header>

      {/* Step Guide */}
      <details className="mb-16 group outline-none bg-white p-6 rounded-2xl border border-black/[0.04]">
        <summary className="cursor-pointer flex items-center justify-between outline-none mb-0 group-open:mb-8 list-none group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">How Underwriting Works</h3>
              <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-0.5">Yield generation overview</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-[#71717A] transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {[
            { step: "01", title: "Select Pool", desc: "Choose a risk sector that matches your risk appetite.", icon: Layers, color: "text-blue-400" },
            { step: "02", title: "Deposit USDT", desc: "Fund the liquidity vault with on-chain collateral.", icon: Droplets, color: "text-emerald-400" },
            { step: "03", title: "Earn Premiums", desc: "Automatically accrue yield from every policy sold.", icon: Zap, color: "text-amber-400" },
            { step: "04", title: "Withdraw", desc: "Exit your position at any time with accrued rewards.", icon: CheckCircle2, color: "text-primary" },
          ].map((s) => (
            <div key={s.step} className="bg-white p-6 rounded-xl border border-black/[0.04] relative overflow-hidden group/step">
                <s.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 ${s.color}`} />
              <span className="mono-data text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest">{s.step}</span>
              <h3 className="font-bold text-[#1A1A1A] mt-4 mb-2">{s.title}</h3>
              <p className="text-[#888888] text-[11px] leading-relaxed relative z-10">{s.desc}</p>
            </div>
          ))}
        </div>
      </details>

      {/* Stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        <div className="bg-white p-8 rounded-[2rem] border border-black/[0.04] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <Layers className="w-12 h-12 text-[#71717A]" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider">LP Shares Owned</span>
          </div>
          <div className="mono-data text-3xl text-[#1A1A1A] font-bold tracking-tighter mb-1">{userSharesFormatted}</div>
          <p className="text-[9px] font-bold text-[#D1CBC5] uppercase tracking-widest">Active underwriting power</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-black/[0.04] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <Globe className="w-12 h-12 text-secondary" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider">Total Vault TVL</span>
          </div>
          <div className="mono-data text-3xl text-secondary font-bold tracking-tighter mb-1">${poolTvl}</div>
          <p className="text-[9px) font-bold text-[#D1CBC5] uppercase tracking-widest">Deployed in {selectedPool.name}</p>
        </div>
 
        <div className="bg-white p-8 rounded-[2rem] border border-black/[0.04] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <Wallet className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider">USDT Balance</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="mono-data text-3xl text-[#1A1A1A] font-bold tracking-tighter">${formattedBalance}</div>
            {isUserConnected && (
              <button 
                onClick={handleMint} 
                disabled={isMinting || isSponsoring}
                className="text-[9px] bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-bold uppercase tracking-[0.15em] disabled:opacity-50"
              >
                {isMinting ? "Syncing..." : "Faucet"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-black/[0.04] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-12 h-12 text-tertiary" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px) font-bold text-[#B0AAA4] uppercase tracking-wider">Collateral Health</span>
          </div>
          <div className="mono-data text-3xl text-emerald-500 font-bold tracking-tighter mb-1">100.0%</div>
          <p className="text-[9px] font-bold text-emerald-900 uppercase tracking-widest">Maximum Solvency Range</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-20">
        {/* Pool Selector */}
        <div className="w-full lg:w-[50%] flex flex-col gap-4">
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-2xl font-bold uppercase tracking-tighter text-[#1A1A1A]">Risk Matrix Registry</h2>
            <Link href="/analytics" className="text-[10px] text-[#71717A] hover:text-[#1A1A1A] uppercase tracking-wider font-bold transition-colors flex items-center gap-2">
                ANALYSIS HUD
                <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {POOLS.map((pool) => (
            <button
              key={pool.id}
              onClick={() => setSelectedPool(pool)}
              className={`w-full flex items-center justify-between p-8 rounded-3xl transition-all border group relative overflow-hidden ${
                selectedPool.id === pool.id
                  ? "bg-[#FF6B00]/10 border-[#FF6B00]/40 shadow-[0_20px_60px_rgba(255,107,0,0.1)]"
                  : "bg-black border-black/[0.04] hover:border-black/[0.06] hover:bg-black/[0.02]"
              }`}
            >
              {selectedPool.id === pool.id && (
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#FF6B00]" />
              )}
              <div className="flex items-center gap-8 relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-black/[0.02] flex items-center justify-center border border-black/[0.04] group-hover:scale-110 transition-transform duration-500`}>
                   <span className={`material-symbols-outlined ${pool.color} text-3xl`}>{pool.icon}</span>
                </div>
                <div className="text-left">
                  <h3 className={`font-bold text-lg tracking-tight uppercase ${selectedPool.id === pool.id ? 'text-[#1A1A1A]' : 'text-[#71717A]'}`}>{pool.name}</h3>
                  <p className="text-[#B0AAA4] text-[10px] mt-1 font-bold uppercase tracking-wider">{pool.sector}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <span className="mono-data text-[10px] text-[#D1CBC5] font-bold tracking-widest uppercase transition-colors group-hover:text-[#B0AAA4]">{pool.address.slice(0, 6)}...{pool.address.slice(-4)}</span>
                {selectedPool.id === pool.id ? (
                  <CheckCircle2 className="w-6 h-6 text-[#FF6B00] fill-[#FF6B00]/10" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-black/[0.04] group-hover:border-white/20 transition-all" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Action Panel */}
        <div className="w-full lg:w-[50%]">
          <div className="sticky top-40 bg-white rounded-[3.5rem] p-12 border border-black/[0.04] shadow-2xl flex flex-col gap-10 relative overflow-hidden group/panel">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent" />
            
            <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-3xl font-bold text-[#1A1A1A] tracking-tighter uppercase mb-2">Vault Console</h3>
                        <p className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest">{selectedPool.id === 'CAT_SEPT_26' ? 'Isolated Parametric Risk' : 'Generic Underlying Capacity'}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#71717A] font-bold uppercase tracking-widest bg-black/[0.02] px-4 py-2 rounded-2xl border border-black/[0.04]">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]" />
                        SYNCED: L2 NODES
                    </div>
                </div>

                <div className="flex p-2 bg-black rounded-2xl border border-black/[0.04]">
                <button
                    onClick={() => setMode("deposit")}
                    className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-3 ${
                    mode === "deposit" 
                    ? "bg-[#FF6B00] text-white shadow-2xl" 
                    : "text-[#B0AAA4] hover:text-[#1A1A1A]"
                    }`}
                >
                    <ArrowDownLeft className="w-4 h-4" />
                    DEPOSIT
                </button>
                <button
                    onClick={() => setMode("withdraw")}
                    className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-3 ${
                    mode === "withdraw" 
                    ? "bg-[#FF6B00] text-white shadow-2xl" 
                    : "text-[#B0AAA4] hover:text-[#1A1A1A]"
                    }`}
                >
                    <ArrowUpRight className="w-4 h-4" />
                    WITHDRAW
                </button>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest">Auth_Scalar_Input</label>
                <button onClick={() => setAmount(formattedBalance)} className="text-[10px] font-bold text-[#FF6B00] tracking-wider hover:text-[#1A1A1A] transition-colors uppercase underline decoration-[#FF6B00]/30 underline-offset-4">Max_Limit</button>
              </div>
              <div className="bg-white p-10 rounded-3xl border border-black/[0.04] focus-within:border-[#FF6B00]/50 transition-all shadow-inner group/input">
                <div className="flex items-center justify-between">
                    <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent border-none p-0 w-full mono-data text-5xl font-bold tracking-tighter focus:ring-0 text-[#1A1A1A] placeholder:text-zinc-900"
                    />
                    <div className="flex flex-col items-end">
                        <span className="mono-data text-xl text-[#B0AAA4] font-bold tracking-tight uppercase">USDT</span>
                        <span className="text-[8px] font-bold text-[#D1CBC5] tracking-wider uppercase mt-1">ERC-20 Vector</span>
                    </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-black/[0.02] p-8 rounded-[2rem] border border-black/[0.04] relative group/info overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest">Network Gas Estimate</span>
                <span className="mono-data text-xs text-[#71717A] font-bold tracking-widest">~0.00042 ETH</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-black/[0.04]">
                <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest">Projected LP Output</span>
                <span className="mono-data text-xl text-emerald-500 font-bold tracking-tighter">+{amount || "0.00"}</span>
              </div>
            </div>

            <div className="relative z-10">
                {!isConnected && (smartAccount === undefined) ? (
                <div className="bg-white p-6 rounded-2xl text-center border border-dashed border-black/[0.06] text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider">
                    SYSTEM AUTHENTICATION REQUIRED
                </div>
                ) : (
                <button
                    onClick={mode === "deposit" && needsApproval ? handleApprove : handleExecute}
                    disabled={isExecuting || isConfirmingExecute || isApproving || isConfirmingApprove || isSponsoring}
                    className="w-full py-7 bg-white text-black hover:bg-zinc-200 rounded-[2rem] font-bold text-[11px] tracking-wider uppercase flex items-center justify-center gap-4 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.05)] active:scale-[0.98] disabled:opacity-20 group/btn"
                >
                    {isExecuting || isConfirmingExecute || isApproving || isConfirmingApprove || isSponsoring ? (
                        <>
                             <Activity className="w-5 h-5 animate-spin" />
                             Processing Matrix Finality…
                        </>
                    ) : (
                        <>
                            {(mode === "deposit" && needsApproval) ? "Authorize System Ingress" : mode === "deposit" ? "Initialize Technical Capital" : "Confirm Liquidity Exit"}
                            <Zap className="w-4 h-4 fill-current group-hover/btn:scale-125 transition-transform" />
                        </>
                    )}
                </button>
                )}
            </div>
            
            <p className="text-[9px] text-[#B0AAA4] text-center font-bold leading-relaxed uppercase tracking-widest px-8">
                Execution finality relies on Arbitrum Sepolia sequencer availability. Standard protocol risks applies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
