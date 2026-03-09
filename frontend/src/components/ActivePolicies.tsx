import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";
import { config } from "@/lib/wagmiConfig";
import { getPublicClient } from "@wagmi/core";
import { ESCROW_ABI, TRAVEL_ABI, GENERIC_PRODUCT_ABI, CONTRACTS } from "@/lib/contracts";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { TableSkeleton } from "@/components/ui/Skeletons";

import { formatUnits } from "viem";

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

function StatusBadge({ status, isActive: _isActive, isClaimed: _isClaimed, expirationTime }: { status?: number, isActive?: boolean; isClaimed?: boolean, expirationTime?: bigint }) {
    // Standardize status: 0=Active (Active), 1=Claimed (Paid), 2=Expired (Expired)
    const isClaimed = _isClaimed || Number(status) === 1;
    const isExpired = expirationTime ? Number(expirationTime) < (Date.now() / 1000) : false;
    const isActive = (_isActive || Number(status) === 0) && !isExpired && !isClaimed;

    if (isClaimed) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                    <circle cx="4" cy="4" r="4" />
                </svg>
                Paid
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

interface PolicyItem {
    id: string;
    contract: string;
    type: 'Escrow' | 'Travel' | 'Agri' | 'Energy' | 'Catastrophe' | 'Maritime';
}

function PolicyRow({ policy, txHash }: { policy: PolicyItem, txHash?: string }) {
    const isEscrow = policy.type === 'Escrow';

    // Determine ABI and Function
    const abi = isEscrow ? ESCROW_ABI : (policy.type === 'Travel' ? TRAVEL_ABI : GENERIC_PRODUCT_ABI);
    const functionName = isEscrow ? 'getPolicy' : 'policies';

    const { data } = useReadContract({
        address: policy.contract as `0x${string}`,
        abi: abi as any,
        functionName: functionName,
        args: [policy.id as `0x${string}`],
    });

    if (!data) return null;

    let holder, target, premium, payout, expiry, status, isActive, isClaimed;

    if (isEscrow) {
        [holder, target, premium, payout, expiry, isActive, isClaimed] = data as any[];
    } else if (policy.type === 'Travel') {
        const [ph, prem, pay, stat, exp, fId] = data as any[];
        holder = ph;
        premium = prem;
        payout = pay;
        status = stat;
        expiry = exp;
        target = fId;
        isActive = Number(status) === 0;
        isClaimed = Number(status) === 1;
    } else {
        const d = data as any[];
        [holder, premium, payout, , , status, expiry, target] = d;
        isActive = Number(status) === 0;
        isClaimed = Number(status) === 1;
    }

    // Extract display target
    let displayTarget = target || "";
    if (isEscrow) {
        const flightMatch = displayTarget.match(/flights\/([^?]+)/);
        displayTarget = flightMatch ? flightMatch[1] : displayTarget;
    }

    const sectorColors: Record<string, string> = {
        Travel: 'text-primary',
        Agri: 'text-emerald-400',
        Energy: 'text-amber-400',
        Catastrophe: 'text-rose-500',
        Maritime: 'text-blue-400',
        Escrow: 'text-zinc-400'
    };

    return (
        <tr className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-current ${sectorColors[policy.type]}`}>
                        {policy.type.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{displayTarget || "Global Policy"}</span>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm text-zinc-400">${Number(formatUnits(premium, 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm font-medium text-emerald-400">
                    ${Number(formatUnits(payout, 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            </td>
            <td className="px-4 py-4">
                <StatusBadge status={Number(status)} isActive={isActive} isClaimed={isClaimed} expirationTime={expiry} />
            </td>
            <td className="px-4 py-4">
                {isActive && !isClaimed && Number(expiry) > (Date.now() / 1000) ? (
                    <CountdownTimer expirationTime={expiry} />
                ) : (
                    <span className="text-sm text-zinc-600">—</span>
                )}
            </td>
            <td className="px-4 py-4">
                <div className="flex flex-col gap-1.5 align-start">
                    <span className="text-xs font-mono text-zinc-400">
                        {policy.id.slice(0, 10)}...
                    </span>
                    {txHash && (
                        <div className="flex items-center gap-2">
                            <a
                                href={`https://testnet.snowtrace.io/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-max items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/50 text-[10px] text-sky-400 hover:text-sky-300 hover:bg-zinc-800 transition-colors border border-zinc-800"
                            >
                                <span>Explorer</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
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
    const [txHashes, setTxHashes] = useState<Record<string, string>>({});

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch from all sources
    const { data: escrowIds } = useReadContract({
        address: CONTRACTS.ESCROW as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getUserPolicies',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && mounted }
    });

    const { data: travelIds } = useReadContract({
        address: CONTRACTS.TRAVEL as `0x${string}`,
        abi: TRAVEL_ABI,
        functionName: 'getUserPolicies',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && mounted }
    });

    const { data: agriIds } = useReadContract({
        address: CONTRACTS.AGRI as `0x${string}`,
        abi: GENERIC_PRODUCT_ABI,
        functionName: 'getUserPolicies',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && mounted }
    });

    const { data: energyIds } = useReadContract({
        address: CONTRACTS.ENERGY as `0x${string}`,
        abi: GENERIC_PRODUCT_ABI,
        functionName: 'getUserPolicies',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && mounted }
    });

    const { data: catIds } = useReadContract({
        address: CONTRACTS.CATASTROPHE as `0x${string}`,
        abi: GENERIC_PRODUCT_ABI,
        functionName: 'getUserPolicies',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && mounted }
    });

    const { data: maritimeIds } = useReadContract({
        address: CONTRACTS.MARITIME as `0x${string}`,
        abi: GENERIC_PRODUCT_ABI,
        functionName: 'getUserPolicies',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && mounted }
    });

    const allPolicies = useMemo(() => {
        const items: PolicyItem[] = [];
        if (escrowIds) (escrowIds as string[]).forEach(id => items.push({ id, contract: CONTRACTS.ESCROW, type: 'Escrow' }));
        if (travelIds) (travelIds as string[]).forEach(id => items.push({ id, contract: CONTRACTS.TRAVEL, type: 'Travel' }));
        if (agriIds) (agriIds as string[]).forEach(id => items.push({ id, contract: CONTRACTS.AGRI, type: 'Agri' }));
        if (energyIds) (energyIds as string[]).forEach(id => items.push({ id, contract: CONTRACTS.ENERGY, type: 'Energy' }));
        if (catIds) (catIds as string[]).forEach(id => items.push({ id, contract: CONTRACTS.CATASTROPHE, type: 'Catastrophe' }));
        if (maritimeIds) (maritimeIds as string[]).forEach(id => items.push({ id, contract: CONTRACTS.MARITIME, type: 'Maritime' }));
        return items;
    }, [escrowIds, travelIds, agriIds, energyIds, catIds, maritimeIds]);

    // Watch for events on all products to pick up tx hashes
    useWatchContractEvent({
        config,
        address: [
            CONTRACTS.ESCROW,
            CONTRACTS.TRAVEL,
            CONTRACTS.AGRI,
            CONTRACTS.ENERGY,
            CONTRACTS.CATASTROPHE,
            CONTRACTS.MARITIME
        ],
        onLogs(logs) {
            if (address) {
                logs.forEach(log => {
                    const args = (log as any).args;
                    if (args.policyholder?.toLowerCase() === address.toLowerCase() ||
                        args.holder?.toLowerCase() === address.toLowerCase()) {
                        const pid = args.policyId || args.id;
                        if (pid) {
                            setTxHashes(prev => ({ ...prev, [pid]: log.transactionHash }));
                        }
                    }
                });
            }
        },
    });

    // Initial fetch of historical logs
    useEffect(() => {
        const fetchHistory = async () => {
            if (!address || !mounted) return;
            try {
                const publicClient = getPublicClient(config);
                if (!publicClient) return;

                const contracts = [
                    CONTRACTS.ESCROW,
                    CONTRACTS.TRAVEL,
                    CONTRACTS.AGRI,
                    CONTRACTS.ENERGY,
                    CONTRACTS.CATASTROPHE,
                    CONTRACTS.MARITIME
                ];

                const allLogs = await Promise.all(contracts.map(contract => {
                    const isTravel = contract === CONTRACTS.TRAVEL;
                    return publicClient.getLogs({
                        address: contract as `0x${string}`,
                        event: {
                            type: 'event',
                            name: 'PolicyCreated',
                            inputs: [
                                { indexed: false, name: 'id', type: 'bytes32' },
                                { indexed: false, name: 'holder', type: 'address' },
                                { indexed: false, name: 'premium', type: 'uint256' },
                                { indexed: false, name: isTravel ? 'payout' : 'maxPayout', type: 'uint256' },
                                { indexed: false, name: 'expiresAt', type: 'uint256' }
                            ]
                        },
                        fromBlock: BigInt(0)
                    }).catch(() => [])
                }));

                // Escrow uses PolicyPurchased
                const escrowLogs = await publicClient.getLogs({
                    address: CONTRACTS.ESCROW as `0x${string}`,
                    event: {
                        type: 'event',
                        name: 'PolicyPurchased',
                        inputs: [
                            { indexed: true, name: 'policyId', type: 'bytes32' },
                            { indexed: true, name: 'policyholder', type: 'address' },
                            { indexed: false, name: 'apiTarget', type: 'string' },
                            { indexed: false, name: 'premiumPaid', type: 'uint256' },
                            { indexed: false, name: 'payoutAmount', type: 'uint256' },
                            { indexed: false, name: 'expirationTime', type: 'uint256' }
                        ]
                    },
                    fromBlock: BigInt(0)
                }).catch(() => []);

                const newHashes: Record<string, string> = {};
                [...allLogs.flat(), ...escrowLogs].forEach(log => {
                    const args = (log as any).args;
                    const holder = args.holder || args.policyholder;
                    if (address && holder?.toLowerCase() === address.toLowerCase()) {
                        const pid = args.id || args.policyId;
                        if (pid) {
                            newHashes[pid] = log.transactionHash;
                        }
                    }
                });

                setTxHashes(prev => ({ ...newHashes, ...prev }));
            } catch (err) {
                console.error("Error fetching historical policy logs:", err);
            }
        };
        fetchHistory();
    }, [address, mounted]);

    if (!mounted || !isConnected) return null;

    return (
        <div id="active-policies" className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
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
                                {allPolicies.length} protocol policies found
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto">
                {allPolicies.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                            </svg>
                        </div>
                        <p className="text-sm text-zinc-500">No policies yet</p>
                        <p className="text-xs text-zinc-600 mt-1">Purchase parametric protection in the Market</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800/50">
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Sector/Target</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Premium</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Payout</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Expires In</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Policy ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPolicies.map((policy) => (
                                <PolicyRow key={policy.id} policy={policy} txHash={txHashes[policy.id]} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
