"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { ESCROW_ABI, ERC20_ABI, CONTRACTS } from "@/lib/contracts";
import { POLICY_PREMIUM, POLICY_PAYOUT, POLICY_DURATION_HOURS } from "@/lib/wagmiConfig";
import { MarketDetail } from "@/lib/market-data";
import { CrossChainCheckout } from "./CrossChainCheckout";
import { IpfsService } from "@/services/ipfs";

export function MarketActionCard({ market }: { market: MarketDetail }) {
    const [inputValue, setInputValue] = useState("");

    // Validation & Checkout State
    const [isValidating, setIsValidating] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [showCrossChain, setShowCrossChain] = useState(false);

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

    // We use a mock numeric premium based on the display string if it contains USDC
    const numPremium = market.price.includes("USDC") ? Number(market.price.replace(/[^0-9.-]+/g, "")) * 1e6 : POLICY_PREMIUM;
    // Default max payout scaling if not strictly defined for this specific UI
    const numPayout = market.marketData.maxPayout.includes("USDC") ? Number(market.marketData.maxPayout.replace(/[^0-9.-]+/g, "")) * 1e6 : POLICY_PAYOUT;

    const hasEnoughAllowance = allowance ? (Number(allowance) >= numPremium) : false;
    const hasEnoughBalance = usdcBalance ? (Number(usdcBalance) >= numPremium) : false;
    const isProcessing = isApproving || isApproveConfirming || isPurchasing || isPurchaseConfirming;
    const canPurchase = inputValue.trim().length > 3 && isConnected && hasEnoughBalance;

    const handleApprove = () => {
        approveUsdc({
            address: CONTRACTS.USDC,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACTS.ESCROW, BigInt(numPremium)],
        });
    };

    const handlePurchase = async () => {
        setIsPurchasing(true); // Move this before async ops

        try {
            // 1. Pin metadata to IPFS
            const meta = {
                marketId: market.id,
                title: market.title,
                target: inputValue.trim(),
                payout: numPayout,
                timestamp: new Date().toISOString(),
                policyholder: address
            };

            const cid = await IpfsService.pinPolicyMetadata(meta);
            console.log("Policy metadata pinned to IPFS:", cid);

            // 2. Execute on-chain purchase
            purchasePolicy({
                address: CONTRACTS.ESCROW,
                abi: ESCROW_ABI,
                functionName: "purchasePolicy",
                args: [inputValue.trim().toUpperCase(), BigInt(numPremium), BigInt(numPayout), POLICY_DURATION_HOURS],
            });
        } catch (error) {
            console.error("Purchase initiation failed:", error);
            setIsPurchasing(false);
        }
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
        if (isPurchasing) toast.loading(`Initializing ${market.title} policy...`, { id: "purchase" });
        if (isPurchaseConfirming) toast.loading("Securing coverage on-chain...", { id: "purchase" });
        if (isPurchaseSuccess) {
            toast.success("Policy secured successfully!", { id: "purchase" });
            setPurchaseSuccess(true);
            refetchBalance();
        }
        if (purchaseError) toast.error(purchaseError.message.split(".")[0], { id: "purchase" });
    }, [isPurchasing, isPurchaseConfirming, isPurchaseSuccess, purchaseError, refetchBalance, market.title]);


    const getPlaceholder = () => {
        switch (market.id) {
            case "flight": return "e.g., UAL123";
            case "shipping-shield": return "e.g., FX192837465";
            case "rain-check": return "e.g., 34.0522 N, -118.2437 W";
            case "powder-protect": return "e.g., Aspen Snowmass";
            default: return "Enter tracking, hash, or ID...";
        }
    }

    const getLabel = () => {
        switch (market.id) {
            case "flight": return "Flight Number";
            case "shipping-shield": return "Tracking Number";
            case "rain-check": return "Event Coordinates";
            case "powder-protect": return "Resort Name";
            default: return "Target Identifier";
        }
    }

    const [specData, setSpecData] = useState<Record<string, string>>({});

    const updateSpec = (key: string, val: string) => {
        setSpecData(prev => ({ ...prev, [key]: val }));
    };

    // Construct the final target string from specData
    useEffect(() => {
        if (market.id === "flight") return; // flight uses standard inputValue
        const values = Object.values(specData).filter(v => v.trim() !== "");
        if (values.length > 0) {
            setInputValue(values.join(" | "));
        }
    }, [specData, market.id]);

    const renderSpecializedInputs = () => {
        switch (market.id) {
            case "agriculture":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Geographic Zone</label>
                            <input
                                type="text"
                                placeholder="e.g. California Central Valley"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("zone", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Strike (mm)</label>
                            <input
                                type="number"
                                placeholder="100"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("strike", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Exit (mm)</label>
                            <input
                                type="number"
                                placeholder="20"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("exit", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "energy":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Target Grid</label>
                            <input
                                type="text"
                                placeholder="e.g. ERCOT North"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("grid", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Strike Index</label>
                            <input
                                type="number"
                                placeholder="150"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("strike", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Tick ($/DD)</label>
                            <input
                                type="number"
                                placeholder="10"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("tick", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "catastrophe":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Target Coordinates</label>
                            <input
                                type="text"
                                placeholder="34.0522 N, -118.2437 W"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("coords", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Tier 1 Radius (km)</label>
                            <input
                                type="number"
                                placeholder="50"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("t1", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Tier 2 Radius (km)</label>
                            <input
                                type="number"
                                placeholder="150"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("t2", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "maritime":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Port Identifier</label>
                            <input
                                type="text"
                                placeholder="e.g. Port of Long Beach"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("port", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Wind Strike (knots)</label>
                            <input
                                type="number"
                                placeholder="34"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("strike", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Alert Radius (km)</label>
                            <input
                                type="number"
                                placeholder="10"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("radius", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "heat-wave":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Location (ZIP/GPS)</label>
                            <input
                                type="text"
                                placeholder="e.g. 90210"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("location", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Strike Temp (°F)</label>
                            <input
                                type="number"
                                placeholder="100"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("strike", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Min Duration (Days)</label>
                            <input
                                type="number"
                                placeholder="3"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("days", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "sun-yield":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Solar Farm Coordinates</label>
                            <input
                                type="text"
                                placeholder="e.g. Arizona Desert Plot 4"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("location", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Irradiance Strike (DNI)</label>
                            <input
                                type="number"
                                placeholder="85"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("strike", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Output Target (MWh)</label>
                            <input
                                type="number"
                                placeholder="500"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("target", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "freight-wait":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Vessel IMO Number</label>
                            <input
                                type="text"
                                placeholder="e.g. IMO 9857183"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("imo", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Target Port</label>
                            <input
                                type="text"
                                placeholder="Rotterdam"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("port", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Wait Threshold (Hrs)</label>
                            <input
                                type="number"
                                placeholder="48"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("threshold", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "rain-check":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Event Venue Coordinates</label>
                            <input
                                type="text"
                                placeholder="34.0522 N, -118.2437 W"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("coords", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Rain Threshold (mm)</label>
                            <input
                                type="number"
                                placeholder="5"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("threshold", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Event Date</label>
                            <input
                                type="date"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("date", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "powder-protect":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Resort Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Aspen Snowmass"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("resort", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Min Base Depth (in)</label>
                            <input
                                type="number"
                                placeholder="12"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("depth", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Arrival Date</label>
                            <input
                                type="date"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("date", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "peg-shield":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Stablecoin Pair</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("pair", e.target.value)}
                            >
                                <option value="USDC/USD">USDC/USD</option>
                                <option value="USDT/USD">USDT/USD</option>
                                <option value="DAI/USD">DAI/USD</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">De-peg Strike ($)</label>
                            <input
                                type="number"
                                placeholder="0.98"
                                step="0.01"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("strike", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Recovery Target ($)</label>
                            <input
                                type="number"
                                placeholder="0.95"
                                step="0.01"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                onChange={(e) => updateSpec("target", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case "flight":
                return (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{getLabel()}</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                placeholder={getPlaceholder()}
                                disabled={isProcessing || purchaseSuccess}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <span className="material-symbols-outlined text-slate-600">
                                    {market.icon}
                                </span>
                            </div>
                        </div>
                    </div>
                );
        }
    };


    return (
        <div className="w-full rounded-2xl p-6 lg:p-8 border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40 xl:bg-black/20"
            style={{ backdropFilter: "blur(12px) brightness(1.2) contrast(1.1)" }}>

            {/* Decorative gradients based on market color */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-t-2xl opacity-50" />

            <h3 className="text-xl font-bold text-white mb-6">Secure Coverage</h3>

            <div className="space-y-6 animate-in fade-in duration-500">

                <div className="p-5 bg-gradient-to-br from-[#161d2f] to-[#0B0F19] border border-white/5 rounded-xl text-left relative overflow-hidden">
                    <div className="absolute unset-0 bg-white opacity-5 mix-blend-overlay" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className="text-sm text-slate-400 font-medium">Policy Premium</span>
                        <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-0.5 rounded-sm tracking-widest uppercase">{market.riskBase}</span>
                    </div>
                    <div className="flex items-end gap-2 mb-2 relative z-10">
                        <span className="text-4xl font-bold text-white tracking-tighter">{market.price.split(' ')[0]}</span>
                        <span className="text-lg font-medium text-slate-500 mb-1.5">{market.price.split(' ')[1] || 'USDC'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed text-left relative z-10">
                        Guaranteed 24/7 monitoring. Immediate <span className="text-white font-bold">{market.marketData.maxPayout} payout</span> if oracle verifies failure conditions.
                    </p>
                </div>

                {renderSpecializedInputs()}

                {usdcBalance !== undefined && isConnected && (
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-tight bg-white/5 px-4 py-3 rounded-lg border border-white/5">
                        <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
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
                    <div className={`dexter-btn-container w-full relative z-30 mb-2 transition-opacity ${(!canPurchase || isProcessing) ? 'opacity-50 pointer-events-none' : ''}`} style={{ '--btn-color': hasEnoughAllowance ? '#22c55e' : `rgb(${market.rgb})` } as React.CSSProperties}>
                        <button onClick={canPurchase ? (hasEnoughAllowance ? handlePurchase : handleApprove) : undefined} disabled={!canPurchase || isProcessing} className="dexter-btn w-full !h-14 !px-6 !rounded-xl" type="button">
                            <span className="dexter-btn-drawer dexter-transition-top !text-[10px] uppercase font-mono tracking-widest">{hasEnoughAllowance ? 'Purchase Policy' : 'Unlock Assets'}</span>
                            <span className="dexter-btn-text !text-sm tracking-wide font-bold">{isProcessing ? "Processing..." : (!hasEnoughBalance ? "Insufficient Balance" : (hasEnoughAllowance ? "Confirm Coverage" : "Approve USDC"))}</span>
                            <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                            <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                            <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                            <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                            <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[10px] uppercase font-mono tracking-widest">{market.marketData.settlement}</span>
                        </button>
                    </div>
                )}

                {isConnected && !purchaseSuccess && (
                    <div className="pt-2 border-t border-white/5 mt-4">
                        <button
                            onClick={() => setShowCrossChain(!showCrossChain)}
                            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest group"
                        >
                            <span>Pay from another chain?</span>
                            <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                                {showCrossChain ? 'expand_less' : 'east'}
                            </span>
                        </button>

                        {showCrossChain && (
                            <CrossChainCheckout
                                marketId={market.id}
                                premiumUsdc={numPremium}
                                targetIdentifier={inputValue}
                                onSuccess={() => setPurchaseSuccess(true)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
