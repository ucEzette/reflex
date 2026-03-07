"use client";

import React, { useState, useEffect } from 'react';
import { Vote, ChevronRight, Clock, CheckCircle2, AlertCircle, Shield, Play, PlusCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { ESCROW_ABI } from '@/lib/enterprise_abis';

interface Proposal {
    id: string;
    title: string;
    description: string;
    status: 'Active' | 'Passed' | 'Executed' | 'Defeated';
    endsIn: string;
    votesFor: number;
    votesAgainst: number;
    quorum: number;
}

const MOCK_PROPOSALS: Proposal[] = [
    {
        id: 'RGP-042',
        title: 'Increase Catastrophe Proximity Capacity',
        description: 'Proposal to increase the maximum coverage limit for Catastrophe markets from $5M to $10M USDC based on current pool utilization.',
        status: 'Active',
        endsIn: '2 days',
        votesFor: 1250400,
        votesAgainst: 120500,
        quorum: 2000000,
    },
    {
        id: 'RGP-041',
        title: 'Add Agriculture Market: Brazil Soy Index',
        description: 'Introduce a new rainfall volatility index for Mato Grosso soybean farmers using GHCND oracle data.',
        status: 'Passed',
        endsIn: 'Ended',
        votesFor: 3200000,
        votesAgainst: 45000,
        quorum: 2000000,
    },
    {
        id: 'RGP-040',
        title: 'Adjust Travel Solution Payout Tiers',
        description: 'Update the binary settlement threshold from 120 minutes to 90 minutes to stay competitive with legacy travel protection.',
        status: 'Executed',
        endsIn: 'Ended',
        votesFor: 2800000,
        votesAgainst: 540000,
        quorum: 2000000,
    }
];

export function GovernanceVoting() {
    const { address } = useAccount();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});

    // For mockup purposes, we'll hardcode a disputed policy ID
    // In production, this would be fetched from a sub-graph querying PolicyDisputed events
    const DISPUTED_POLICY = "0xf72a9b3d4e8c1...e45f8c1";
    const TARGET = "UAL123";
    const EVIDENCE_CID = "bafybeig...geba";

    const { data: voteDetails, refetch: refetchVotes } = useReadContract({
        address: CONTRACTS.ESCROW as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getVoteDetails',
        args: [DISPUTED_POLICY as `0x${string}`],
        query: { enabled: !!address }
    });

    const { data: isRelayer } = useReadContract({
        address: CONTRACTS.ESCROW as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'authorizedRelayers',
        args: [address as `0x${string}`],
        query: { enabled: !!address }
    });

    const { writeContract, data: txHash } = useWriteContract();
    const { isSuccess: isSubmitSuccess, isLoading: isSubmitLoading } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSubmitSuccess) {
            toast.success("Consensus Vote Submitted!", { description: "Your relayer signature has been added to the quorum." });
            refetchVotes();
        }
    }, [isSubmitSuccess, refetchVotes]);

    const handleVote = (id: string, support: boolean) => {
        setHasVoted(prev => ({ ...prev, [id]: true }));
        toast.success(`Vote submitted successfully!`, {
            description: `You voted ${support ? 'FOR' : 'AGAINST'} ${id} using your LP voting power.`,
        });
    };

    const handleGuardianVote = () => {
        if (!isRelayer) {
            toast.error("Unauthorized", { description: "You are not an authorized protocol relayer." });
            return;
        }

        writeContract({
            address: CONTRACTS.ESCROW as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'submitRelayerConsensus',
            args: [DISPUTED_POLICY as `0x${string}`],
        });
    };

    const currentVotes = voteDetails ? Number(voteDetails[0]) : 0;
    const requiredQuorum = voteDetails ? Number(voteDetails[1]) : 2;


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Vote className="w-6 h-6 text-primary" />
                        Governance Forum
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">LPs govern pool parameters and risk exposure through weighted voting.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Your Power</span>
                        <span className="text-sm font-bold text-foreground">450,200 rVote</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {MOCK_PROPOSALS.map((proposal) => (
                    <div
                        key={proposal.id}
                        className={`bg-black/40 border border-white/5 rounded-2xl p-6 transition-all hover:border-white/10 ${selectedId === proposal.id ? 'ring-1 ring-primary/50' : ''}`}
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-slate-400 border border-white/5">{proposal.id}</span>
                                    <StatusBadge status={proposal.status} />
                                    {proposal.status === 'Active' && (
                                        <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                                            <Clock className="w-3 h-3" /> Ends in {proposal.endsIn}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-foreground">{proposal.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-light">{proposal.description}</p>
                            </div>

                            <div className="md:w-64 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-500">Progress</span>
                                        <span className="text-foreground">{Math.round((proposal.votesFor + proposal.votesAgainst) / proposal.quorum * 100)}% to Quorum</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${Math.min(100, (proposal.votesFor + proposal.votesAgainst) / proposal.quorum * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">For</p>
                                        <p className="text-xs font-bold text-emerald-400">{(proposal.votesFor / 1000000).toFixed(1)}M</p>
                                    </div>
                                    <div className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-center">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Against</p>
                                        <p className="text-xs font-bold text-red-400">{(proposal.votesAgainst / 1000).toFixed(0)}k</p>
                                    </div>
                                </div>

                                {proposal.status === 'Active' && !hasVoted[proposal.id] && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVote(proposal.id, true)}
                                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider"
                                        >
                                            For
                                        </button>
                                        <button
                                            onClick={() => handleVote(proposal.id, false)}
                                            className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider"
                                        >
                                            Against
                                        </button>
                                    </div>
                                )}

                                {hasVoted[proposal.id] && (
                                    <div className="text-center p-2 bg-primary/10 border border-primary/20 rounded-lg">
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Vote Recorded
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mt-12 animate-in fade-in duration-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/20">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Guardian Dispute Review</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Multi-Relayer Quorum Required</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Policy {DISPUTED_POLICY.slice(0, 10)}... Dispute</p>
                                <p className="text-[10px] text-slate-400">Target: {TARGET} · Evidence CID: {EVIDENCE_CID}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500 font-mono">
                                {currentVotes}/{requiredQuorum} Verified
                            </span>
                            <button
                                onClick={handleGuardianVote}
                                disabled={isSubmitLoading || !isRelayer || currentVotes >= requiredQuorum}
                                className="px-4 py-1.5 bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/30 transition-all uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitLoading ? <Play className="w-3 h-3 animate-spin" /> : null}
                                {currentVotes >= requiredQuorum ? 'Quorum Reached' : 'Review & Vote'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center p-8 border border-dashed border-primary/20 rounded-3xl bg-primary/5 mt-12 group hover:border-primary/40 transition-all cursor-pointer">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <PlusCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Create New Proposal</h3>
                        <p className="text-sm text-slate-400 font-light mt-1 max-w-md mx-auto">
                            Submit a proposal to adjust protocol parameters, add new risk markets, or update the relayer network. Requires a minimum stake of 100,000 rVote.
                        </p>
                    </div>
                    <button
                        onClick={() => toast.info("Proposal Creation Incoming", { description: "The DAO deployment module is currently synchronizing with the L1 Governance contract." })}
                        className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all uppercase tracking-widest flex items-center gap-2 mx-auto"
                    >
                        Initialize Proposal Drafting <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center p-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.02] mt-6">
                <div className="text-center space-y-2">
                    <p className="text-slate-400 text-xs font-light tracking-wide">Looking for historical proposals?</p>
                    <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1 mx-auto">
                        Archived Proposals <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Proposal['status'] }) {
    const colors = {
        Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        Passed: 'bg-primary/10 text-primary border-primary/20',
        Executed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        Defeated: 'bg-red-500/10 text-red-500 border-red-500/20'
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${colors[status]}`}>
            {status}
        </span>
    );
}
