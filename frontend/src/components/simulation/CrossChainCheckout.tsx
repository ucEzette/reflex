"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import { CONTRACTS, CCIP_CONFIG, ERC20_ABI } from "@/lib/contracts";
import { CCIP_ROUTER_ABI } from "@/lib/ccip_abis";
import { parseUnits } from "viem";

interface CrossChainCheckoutProps {
    marketId: string;
    premiumUsdc: number;
    targetIdentifier: string;
    onSuccess: () => void;
}

const SUPPORTED_CHAINS = [
    { id: 11155111, name: "Ethereum Sepolia", selector: CCIP_CONFIG.DESTINATION_CHAIN_SELECTOR },
    { id: 421614, name: "Arbitrum Sepolia", selector: CCIP_CONFIG.DESTINATION_CHAIN_SELECTOR },
    { id: 84532, name: "Base Sepolia", selector: CCIP_CONFIG.DESTINATION_CHAIN_SELECTOR },
];

export function CrossChainCheckout({ marketId, premiumUsdc, targetIdentifier, onSuccess }: CrossChainCheckoutProps) {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
    const [isFeeLoading, setIsFeeLoading] = useState(false);
    const [ccipFee, setCcipFee] = useState<bigint>(BigInt(0));

    // Current chain configuration
    const routerAddress = CCIP_CONFIG.ROUTERS[chainId.toString() as keyof typeof CCIP_CONFIG.ROUTERS];

    // 1. Check USDC Balance on current chain
    const { data: usdcBalance } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address && !!routerAddress },
    });

    // 2. Check Allowance for CCIP Router
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address && routerAddress ? [address, routerAddress as `0x${string}`] : undefined,
        query: { enabled: !!address && !!routerAddress },
    });

    // 3. Estimate CCIP Fees
    const { data: estimatedFee } = useReadContract({
        address: routerAddress as `0x${string}`,
        abi: CCIP_ROUTER_ABI,
        functionName: "getFee",
        args: routerAddress ? [
            BigInt(CCIP_CONFIG.DESTINATION_CHAIN_SELECTOR),
            {
                receiver: CONTRACTS.CROSS_CHAIN_RECEIVER,
                data: "0x", // Standard deposit
                tokenAmounts: [{ token: CONTRACTS.USDC, amount: BigInt(premiumUsdc) }],
                feeToken: "0x0000000000000000000000000000000000000000", // Native gas
                extraArgs: "0x"
            }
        ] : undefined,
        query: { enabled: !!routerAddress },
    });

    const { writeContract: approveUsdc, data: approveTxHash, isPending: isApproving } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });

    const { writeContract: sendCcip, data: sendTxHash, isPending: isSending } = useWriteContract();
    const { isLoading: isSendConfirming, isSuccess: isSendSuccess } = useWaitForTransactionReceipt({ hash: sendTxHash });

    const hasEnoughAllowance = allowance ? (Number(allowance) >= premiumUsdc) : false;
    const hasEnoughBalance = usdcBalance ? (Number(usdcBalance) >= premiumUsdc) : false;

    const handleCcipPayment = () => {
        if (!routerAddress) return;

        // Construct the message for the receiver
        // Receiver decodes: (policyholder, apiTarget, premium, payoutAmount, duration)
        // For simplicity in this UI bridge, we send a basic token transfer
        // The receiver contract handles the policy purchase on the destination side

        sendCcip({
            address: routerAddress as `0x${string}`,
            abi: CCIP_ROUTER_ABI,
            functionName: "ccipSend",
            args: [
                BigInt(CCIP_CONFIG.DESTINATION_CHAIN_SELECTOR),
                {
                    receiver: CONTRACTS.CROSS_CHAIN_RECEIVER,
                    data: "0x", // Simple deposit variant
                    tokenAmounts: [{ token: CONTRACTS.USDC, amount: BigInt(premiumUsdc) }],
                    feeToken: "0x0000000000000000000000000000000000000000",
                    extraArgs: "0x97a312010000000000000000000000000000000000000000000000000000000000030d40" // Evm2EvmMessageV1 with gas limit
                }
            ],
            value: estimatedFee as bigint
        });
    };

    useEffect(() => {
        if (isSendSuccess) {
            toast.success("Cross-chain payment initiated!");
            onSuccess();
        }
    }, [isSendSuccess, onSuccess]);

    return (
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10 mt-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cross-Chain Payment</h4>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/20 rounded text-[10px] text-primary font-bold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    POWERED BY CCIP
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Source Chain</label>
                <div className="flex flex-wrap gap-2">
                    {SUPPORTED_CHAINS.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => switchChain({ chainId: c.id })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${chainId === c.id
                                ? "bg-primary border-primary text-white"
                                : "bg-black/40 border-white/10 text-slate-400 hover:border-white/30"
                                }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Premium Amount</span>
                    <span className="text-foreground font-mono">{(premiumUsdc / 1e6).toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Estimated CCIP Fee</span>
                    <span className="text-foreground font-mono">{estimatedFee ? `${(Number(estimatedFee) / 1e18).toFixed(4)} ETH` : "Calculating..."}</span>
                </div>
                <div className="h-[1px] bg-white/5 w-full my-2" />
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Total Est. Cost</span>
                    <span className="text-primary tracking-tight">{(premiumUsdc / 1e6).toFixed(2)} USDC + Fee</span>
                </div>
            </div>

            {!routerAddress ? (
                <div className="text-[10px] text-yellow-500/80 bg-yellow-500/10 p-2 rounded border border-yellow-500/20 text-center font-medium">
                    Please switch to a supported testnet to pay via CCIP.
                </div>
            ) : (
                <button
                    onClick={hasEnoughAllowance ? handleCcipPayment : () => approveUsdc({
                        address: CONTRACTS.USDC,
                        abi: ERC20_ABI,
                        functionName: "approve",
                        args: [routerAddress as `0x${string}`, BigInt(premiumUsdc)]
                    })}
                    disabled={isSending || isSendConfirming || isApproving || isApproveConfirming || !hasEnoughBalance}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${hasEnoughBalance
                        ? "bg-primary text-white hover:brightness-110"
                        : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                        }`}
                >
                    {isSending || isSendConfirming || isApproving || isApproveConfirming
                        ? "Processing..."
                        : !hasEnoughBalance
                            ? "Insufficient Balance"
                            : hasEnoughAllowance
                                ? "Pay via CCIP"
                                : "Approve USDC for Bridge"}
                </button>
            )}
        </div>
    );
}
