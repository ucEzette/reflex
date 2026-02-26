"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { ESCROW_ABI, ERC20_ABI } from "@/lib/contracts";
import { CONTRACTS, POLICY_PREMIUM, POLICY_PAYOUT, POLICY_DURATION_HOURS } from "@/lib/wagmiConfig";

export function MarketInterface() {
    const [flightCode, setFlightCode] = useState("");
    const [windSpeed, setWindSpeed] = useState(42);
    const [altitude, setAltitude] = useState(32000);
    const [riskFactor, setRiskFactor] = useState(1.2);

    // Validation & Checkout State
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [flightDetails, setFlightDetails] = useState<any>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    /* ── Web3 Integration ── */
    const { address, isConnected } = useAccount();

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

    const { writeContract: approveUsdc, data: approveTxHash, isPending: isApproving, error: approveError } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });

    const { writeContract: purchasePolicy, data: purchaseTxHash, isPending: isPurchasing, error: purchaseError } = useWriteContract();
    const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
        hash: purchaseTxHash,
        query: { enabled: !!purchaseTxHash },
    });

    const hasEnoughAllowance = allowance ? (allowance as bigint) >= POLICY_PREMIUM : false;
    const isProcessing = isApproving || isApproveConfirming || isPurchasing || isPurchaseConfirming;

    const handleApprove = () => {
        approveUsdc({
            address: CONTRACTS.USDC,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACTS.ESCROW, POLICY_PREMIUM],
        });
    };

    const handlePurchase = () => {
        if (!flightDetails) return;
        purchasePolicy({
            address: CONTRACTS.ESCROW,
            abi: ESCROW_ABI,
            functionName: "purchasePolicy",
            args: [flightDetails.flightId || flightDetails.flightNumber || flightCode.trim().toUpperCase(), POLICY_PREMIUM, POLICY_PAYOUT, POLICY_DURATION_HOURS],
        });
    };

    useEffect(() => {
        if (isApproving) toast.loading("Requesting allowance...", { id: "approve" });
        if (isApproveConfirming) toast.loading("Confirming on-chain...", { id: "approve" });
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


    // Mock telemetry updates (only when not showing real flight info)
    useEffect(() => {
        if (flightDetails) return;
        const interval = setInterval(() => {
            setWindSpeed(prev => Math.max(20, Math.min(150, prev + (Math.random() * 10 - 5))));
            setAltitude(prev => Math.max(10000, Math.min(40000, prev + (Math.random() * 200 - 100))));
            setRiskFactor(prev => Math.max(0.8, Math.min(5.0, prev + (Math.random() * 0.1 - 0.05))));
        }, 1500);
        return () => clearInterval(interval);
    }, [flightDetails]);

    /* ── Validate Flight against API ── */
    useEffect(() => {
        const validateFlight = async () => {
            if (flightCode.trim().length < 3) {
                setFlightDetails(null);
                setValidationError(null);
                return;
            }

            setIsValidating(true);
            setValidationError(null);

            try {
                const res = await fetch(`/api/flight?flight_iata=${flightCode.trim().toUpperCase()}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to validate flight");
                }

                setFlightDetails(data);
                setValidationError(null);
            } catch (err: any) {
                setFlightDetails(null);
                setValidationError(err.message || "An unknown error occurred");
            } finally {
                setIsValidating(false);
            }
        };

        const timer = setTimeout(() => validateFlight(), 800);
        return () => clearTimeout(timer);
    }, [flightCode]);

    const handleBoost = () => {
        if (flightDetails) return;
        setWindSpeed(prev => prev + 50);
        setRiskFactor(prev => prev + 0.5);
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return "--:--";
        const date = new Date(isoString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    return (
        <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-end xl:mr-48 px-6 lg:px-24 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-[420px] rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40 xl:bg-black/20"
                style={{ backdropFilter: "blur(12px) brightness(1.2) contrast(1.1)" }}>

                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 via-red-500 to-cyan-500 rounded-t-2xl opacity-80" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-600/20 blur-[80px] rounded-full pointer-events-none" />

                <h1 className="text-3xl font-black text-white mb-2 tracking-tighter mix-blend-plus-lighter">
                    Flight Market
                </h1>
                <p className="text-slate-300 font-light mb-8 text-sm leading-relaxed drop-shadow-md">
                    Insure against delays and turbulence. Powered by <span className="text-cyan-400 font-mono font-bold">Chainlink Oracles</span>.
                </p>

                {showCheckout ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 mb-2 transition-colors">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Flight Search
                        </button>

                        <div className="p-5 bg-gradient-to-br from-[#161d2f] to-[#0B0F19] border border-white/5 rounded-xl text-left">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-400 font-medium">{flightDetails?.airline} • {flightDetails?.flightNumber}</span>
                                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-sm tracking-widest">PREMIUM</span>
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold text-white tracking-tighter">50.00</span>
                                <span className="text-lg font-medium text-slate-500 mb-1.5">USDC</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed text-left">Guaranteed 24/7 monitoring via decentralized oracles. Immediate <span className="text-white font-bold">500.00 USDC payout</span> if departure delay exceeds 120 minutes or the flight is cancelled.</p>

                            <div className="mt-6">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                                    <span>Chainlink Verified Market</span>
                                </div>
                            </div>
                        </div>

                        {usdcBalance !== undefined && isConnected && (
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-tight bg-white/5 px-4 py-3 rounded-lg border border-white/5">
                                <span className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    BAL: {(Number(usdcBalance) / 1e6).toFixed(2)} USDC
                                </span>
                                <span className={hasEnoughAllowance ? "text-green-400" : "text-yellow-500"}>
                                    {hasEnoughAllowance ? "ALLOWANCE READY" : "APPROVAL REQ."}
                                </span>
                            </div>
                        )}

                        {!isConnected ? (
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-sm text-slate-400">Please connect your wallet to purchase this policy.</p>
                            </div>
                        ) : purchaseSuccess ? (
                            <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                <span className="material-symbols-outlined text-green-400 mb-2 text-3xl">verified</span>
                                <p className="text-sm text-green-400 font-bold">Policy Secured</p>
                                <p className="text-xs text-slate-400 mt-1">Your coverage is now active.</p>
                            </div>
                        ) : (
                            <button
                                onClick={hasEnoughAllowance ? handlePurchase : handleApprove}
                                disabled={isProcessing}
                                className={`w-full h-14 rounded-xl bg-gradient-to-r ${hasEnoughAllowance ? 'from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-900/40' : 'from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-900/40'} transition-all duration-500 text-white font-bold tracking-[0.1em] uppercase text-[11px] shadow-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <div className="absolute inset-0 flex items-center justify-between px-6 z-10 transition-opacity">
                                    <span className="flex flex-col items-start leading-tight text-left">
                                        <span className="text-[9px] font-normal text-white/70 tracking-widest">{hasEnoughAllowance ? 'Purchase Policy' : 'Unlock Assets'}</span>
                                        <span className="text-sm tracking-tight">{hasEnoughAllowance ? '50.00 USDC' : 'Approve Contract'}</span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {isProcessing ? (
                                            <span className="flex items-center gap-2 text-xs">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" strokeDashoffset="12" />
                                                </svg>
                                                TX PENDING
                                            </span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">{hasEnoughAllowance ? 'receipt_long' : 'key'}</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center justify-between">
                                <span>Target Flight ID</span>
                                {isValidating && <span className="text-cyan-400">Validating...</span>}
                            </label>
                            <div className="relative">
                                <input
                                    value={flightCode}
                                    onChange={(e) => setFlightCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. AA100"
                                    className={`w-full bg-white/5 border ${validationError ? 'border-red-500/50' : flightDetails ? 'border-cyan-500/50' : 'border-white/10'} rounded-lg text-white font-mono h-14 px-4 text-xl uppercase focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-bold placeholder:text-white/20 outline-none backdrop-blur-md`}
                                />
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none mix-blend-overlay"></div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                    {isValidating ? (
                                        <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" strokeDashoffset="12" />
                                        </svg>
                                    ) : flightDetails ? (
                                        <span className="material-symbols-outlined text-cyan-400">verified</span>
                                    ) : validationError ? (
                                        <span className="material-symbols-outlined text-red-500">error</span>
                                    ) : null}
                                </div>
                            </div>
                            {validationError && (
                                <p className="mt-2 text-xs text-red-400 font-mono drop-shadow-md">{validationError}</p>
                            )}
                        </div>

                        {flightDetails ? (
                            <div className="p-4 rounded-lg bg-surface-dark border border-white/10 relative overflow-hidden backdrop-blur-sm">
                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="text-white font-medium filter drop-shadow-md">{flightDetails.airline}</span>
                                    <span className="text-cyan-400 font-mono text-xs font-bold tracking-wider">{flightDetails.status?.toUpperCase() || 'UNKNOWN'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex flex-col flex-1">
                                        <span className="text-slate-400 font-mono tracking-widest mb-1">DEP</span>
                                        <span className="text-white font-bold text-2xl drop-shadow-md">{flightDetails.departure.iata}</span>
                                        <span className="text-cyan-400 font-mono tracking-wider mt-1">{formatTime(flightDetails.departure.scheduled)}</span>
                                    </div>
                                    <div className="flex-1 border-t border-dashed border-white/20 relative">
                                        <span className="material-symbols-outlined text-white/50 text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/20 px-1 rounded-full px-2">flight_takeoff</span>
                                    </div>
                                    <div className="flex flex-col flex-1 text-right">
                                        <span className="text-slate-400 font-mono tracking-widest mb-1">ARR</span>
                                        <span className="text-white font-bold text-2xl drop-shadow-md">{flightDetails.arrival.iata}</span>
                                        <span className="text-cyan-400 font-mono tracking-wider mt-1">{formatTime(flightDetails.arrival.scheduled)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-4 pt-4 border-t border-white/10 text-[10px] uppercase font-mono tracking-wider">
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 mb-0.5">Date</span>
                                        <span className="text-slate-300">{flightDetails.flightDate || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-slate-500 mb-0.5">Aircraft</span>
                                        <span className="text-slate-300">{flightDetails.aircraft || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 mb-0.5">Dep. Info</span>
                                        <span className="text-slate-300">{flightDetails.departure.terminal ? `T${flightDetails.departure.terminal}` : '---'} / Gate {flightDetails.departure.gate || '---'}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-slate-500 mb-0.5">Arr. Info</span>
                                        <span className="text-slate-300">{flightDetails.arrival.terminal ? `T${flightDetails.arrival.terminal}` : '---'} / Gate {flightDetails.arrival.gate || '---'}</span>
                                    </div>
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-slate-500 mb-0.5">Timezones</span>
                                        <span className="text-slate-300">{flightDetails.departure.timezone || 'Unknown'} ➔ {flightDetails.arrival.timezone || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4 py-5 border-y border-white/10 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-white/5 to-black/0 mix-blend-overlay pointer-events-none"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Wind</span>
                                    <span className="text-white font-mono font-semibold text-lg drop-shadow-md">{windSpeed.toFixed(0)} <span className="text-slate-500 text-xs">kts</span></span>
                                </div>
                                <div className="flex flex-col items-center border-x border-white/5">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Alt</span>
                                    <span className="text-white font-mono font-semibold text-lg drop-shadow-md">{altitude.toFixed(0)} <span className="text-slate-500 text-xs">ft</span></span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Risk</span>
                                    <span className="text-cyan-400 font-mono font-semibold text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">{riskFactor.toFixed(2)}x</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowCheckout(true)}
                            onMouseEnter={handleBoost}
                            disabled={!flightDetails || isValidating}
                            className={`w-full h-14 rounded-lg bg-gradient-to-r ${flightDetails ? 'from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-900/40' : 'from-slate-700 to-slate-600 opacity-50 cursor-not-allowed'} transition-all duration-500 text-white font-bold tracking-[0.2em] uppercase text-xs shadow-xl relative overflow-hidden group`}
                        >
                            <span className="relative z-10 mix-blend-plus-lighter">{flightDetails ? "Proceed to Checkout" : "Awaiting Flight"}</span>
                            {flightDetails && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
