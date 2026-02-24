"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { ESCROW_ABI, ERC20_ABI } from "@/lib/contracts";
import { CONTRACTS, POLICY_PREMIUM, POLICY_PAYOUT, POLICY_DURATION_HOURS } from "@/lib/wagmiConfig";

export function PolicyDashboard() {
    const { address, isConnected } = useAccount();
    const [flightNumber, setFlightNumber] = useState("");
    const [flightDate, setFlightDate] = useState("");
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    // Flight Validation State
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [flightDetails, setFlightDetails] = useState<any | null>(null);

    /* ── Read USDC balance & allowance ── */
    const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address ? [address, CONTRACTS.ESCROW] : undefined,
        query: { enabled: !!address },
    });

    /* ── Write: Approve USDC ── */
    const { writeContract: approveUsdc, data: approveTxHash, isPending: isApproving, error: approveError } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });

    /* ── Write: Purchase Policy ── */
    const { writeContract: purchasePolicy, data: purchaseTxHash, isPending: isPurchasing, error: purchaseError } = useWriteContract();
    const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
        hash: purchaseTxHash,
        query: { enabled: !!purchaseTxHash },
    });

    const hasEnoughAllowance = allowance ? (allowance as bigint) >= POLICY_PREMIUM : false;

    // AviationStack relayer expects just the flight code
    const apiTarget = flightNumber.trim().toUpperCase();

    const handleApprove = () => {
        approveUsdc({
            address: CONTRACTS.USDC,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACTS.ESCROW, POLICY_PREMIUM],
        });
    };

    const handlePurchase = () => {
        if (!apiTarget || !flightDetails) return;
        purchasePolicy({
            address: CONTRACTS.ESCROW,
            abi: ESCROW_ABI,
            functionName: "purchasePolicy",
            args: [apiTarget, POLICY_PREMIUM, POLICY_PAYOUT, POLICY_DURATION_HOURS],
        });
    };

    /* ── Validate Flight against API ── */
    useEffect(() => {
        const validateFlight = async () => {
            if (apiTarget.length < 3) {
                setFlightDetails(null);
                setValidationError(null);
                return;
            }

            setIsValidating(true);
            setValidationError(null);

            try {
                const res = await fetch(`/api/flight?flight_iata=${apiTarget}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to validate flight");
                }

                setFlightDetails(data);
                setValidationError(null);
            } catch (err: any) {
                setFlightDetails(null);
                setValidationError(err.message);
            } finally {
                setIsValidating(false);
            }
        };

        // Debounce validation
        const timer = setTimeout(() => {
            validateFlight();
        }, 800);

        return () => clearTimeout(timer);
    }, [apiTarget]);

    /* ── Progress Toasts ── */
    useEffect(() => {
        if (isApproving) toast.loading("Requesting allowance...", { id: "approve" });
        if (isApproveConfirming) toast.loading("Confirming allowance on-chain...", { id: "approve" });
        if (isApproveSuccess) {
            toast.success("Allowance approved!", { id: "approve" });
            refetchAllowance();
        }
        if (approveError) toast.error(approveError.message.split(".")[0], { id: "approve" });
    }, [isApproving, isApproveConfirming, isApproveSuccess, approveError, refetchAllowance]);

    useEffect(() => {
        if (isPurchasing) toast.loading("Initializing purchase...", { id: "purchase" });
        if (isPurchaseConfirming) toast.loading("Securing flight insurance...", { id: "purchase" });
        if (isPurchaseSuccess) {
            toast.success("Policy secured successfully!", { id: "purchase" });
            setPurchaseSuccess(true);
            refetchBalance();
        }
        if (purchaseError) toast.error(purchaseError.message.split(".")[0], { id: "purchase" });
    }, [isPurchasing, isPurchaseConfirming, isPurchaseSuccess, purchaseError, refetchBalance]);

    const isProcessing = isApproving || isApproveConfirming || isPurchasing || isPurchaseConfirming;
    const canPurchase = flightDetails !== null && !isValidating && flightDate && isConnected;

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
            <div className="glass-panel rounded-2xl p-1 shadow-2xl shadow-black/50 overflow-hidden relative">
                <div className="bg-background-dark/80 rounded-xl p-8 border border-white/5 text-center relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-400 text-3xl">verified</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Policy Secured</h3>
                    <p className="text-sm text-slate-400 mb-4">Coverage for {flightNumber.toUpperCase()} is active.</p>
                    <a
                        href={`https://testnet.snowtrace.io/tx/${purchaseTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary text-xs font-mono hover:underline bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
                    >
                        <span>VIEW ON EXPLORER</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                    <button
                        onClick={() => setPurchaseSuccess(false)}
                        className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        Purchase Another Policy
                    </button>
                </div>
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[60px] pointer-events-none" />
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
                        <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Policy Application</h3>
                        <p className="text-sm text-slate-400">Calculate premium for instant coverage</p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 tracking-tighter">
                            Fuji Testnet v1.0
                        </div>
                    </div>
                </div>

                {/* Input Forms */}
                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest group-focus-within:text-primary transition-colors">
                            Flight Number
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-500 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined">flight_takeoff</span>
                            </div>
                            <input
                                type="text"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                placeholder="e.g. EK202"
                                className={`w-full bg-[#0B0F19] border ${validationError ? 'border-red-500/50 focus:border-red-500' : flightDetails ? 'border-primary/50 focus:border-primary' : 'border-slate-700/50 focus:border-primary/50'} text-white text-lg placeholder-slate-600 rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:ring-1 ${validationError ? 'focus:ring-red-500/20' : 'focus:ring-primary/20'} transition-all font-mono uppercase`}
                            />
                            <div className="absolute right-4">
                                {isValidating ? (
                                    <svg className="animate-spin h-5 w-5 text-slate-500" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="12" />
                                    </svg>
                                ) : flightDetails ? (
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                ) : validationError ? (
                                    <span className="material-symbols-outlined text-red-500">error</span>
                                ) : null}
                            </div>
                        </div>

                        {/* Validation Messages & Flight Data */}
                        {validationError && (
                            <p className="mt-2 text-xs text-red-400 font-mono tracking-wide">{validationError}</p>
                        )}
                        {flightDetails && (
                            <div className="mt-3 p-3 rounded-lg bg-surface-dark/50 border border-white/5 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white font-medium">{flightDetails.airline}</span>
                                    <span className="text-slate-400 font-mono text-xs">{flightDetails.status.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs mt-4">
                                    <div className="flex flex-col flex-1">
                                        <span className="text-slate-500 font-mono">DEP</span>
                                        <span className="text-slate-200 font-bold text-lg">{flightDetails.departure.iata}</span>
                                        <span className="text-white mt-1">
                                            {new Date(flightDetails.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: flightDetails.departure.timezone })}
                                        </span>
                                        <span className="text-slate-500 text-[10px] uppercase mt-0.5">
                                            {new Date(flightDetails.departure.scheduled).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', timeZone: flightDetails.departure.timezone })}
                                        </span>
                                    </div>
                                    <div className="flex-1 border-t border-dashed border-slate-600 relative">
                                        <span className="material-symbols-outlined text-slate-500 text-xs absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-dark px-1">flight_takeoff</span>
                                    </div>
                                    <div className="flex flex-col flex-1 text-right">
                                        <span className="text-slate-500 font-mono">ARR</span>
                                        <span className="text-slate-200 font-bold text-lg">{flightDetails.arrival.iata}</span>
                                        <span className="text-white mt-1">
                                            {new Date(flightDetails.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: flightDetails.arrival.timezone })}
                                        </span>
                                        <span className="text-slate-500 text-[10px] uppercase mt-0.5">
                                            {new Date(flightDetails.arrival.scheduled).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', timeZone: flightDetails.arrival.timezone })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="group">
                        <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest group-focus-within:text-primary transition-colors">
                            Policy Effective Date
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-500 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined">event</span>
                            </div>
                            <input
                                type="date"
                                value={flightDate}
                                onChange={(e) => setFlightDate(e.target.value)}
                                className="w-full bg-[#0B0F19] border border-slate-700/50 text-white text-lg placeholder-slate-600 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Coverage Details Card */}
                    <div className="mt-6 p-5 bg-gradient-to-br from-[#161d2f] to-[#0B0F19] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-400 font-medium">Auto-Settlement Tier</span>
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-sm tracking-widest">PREMIUM</span>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-white tracking-tighter">50.00</span>
                            <span className="text-lg font-medium text-slate-500 mb-1.5">USDC</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Guaranteed 24/7 monitoring. Immediate payout if arrival delay exceeds 120 minutes.</p>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                <span>zkTLS Verified</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                <span>Chain-Agnostic</span>
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    {usdcBalance !== undefined && (
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-tight bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            <span className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                BALANCE: {(Number(usdcBalance) / 1e6).toFixed(2)} USDC
                            </span>
                            <span className={hasEnoughAllowance ? "text-green-500" : "text-yellow-500"}>
                                {hasEnoughAllowance ? "• ALLOWANCE READY" : "• APPROVAL REQUIRED"}
                            </span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={canPurchase ? (hasEnoughAllowance ? handlePurchase : handleApprove) : undefined}
                        disabled={!canPurchase || isProcessing}
                        className="group w-full relative h-16 mt-4 purchase-btn-gradient rounded-xl text-white font-bold text-lg overflow-hidden transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:grayscale disabled:scale-100"
                    >
                        <div className="absolute inset-0 flex items-center justify-between px-6 z-10 transition-opacity group-disabled:opacity-80">
                            <span className="flex flex-col items-start leading-tight">
                                <span className="text-[10px] font-normal text-slate-300 uppercase tracking-widest">Insurance Premium</span>
                                <span className="text-lg tracking-tight">$5.00 USDC</span>
                            </span>
                            <div className="flex items-center gap-3">
                                {isProcessing ? (
                                    <span className="flex items-center gap-2 text-sm">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="12" />
                                        </svg>
                                        PROCESSING
                                    </span>
                                ) : !hasEnoughAllowance ? (
                                    <span className="flex items-center gap-2 text-sm tracking-wide">
                                        UNLOCK ASSETS
                                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">key</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-sm tracking-wide">
                                        INITIATE COVERAGE
                                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">bolt</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out z-0" />
                    </button>
                </div>
            </div>
        </div>
    );
}
