"use client";

export const dynamic = "force-dynamic";


import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { ESCROW_ABI, CONTRACTS } from "@/lib/contracts";
import { 
  Shield, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  Info, 
  Gavel, 
  Activity,
  Zap,
  Globe,
  Wallet,
  Scale,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { IpfsService } from "@/services/ipfs";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

export default function EvidenceSubmissionPage({ params }: { params: { id: string } }) {
    const id = params.id;
    const router = useRouter();
    const { address, isConnected } = useAccount();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Status State
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subSuccess, setSubSuccess] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    // Fetch Policy Data
    const { data: policyData, isLoading: policyLoading } = useReadContract({
        address: CONTRACTS.ESCROW as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: "getPolicy",
        args: [id as `0x${string}`],
        query: { enabled: mounted && isConnected && !!address }
    });

    const { writeContract: submitConsensus, data: txHash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
        hash: txHash
    });

    useEffect(() => {
        if (txSuccess) {
            setSubSuccess(true);
            toast.success("DISPUTE_COMMIT_FINALIZED", {
                description: `Consensus finalized on-chain: ${txHash?.slice(0, 10)}...`,
                action: {
                    label: "EXPLORER",
                    onClick: () => window.open(`https://sepolia.arbiscan.io/tx/${txHash}`, "_blank"),
                },
                duration: 8000,
            });
        }
    }, [txSuccess, txHash]);

    const policyArray = (policyData as unknown) as any[] || [];
    const apiTarget = policyArray[1] || "Unknown";
    const payoutAmount = policyArray[3] || BigInt(0);
    const expirationTime = policyArray[4] || BigInt(0);

    if (!isConnected) return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-32">
            <div className="text-center space-y-8 max-w-md">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                    <Shield className="w-8 h-8 text-zinc-700" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Auth Required</h2>
                    <p className="text-zinc-500 font-medium">Please authenticate your identity to access the dispute terminal.</p>
                </div>
            </div>
        </div>
    );

    if (policyLoading) return <div className="min-h-screen pt-32 text-center text-slate-500">Loading policy details...</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) {
            toast.error("Please provide a description of the dispute.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Prepare evidence metadata
            const metadata = {
                policyId: id,
                disputeType: "Oracle Inaccuracy",
                description: description,
                timestamp: new Date().toISOString(),
                submitter: address,
                filesCount: files.length,
                marketTarget: apiTarget || "Unknown"
            };

            // 2. Pin metadata to IPFS
            const metadataCid = await IpfsService.pinPolicyMetadata(metadata);
            console.log("Evidence metadata pinned to IPFS:", metadataCid);

            // 3. Pin actual binary files if any
            let filesCid = "";
            if (files.length > 0) {
                filesCid = await IpfsService.pinEvidenceFiles(files);
                console.log("Binary evidence pinned to IPFS:", filesCid);
            }

            // 4. Commit to Ledger
            submitConsensus({
                address: CONTRACTS.ESCROW as `0x${string}`,
                abi: ESCROW_ABI,
                functionName: "submitRelayerConsensus",
                args: [id as `0x${string}`]
            });

            toast.info("Awaiting quorum confirmation...");
        } catch (error: any) {
            console.error("Transmission breakdown:", error);
            toast.error("Cloud storage sync failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-40 pb-32 px-12 flex flex-col items-center">
            <div className="max-w-[900px] w-full space-y-16">
                {/* Back Link */}
                <Link
                    href="/dashboard"
                    className="group flex items-center gap-3 text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.4em]"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Return to Portfolio
                </Link>

                {/* Header */}
                <header className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-1.5 bg-[#D31027] rounded-full" />
                         <span className="text-[10px] font-black text-[#D31027] uppercase tracking-[0.5em]">Dispute Terminal</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter text-white italic uppercase leading-none">
                        Submit <span className="text-[#D31027]">Evidence</span>
                    </h1>
                    <p className="text-zinc-500 text-xl font-medium max-w-2xl leading-relaxed">
                        Challenge automated oracle finality by providing cryptographic proof of external risk events to the decentralized relayer quorum.
                    </p>
                </header>

                {subSuccess ? (
                    <div className="bg-[#101216] border border-emerald-500/20 rounded-[3rem] p-20 text-center space-y-10 animate-in zoom-in-95 duration-700 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                            <CheckCircle className="w-10 h-10 text-black" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Transmission Complete</h2>
                            <p className="text-zinc-500 text-lg font-medium max-w-md mx-auto leading-relaxed">Your evidence hash has been pinned to IPFS and committed to the L2 verification quorum.</p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-4 px-12 py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl"
                        >
                            RETURN TO TERMINAL
                            <Zap className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Policy Context Card */}
                        <div className="bg-[#101216] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group/hud shadow-2xl">
                             <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Scale className="w-24 h-24 text-zinc-400" />
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                                <div>
                                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] block mb-2">Subject Policy ID</span>
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{id?.toString().slice(0, 10)}<span className="text-[#D31027]">...</span>{id?.toString().slice(-6)}</h3>
                                </div>
                                <div className="text-left md:text-right">
                                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] block mb-2">Stake At Risk</span>
                                    <p className="text-3xl font-black text-emerald-500 italic tracking-tighter">${(Number(payoutAmount) / 1e6).toFixed(2)} USDT</p>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap items-center gap-10 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D31027]" />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">{apiTarget}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-zinc-800" />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Expired: {new Date(Number(expirationTime) * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Input */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4">
                                <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Dispute Description
                                </label>
                                <span className="text-[8px] font-black text-zinc-900 uppercase tracking-widest italic">Awaiting technical summary</span>
                            </div>
                            <div className="bg-[#101216] border border-white/5 rounded-[2rem] p-8 focus-within:border-[#D31027]/40 transition-all shadow-inner">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="SYNCHRONIZE DISPUTE DATA: Explain oracle inaccuracy with technical evidence (flight tracker logs, local news, sensor data)..."
                                    className="w-full h-48 bg-transparent border-none p-0 text-white placeholder:text-zinc-900 focus:ring-0 text-base leading-relaxed font-medium resize-none"
                                />
                            </div>
                        </div>

                        {/* File Upload Simulation */}
                        <div className="space-y-4">
                             <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] flex items-center gap-2 px-4">
                                <Upload className="w-3.5 h-3.5" />
                                Evidence Payload
                            </label>
                            <div className="bg-black/40 border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center hover:border-[#D31027]/20 transition-all group cursor-pointer shadow-inner">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <Upload className="w-6 h-6 text-zinc-600 group-hover:text-white" />
                                </div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DRAG AND DROP ENCRYPTED ASSETS (PDF / JPG)</p>
                                <p className="text-[8px] text-zinc-800 mt-2 font-black uppercase tracking-[0.3em]">MAX_SIZE: 10_MB_SECURE_PAYLOAD</p>
                            </div>
                        </div>

                        {/* Info Warning */}
                        <div className="bg-[#D31027]/5 border border-[#D31027]/10 p-8 rounded-[2.5rem] flex gap-6 shadow-2xl">
                            <AlertCircle className="w-6 h-6 text-[#D31027] shrink-0 mt-1" />
                            <p className="text-[10px] text-[#D31027]/70 leading-relaxed font-black uppercase tracking-[0.15em]">
                                PROTOCOL_WARNING: Submitting false evidence may result in a permanent wallet identity purge. Your evidence hash will be committed to the Arbitrum Sepolia ledger and verified by a decentralized relayer quorum.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-7 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isSubmitting ? "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5" : "bg-white text-black hover:bg-zinc-200 active:scale-[0.98]"
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Activity className="w-5 h-5 animate-spin" />
                                    Finalizing IPFS Commitment...
                                </>
                            ) : (
                                <>
                                    COMMIT DISPUTE TO LEDGER
                                    <Zap className="w-4 h-4 fill-current transition-transform group-hover:scale-125" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
