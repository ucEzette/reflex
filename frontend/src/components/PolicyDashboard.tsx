"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_ABI, ERC20_ABI } from "@/lib/contracts";
import { CONTRACTS, POLICY_PREMIUM, POLICY_PAYOUT, POLICY_DURATION_HOURS } from "@/lib/wagmiConfig";

export function PolicyDashboard() {
    const { address, isConnected } = useAccount();
    const [flightNumber, setFlightNumber] = useState("");
    const [flightDate, setFlightDate] = useState("");
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    /* ── Read USDC balance & allowance ── */
    const { data: usdcBalance } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const { data: allowance } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address ? [address, CONTRACTS.ESCROW] : undefined,
        query: { enabled: !!address },
    });

    /* ── Write: Approve USDC ── */
    const { writeContract: approveUsdc, data: approveTxHash, isPending: isApproving } = useWriteContract();
    const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveTxHash });

    /* ── Write: Purchase Policy ── */
    const { writeContract: purchasePolicy, data: purchaseTxHash, isPending: isPurchasing } = useWriteContract();
    const { isLoading: isPurchaseConfirming } = useWaitForTransactionReceipt({
        hash: purchaseTxHash,
        query: {
            enabled: !!purchaseTxHash,
        },
    });

    const hasEnoughAllowance = allowance ? (allowance as bigint) >= POLICY_PREMIUM : false;
    const apiTarget = flightNumber && flightDate
        ? `https://aeroapi.flightaware.com/aeroapi/flights/${flightNumber.toUpperCase()}?start=${flightDate}`
        : "";

    const handleApprove = () => {
        approveUsdc({
            address: CONTRACTS.USDC,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACTS.ESCROW, POLICY_PREMIUM],
        });
    };

    const handlePurchase = () => {
        if (!apiTarget) return;
        purchasePolicy({
            address: CONTRACTS.ESCROW,
            abi: ESCROW_ABI,
            functionName: "purchasePolicy",
            args: [apiTarget, POLICY_PREMIUM, POLICY_PAYOUT, POLICY_DURATION_HOURS],
        });
        setPurchaseSuccess(true);
    };

    const isProcessing = isApproving || isApproveConfirming || isPurchasing || isPurchaseConfirming;
    const canPurchase = flightNumber.length >= 3 && flightDate && isConnected;

    /* ── Wallet Not Connected ── */
    if (!isConnected) {
        return (
            <div className="glass-panel rounded-2xl p-1 shadow-2xl shadow-black/50">
                <div className="bg-background-dark/80 rounded-xl p-8 border border-white/5 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-slate-400 text-sm">Connect your wallet to purchase flight delay insurance</p>
                </div>
            </div>
        );
    }

    /* ── Success State ── */
    if (purchaseSuccess && purchaseTxHash) {
        return (
            <div className="glass-panel rounded-2xl p-1 shadow-2xl shadow-black/50">
                <div className="bg-background-dark/80 rounded-xl p-8 border border-white/5 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Policy Active</h3>
                    <p className="text-sm text-slate-400 mb-4">Your flight delay insurance is now active</p>
                    <a
                        href={`https://testnet.snowtrace.io/tx/${purchaseTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-cyan text-xs font-mono hover:underline"
                    >
                        {purchaseTxHash.slice(0, 16)}...
                    </a>
                    <button
                        onClick={() => setPurchaseSuccess(false)}
                        className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold border border-white/10 transition-colors"
                    >
                        Purchase Another Policy
                    </button>
                </div>
            </div>
        );
    }

    /* ── Main Dashboard ── */
    return (
        <div className="glass-panel rounded-2xl p-1 shadow-2xl shadow-black/50">
            <div className="bg-background-dark/80 rounded-xl p-6 md:p-8 border border-white/5">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">New Policy Application</h3>
                        <p className="text-sm text-slate-400">Fill in details to calculate premium</p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
                            REFLEX_V1.2
                        </div>
                    </div>
                </div>

                {/* Input Forms */}
                <div className="space-y-6">
                    {/* Flight Number */}
                    <div className="group">
                        <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">
                            Flight Number
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-500 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined">flight_takeoff</span>
                            </div>
                            <input
                                type="text"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value)}
                                placeholder="e.g. AA125"
                                className="w-full bg-[#0B0F19] border border-slate-700 text-white text-lg placeholder-slate-600 rounded-lg py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono uppercase"
                            />
                            <div className="absolute right-4">
                                <span className="material-symbols-outlined text-slate-600 text-lg">wifi_tethering</span>
                            </div>
                        </div>
                    </div>

                    {/* Date Picker */}
                    <div className="group">
                        <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider group-focus-within:text-primary transition-colors">
                            Date of Travel
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-500 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined">calendar_month</span>
                            </div>
                            <input
                                type="date"
                                value={flightDate}
                                onChange={(e) => setFlightDate(e.target.value)}
                                className="w-full bg-[#0B0F19] border border-slate-700 text-white text-lg placeholder-slate-600 rounded-lg py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Coverage Details Card */}
                    <div className="mt-6 p-5 bg-[#161d2f] border border-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-400">Coverage Tier</span>
                            <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded">STANDARD</span>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-white">50</span>
                            <span className="text-xl font-medium text-slate-400 mb-1.5">USDC</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Maximum payout for &gt;2hr delay or cancellation.</p>
                        <div className="w-full h-px bg-slate-700/50 my-4" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                                <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                                <span>Automatic Payout</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                                <span>Instant Settlement</span>
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    {usdcBalance !== undefined && (
                        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                            <span>USDC Balance: ${(Number(usdcBalance) / 1e6).toFixed(2)}</span>
                            <span>Allowance: {hasEnoughAllowance ? "✓ Approved" : "Needs Approval"}</span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={canPurchase ? (hasEnoughAllowance ? handlePurchase : handleApprove) : undefined}
                        disabled={!canPurchase || isProcessing}
                        className="group w-full relative h-16 mt-4 purchase-btn-gradient rounded-xl text-white font-bold text-lg overflow-hidden transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                            <span className="flex flex-col items-start leading-tight">
                                <span className="text-xs font-normal text-slate-300 uppercase tracking-widest">Total Premium</span>
                                <span className="text-xl">$5.00 USDC</span>
                            </span>
                            <div className="flex items-center gap-3">
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="12" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : !hasEnoughAllowance ? (
                                    <>
                                        <span className="tracking-wide">APPROVE USDC</span>
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="tracking-wide">PURCHASE POLICY</span>
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out z-0" />
                    </button>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        By purchasing, you agree to the{" "}
                        <a className="text-slate-400 hover:text-white underline" href="#">Terms of Service</a>{" "}
                        and <a className="text-slate-400 hover:text-white underline" href="#">Smart Contract Rules</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
