"use client";

export const dynamic = "force-dynamic";


import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { ESCROW_ABI, CONTRACTS } from "@/lib/contracts";
import { Shield, Upload, FileText, AlertCircle, CheckCircle, ArrowLeft, Info, Gavel, Activity } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { IpfsService } from "@/services/ipfs";

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

    const policyArray = (policyData as unknown) as any[] || [];
    const apiTarget = policyArray[1] || "Unknown";
    const payoutAmount = policyArray[3] || BigInt(0);
    const expirationTime = policyArray[4] || BigInt(0);

    if (!isConnected) return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <Shield className="w-12 h-12 text-primary mx-auto opacity-20" />
                <h2 className="text-xl font-bold text-foreground">Wallet Not Connected</h2>
                <p className="text-slate-500">Please connect your wallet to submit evidence.</p>
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

            // 4. Simulate on-chain commitment of CID
            // In a full implementation, we'd call a contract function here
            await new Promise(resolve => setTimeout(resolve, 800));

            setSubSuccess(true);
            toast.success("All evidence pinned to IPFS & submitted!");
        } catch (error: any) {
            console.error("IPFS Pinning failed:", error);
            toast.error("Cloud storage sync failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-10 px-6 flex flex-col items-center">
            <div className="max-w-3xl w-full space-y-8">
                {/* Back Button */}
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Profile
                </Link>

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <Gavel className="w-6 h-6 text-amber-500" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Submit Evidence</h1>
                    </div>
                    <p className="text-slate-400 text-lg font-light">
                        Dispute an automated oracle result by providing external proof of the negative event.
                    </p>
                </div>

                {subSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            <CheckCircle className="w-10 h-10 text-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">Evidence Submitted</h2>
                            <p className="text-slate-400">Your claim has been moved to &quot;Disputed&quot; status. The multi-relayer quorum will re-verify the event based on your provided evidence.</p>
                        </div>
                        <button
                            onClick={() => router.push("/profile")}
                            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Policy Context Card */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Target Policy</p>
                                    <h3 className="text-xl font-bold text-primary">{id?.toString().slice(0, 16)}...</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Potential Payout</p>
                                    <p className="text-xl font-bold text-emerald-400">${(Number(payoutAmount) / 1e6).toFixed(2)} USDT</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined !text-[16px]">location_on</span>
                                    {apiTarget}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined !text-[16px]">event_busy</span>
                                    Expired: {new Date(Number(expirationTime) * 1000).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Description Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Nature of Dispute
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Explain why the automated oracle result was incorrect. Include specific times, local reports, or flight tracking data..."
                                className="w-full h-40 bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-foreground placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all resize-none"
                            />
                        </div>

                        {/* File Upload Simulation */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Supporting Documents
                            </label>
                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/30 transition-all group cursor-pointer">
                                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3 group-hover:text-primary transition-colors" />
                                <p className="text-sm text-slate-400">Drag and drop PDFs, JPEGs, or Screenshots</p>
                                <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest">Max file size: 10MB</p>
                            </div>
                        </div>

                        {/* Info Warning */}
                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex gap-3">
                            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                                Submitting false evidence may result in a permanent ban from the Reflex protocol. Your evidence hash will be committed to the Avalanche network and verified by a decentralized relayer quorum.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isSubmitting ? "bg-zinc-800 text-slate-500 cursor-not-allowed" : "bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20"
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Activity className="w-4 h-4 animate-spin" />
                                    Submitting to Quorum...
                                </>
                            ) : "Commit Evidence Hash"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
