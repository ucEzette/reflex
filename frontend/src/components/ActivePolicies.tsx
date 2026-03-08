import { useActiveAccount, useReadContract, useContractEvents } from "thirdweb/react";
import { getContract, defineChain, prepareEvent } from "thirdweb";
import { client } from "@/lib/thirdweb";
import { ESCROW_ABI, CONTRACTS } from "@/lib/contracts";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TableSkeleton } from "@/components/ui/Skeletons";

function CountdownTimer({ expirationTime }: { expirationTime: bigint }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const update = () => {
            const now = Math.floor(Date.now() / 1000);
            const expiry = Number(expirationTime);
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeLeft("Expired");
                return;
            }

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            setTimeLeft(
                `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [expirationTime]);

    const isExpired = timeLeft === "Expired";
    return (
        <span
            className={`font-mono text-sm ${isExpired ? "text-zinc-600" : "text-amber-400"}`}
        >
            {timeLeft}
        </span>
    );
}

function StatusBadge({ isActive, isClaimed }: { isActive: boolean; isClaimed: boolean }) {
    if (isClaimed) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                    <circle cx="4" cy="4" r="4" />
                </svg>
                Claimed
            </span>
        );
    }

    if (isActive) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="animate-pulse">
                    <circle cx="4" cy="4" r="4" />
                </svg>
                Active
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="4" cy="4" r="4" />
            </svg>
            Expired
        </span>
    );
}

function PolicyRow({ policyId, txHash }: { policyId: string, txHash?: string }) {
    const chain = defineChain(43113);
    const contract = getContract({ client, chain, address: CONTRACTS.ESCROW, abi: ESCROW_ABI as any });

    const policyQuery = useReadContract({
        contract,
        method: "getPolicy",
        params: [policyId as `0x${string}`],
    });
    const data = policyQuery.data as any[];

    if (!data) return null;

    const [, apiTarget, premiumPaid, payoutAmount, expirationTime, isActive, isClaimed] = data;

    // Extract flight number from apiTarget
    const flightMatch = apiTarget.match(/flights\/([^?]+)/);
    const flightNumber = flightMatch ? flightMatch[1] : apiTarget;

    return (
        <tr className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-zinc-400">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-foreground">{flightNumber}</span>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm text-zinc-400">${(Number(premiumPaid) / 1e6).toFixed(2)}</span>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm font-medium text-emerald-400">
                    ${(Number(payoutAmount) / 1e6).toFixed(2)}
                </span>
            </td>
            <td className="px-4 py-4">
                <StatusBadge isActive={isActive} isClaimed={isClaimed} />
            </td>
            <td className="px-4 py-4">
                {isActive && !isClaimed ? (
                    <CountdownTimer expirationTime={expirationTime} />
                ) : (
                    <span className="text-sm text-zinc-600">—</span>
                )}
            </td>
            <td className="px-4 py-4">
                <div className="flex flex-col gap-1.5 align-start">
                    <span className="text-xs font-mono text-zinc-400">
                        {policyId.slice(0, 10)}...
                    </span>
                    {!isActive && !isClaimed && (
                        <Link
                            href={`/claims/evidence/${policyId}`}
                            className="inline-flex max-w-max items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
                        >
                            <span className="material-symbols-outlined !text-[12px]">gavel</span>
                            <span>Dispute</span>
                        </Link>
                    )}
                    {txHash && (
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://testnet.snowscan.xyz/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-max items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/50 text-[10px] text-sky-400 hover:text-sky-300 hover:bg-zinc-800 transition-colors border border-zinc-800"
                            >
                                <span>Snowscan</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just secured ${payoutAmount ? `$${(Number(payoutAmount) / 1e6).toFixed(0)}` : "parametric"} protection on @ReflexProtocol! 🛡️\n\nMy policy for ${flightNumber} is now live on Avalanche. \n\n#Reflex #DeFi #Avalanche`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-max items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-[10px] text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                                </svg>
                                <span>Share</span>
                            </a>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}

export function ActivePolicies() {
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    useEffect(() => {
        if (eventsQuery.data && address) {
            const hashMapping: Record<string, string> = {};
            eventsQuery.data.forEach((event: any) => {
                if (event.args.policyholder.toLowerCase() === address.toLowerCase()) {
                    hashMapping[event.args.policyId] = event.transactionHash;
                }
            });
            setTxHashes(hashMapping);
        }
    }, [eventsQuery.data, address]);

    if (!mounted || !isConnected) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/3 to-transparent" />

            {/* Header */}
            <div className="relative border-b border-zinc-800/50 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-foreground">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill="currentColor" />
                                <path d="M7 12h2v5H7v-5zm4-3h2v8h-2V9zm4-2h2v10h-2V7z" fill="currentColor" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Your Policies</h2>
                            <p className="text-sm text-zinc-500">
                                {policyIds ? `${policyIds.length} policies found` : "Loading..."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto">
                {isLoading ? (
                    <div className="p-4">
                        <TableSkeleton rows={5} />
                    </div>
                ) : !policyIds || policyIds.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                            </svg>
                        </div>
                        <p className="text-sm text-zinc-500">No policies yet</p>
                        <p className="text-xs text-zinc-600 mt-1">Purchase your first flight delay insurance above</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800/50">
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Flight</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Premium</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Payout</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Expires In</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Policy ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policyIds.map((id) => (
                                <PolicyRow key={id} policyId={id} txHash={txHashes[id]} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
