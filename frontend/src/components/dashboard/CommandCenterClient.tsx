"use client";
import React from 'react';
import { Shield, Activity, DollarSign, Landmark } from 'lucide-react';
import { PolicyCard } from '@/components/dashboard/PolicyCard';
import { PortfolioPerformanceChart } from '@/components/dashboard/PortfolioPerformanceChart';
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { readContract, getPublicClient } from "@wagmi/core";
import { config } from '@/lib/wagmiConfig';
import { CONTRACTS, ESCROW_ABI, TRAVEL_ABI, GENERIC_PRODUCT_ABI, LP_POOL_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';
import { useState, useEffect, useMemo } from 'react';

const FUJI_START_BLOCK = BigInt(52515483);
const MAX_BLOCKS_PER_QUERY = 2000; // Safer value for 2048 limit
const MAX_TOTAL_BLOCKS = 500000; // Increased to cover more history (last ~10 days)

export function CommandCenterClient() {
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [txHashes, setTxHashes] = useState<Record<string, string>>({});

    useEffect(() => {
        setMounted(true);
    }, []);

    // Global Stats Aggregation
    const [protocolData, setProtocolData] = useState<{
        totalAssets: bigint;
        totalMaxPayouts: bigint;
        activePolicyCount: number;
        userTotalShares: bigint;
    }>({
        totalAssets: BigInt(0),
        totalMaxPayouts: BigInt(0),
        activePolicyCount: 0,
        userTotalShares: BigInt(0)
    });

    const poolAddresses = [
        CONTRACTS.LP_TRAVEL,
        CONTRACTS.LP_AGRI,
        CONTRACTS.LP_ENERGY,
        CONTRACTS.LP_CAT,
        CONTRACTS.LP_MARITIME
    ];

    const productContracts = [
        { address: CONTRACTS.TRAVEL, abi: TRAVEL_ABI },
        { address: CONTRACTS.AGRI, abi: GENERIC_PRODUCT_ABI },
        { address: CONTRACTS.ENERGY, abi: GENERIC_PRODUCT_ABI },
        { address: CONTRACTS.CATASTROPHE, abi: GENERIC_PRODUCT_ABI },
        { address: CONTRACTS.MARITIME, abi: GENERIC_PRODUCT_ABI }
    ];

    // Aggressive Sync Effect
    useEffect(() => {
        const syncData = async () => {
            const pc = getPublicClient(config);
            if (!pc) return;

            console.log("Starting Aggressive Sync...");

            try {
                // Fetch Total Assets and Payouts from all pools
                const poolDataResults = await Promise.all(poolAddresses.map(async (addr) => {
                    try {
                        const [assets, payouts] = await Promise.all([
                            pc.readContract({
                                address: addr as `0x${string}`,
                                abi: LP_POOL_ABI,
                                functionName: 'totalAssets',
                                chainId: 43113
                            }),
                            pc.readContract({
                                address: addr as `0x${string}`,
                                abi: LP_POOL_ABI,
                                functionName: 'totalMaxPayouts',
                            })
                        ]);
                        return { assets: assets as bigint, payouts: payouts as bigint };
                    } catch (e) {
                        console.error(`Failed to read pool ${addr}:`, e);
                        return { assets: BigInt(0), payouts: BigInt(0) };
                    }
                }));

                const totalAssetsSum = poolDataResults.reduce((acc, curr) => acc + curr.assets, BigInt(0));
                const totalMaxPayoutSum = poolDataResults.reduce((acc, curr) => acc + curr.payouts, BigInt(0));

                // Fetch Active Policy Counts from all products
                const policyCountResults = await Promise.all(productContracts.map(async (c) => {
                    try {
                        const count = await pc.readContract({
                            address: c.address as `0x${string}`,
                            abi: c.abi,
                            functionName: 'getActivePolicyCount',
                        });
                        return Number(count);
                    } catch (e) {
                        console.error(`Failed to read product ${c.address}:`, e);
                        return 0;
                    }
                }));

                const totalActivePolicies = policyCountResults.reduce((acc, curr) => acc + curr, 0);

                // Fetch User Shares for Gov Power
                let userShares = BigInt(0);
                if (address) {
                    const shareResults = await Promise.all(poolAddresses.map(async (addr) => {
                        try {
                            const s = await pc.readContract({
                                address: addr as `0x${string}`,
                                abi: LP_POOL_ABI,
                                functionName: 'lpShares',
                                args: [address],
                            });
                            return s as bigint;
                        } catch (e) {
                            return BigInt(0);
                        }
                    }));
                    userShares = shareResults.reduce((acc, curr) => acc + curr, BigInt(0));
                }

                setProtocolData({
                    totalAssets: totalAssetsSum,
                    totalMaxPayouts: totalMaxPayoutSum,
                    activePolicyCount: totalActivePolicies,
                    userTotalShares: userShares
                });

                // console.log("Aggressive Sync Complete:", { totalAssetsSum, totalActivePolicies });

            } catch (err) {
                console.error("Aggressive Sync failed:", err);
            }
        };

        syncData();
        const interval = setInterval(syncData, 30000); // Sync every 30s
        return () => clearInterval(interval);
    }, [address, mounted]);

    // Derived values from aggressive sync
    const { totalAssets, totalMaxPayouts, activePolicyCount, userTotalShares } = protocolData;

    // Multi-contract User Policy Fetching
    const { data: escrowIds } = useReadContract({ address: CONTRACTS.ESCROW as `0x${string}`, abi: ESCROW_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address }, chainId: 43113 });
    const { data: travelIds } = useReadContract({ address: CONTRACTS.TRAVEL as `0x${string}`, abi: TRAVEL_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address }, chainId: 43113 });
    const { data: agriIds } = useReadContract({ address: CONTRACTS.AGRI as `0x${string}`, abi: GENERIC_PRODUCT_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address }, chainId: 43113 });
    const { data: energyIds } = useReadContract({ address: CONTRACTS.ENERGY as `0x${string}`, abi: GENERIC_PRODUCT_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address }, chainId: 43113 });
    const { data: catIds } = useReadContract({ address: CONTRACTS.CATASTROPHE as `0x${string}`, abi: GENERIC_PRODUCT_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address }, chainId: 43113 });
    const { data: maritimeIds } = useReadContract({ address: CONTRACTS.MARITIME as `0x${string}`, abi: GENERIC_PRODUCT_ABI, functionName: 'getUserPolicies', args: address ? [address] : undefined, query: { enabled: !!address }, chainId: 43113 });

    useEffect(() => {
        const fetchAllPolicyDetails = async () => {
            if (!address) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const results: any[] = [];

                // Helper to fetch details for a set of IDs
                const fetchGroup = async (ids: string[], contract: string, abi: any, isEscrow: boolean) => {
                    const group = await Promise.all(
                        ids.map(async (id) => {
                            try {
                                const data = await readContract(config, {
                                    address: contract as `0x${string}`,
                                    abi: abi,
                                    functionName: isEscrow ? 'getPolicy' : 'policies',
                                    args: [id]
                                }) as any[];

                                // Normalizing different product struct returns
                                if (isEscrow) {
                                    return { id, data };
                                } else {
                                    // Product mapping (Travel): [holder, premium, payout, status, expiry, flightId]
                                    // Product mapping (Agri/Generic): [holder, premium, payout, strike, exit, status, expiry, zone]
                                    // Escrow format: [holder, target, premium, payout, expiry, isActive, isClaimed]

                                    if (abi === TRAVEL_ABI) {
                                        const [holder, premium, payout, status, expiry, target] = data;
                                        return {
                                            id,
                                            data: [holder, target, premium, payout, expiry, status === 0, status === 1]
                                        };
                                    } else {
                                        const [holder, premium, payout, , , status, expiry, target] = data;
                                        return {
                                            id,
                                            data: [holder, target, premium, payout, expiry, status === 0, status === 1]
                                        };
                                    }
                                }
                            } catch (e) {
                                console.error(`Failed to fetch policy ${id} from ${contract}:`, e);
                                return null;
                            }
                        })
                    );
                    results.push(...group.filter(item => item !== null));
                };

                if (escrowIds) await fetchGroup(escrowIds as string[], CONTRACTS.ESCROW, ESCROW_ABI, true);
                if (travelIds) await fetchGroup(travelIds as string[], CONTRACTS.TRAVEL, TRAVEL_ABI, false);
                if (agriIds) await fetchGroup(agriIds as string[], CONTRACTS.AGRI, GENERIC_PRODUCT_ABI, false);
                if (energyIds) await fetchGroup(energyIds as string[], CONTRACTS.ENERGY, GENERIC_PRODUCT_ABI, false);
                if (catIds) await fetchGroup(catIds as string[], CONTRACTS.CATASTROPHE, GENERIC_PRODUCT_ABI, false);
                if (maritimeIds) await fetchGroup(maritimeIds as string[], CONTRACTS.MARITIME, GENERIC_PRODUCT_ABI, false);

                setPolicies(results);
            } catch (err) {
                console.error("Error fetching policy details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPolicyDetails();
    }, [address, escrowIds, travelIds, agriIds, energyIds, catIds, maritimeIds]);

    const getLogsInChunks = async (publicClient: any, params: any) => {
        try {
            const currentBlock = await publicClient.getBlockNumber();
            const fromBlock = params.fromBlock > currentBlock - BigInt(MAX_TOTAL_BLOCKS)
                ? params.fromBlock
                : currentBlock - BigInt(MAX_TOTAL_BLOCKS);

            let allLogs: any[] = [];
            let start = fromBlock;

            while (start < currentBlock) {
                let end = start + BigInt(MAX_BLOCKS_PER_QUERY);
                if (end > currentBlock) end = currentBlock;

                const chunk = await publicClient.getLogs({
                    ...params,
                    fromBlock: start,
                    toBlock: end
                });
                allLogs = [...allLogs, ...chunk];
                start = end + BigInt(1);
            }
            return allLogs;
        } catch (e) {
            console.error("Chunked logs error:", e);
            return [];
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            setLogsLoading(true);
            try {
                const publicClient = getPublicClient(config);
                if (!publicClient) return;

                console.log("Fetching logs from block:", FUJI_START_BLOCK.toString());

                const productContracts = [
                    { address: CONTRACTS.TRAVEL, type: 'Travel' },
                    { address: CONTRACTS.AGRI, type: 'Agri' },
                    { address: CONTRACTS.ENERGY, type: 'Energy' },
                    { address: CONTRACTS.CATASTROPHE, type: 'Catastrophe' },
                    { address: CONTRACTS.MARITIME, type: 'Maritime' }
                ];

                // Fetch PolicyCreated and PolicyClaimed from all products
                const logPromises = productContracts.flatMap(pc => [
                    getLogsInChunks(publicClient, {
                        address: pc.address as `0x${string}`,
                        event: {
                            type: 'event',
                            name: 'PolicyCreated',
                            inputs: [
                                { indexed: false, name: 'id', type: 'bytes32' },
                                { indexed: false, name: 'holder', type: 'address' },
                                { indexed: false, name: 'premium', type: 'uint256' },
                                { indexed: false, name: pc.type === 'Travel' ? 'payout' : 'maxPayout', type: 'uint256' },
                                { indexed: false, name: 'expiresAt', type: 'uint256' }
                            ]
                        },
                        fromBlock: FUJI_START_BLOCK
                    }),
                    getLogsInChunks(publicClient, {
                        address: pc.address as `0x${string}`,
                        event: {
                            type: 'event',
                            name: 'PolicyClaimed',
                            inputs: [
                                { indexed: false, name: 'id', type: 'bytes32' },
                                { indexed: false, name: pc.type === 'Travel' ? 'payout' : 'actualPayout', type: 'uint256' }
                            ]
                        },
                        fromBlock: FUJI_START_BLOCK
                    })
                ]);

                // Escrow special events
                logPromises.push(
                    getLogsInChunks(publicClient, {
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
                        fromBlock: FUJI_START_BLOCK
                    }),
                    getLogsInChunks(publicClient, {
                        address: CONTRACTS.ESCROW as `0x${string}`,
                        event: {
                            type: 'event',
                            name: 'PolicyClaimed',
                            inputs: [
                                { indexed: true, name: 'policyId', type: 'bytes32' },
                                { indexed: true, name: 'policyholder', type: 'address' },
                                { indexed: false, name: 'payoutAmount', type: 'uint256' }
                            ]
                        },
                        fromBlock: FUJI_START_BLOCK
                    })
                );

                const results = await Promise.all(logPromises);
                const allLogs = results.flat().sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

                // Fetch timestamps for the top logs to show relative time
                const topLogs = allLogs.slice(0, 15);
                const logsWithTime = await Promise.all(topLogs.map(async (log) => {
                    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                    const args = (log as any).args;
                    const eventName = (log as any).eventName || 'Transaction';
                    const isClaim = eventName.includes('Claimed');
                    const amount = args.premium || args.premiumPaid || args.payout || args.payoutAmount;

                    // Simple relative time helper
                    const secondsAgo = Math.floor(Date.now() / 1000) - Number(block.timestamp);
                    let timeStr = "Just now";
                    if (secondsAgo > 3600) timeStr = `${Math.floor(secondsAgo / 3600)}h ago`;
                    else if (secondsAgo > 60) timeStr = `${Math.floor(secondsAgo / 60)}m ago`;

                    return {
                        id: `${log.transactionHash}-${log.logIndex}`,
                        type: isClaim ? 'claim' : 'purchase',
                        title: isClaim ? 'Policy Claim Settle' : 'Parametric Purchase',
                        desc: isClaim ? `Settled payout of $${formatUnits(amount, 6)}` : `New policy issued for $${formatUnits(amount, 6)}`,
                        time: timeStr,
                        amount: formatUnits(amount, 6),
                        hash: log.transactionHash
                    };
                }));

                setLogs(logsWithTime);

                // Populate txHashes mapping for PolicyCards using ALL logs
                const hashes: Record<string, string> = {};
                allLogs.forEach(log => {
                    const args = (log as any).args;
                    const pid = args.id || args.policyId;
                    if (pid) {
                        hashes[pid] = log.transactionHash;
                    }
                });
                setTxHashes(hashes);

                // Derive global aggregate stats from ALL logs
                const totalPremiumsVal = allLogs.reduce((acc, log) => {
                    const args = (log as any).args;
                    const eventName = (log as any).eventName;
                    if (eventName === 'PolicyCreated' || eventName === 'PolicyPurchased') {
                        const premium = args.premium || args.premiumPaid || BigInt(0);
                        return acc + Number(formatUnits(premium, 6));
                    }
                    return acc;
                }, 0);

                const totalClaimsVal = allLogs.reduce((acc, log) => {
                    const args = (log as any).args;
                    if ((log as any).eventName?.includes('Claimed')) {
                        const payout = args.payout || args.payoutAmount || BigInt(0);
                        return acc + Number(formatUnits(payout, 6));
                    }
                    return acc;
                }, 0);

                setGlobalCalculatedStats({
                    totalPremiums: totalPremiumsVal,
                    totalClaims: totalClaimsVal
                });

            } catch (err) {
                console.error("Error fetching logs:", err);
            } finally {
                setLogsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const [globalCalculatedStats, setGlobalCalculatedStats] = useState({ totalPremiums: 0, totalClaims: 0 });

    const activeCount = policies.filter(p => p.data[5]).length; // p.data[5] is isActive
    const tvlValue = totalAssets ? `$${(Number(formatUnits(totalAssets as bigint, 6)) / 1e6).toFixed(1)}M` : "$0.0M";
    const payoutValue = totalMaxPayouts ? `$${(Number(formatUnits(totalMaxPayouts as bigint, 6)) / 1e6).toFixed(1)}M` : "$0.0M";

    // Calculate personal stats
    const totalPersonalCoverage = policies.reduce((acc, p) => acc + Number(formatUnits(p.data[3], 6)), 0);
    const totalPersonalPremiums = policies.reduce((acc, p) => acc + Number(formatUnits(p.data[2], 6)), 0);

    // Final dashboard formatting - using calculated or real-time data
    const tvl = Number(formatUnits(totalAssets, 6)) > 1000000
        ? `$${(Number(formatUnits(totalAssets, 6)) / 1e6).toFixed(1)}M`
        : `$${Number(formatUnits(totalAssets, 6)).toLocaleString()}`;

    const claimsPaid = globalCalculatedStats.totalClaims > 1000000
        ? `$${(globalCalculatedStats.totalClaims / 1e6).toFixed(1)}M`
        : `$${globalCalculatedStats.totalClaims.toLocaleString()}`;

    const totalPremiums = `$${globalCalculatedStats.totalPremiums.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const govPower = `${(Number(formatUnits(userTotalShares, 6)) / 1000).toFixed(1)}k`;

    if (!mounted) return null;

    return (
        <div className="min-h-screen p-6 lg:p-12 space-y-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Command Center</h1>
                    <p className="text-slate-400 mt-2">Manage your parametric risk portfolio</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Personal Coverage</span>
                        <span className="text-lg font-bold text-foreground">${totalPersonalCoverage.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Covered (TVL)" value={tvl} icon={<Shield className="text-primary w-5 h-5" />} trend="+12.5%" />
                <StatCard title="Total Premiums" value={totalPremiums} icon={<DollarSign className="text-amber-500 w-5 h-5" />} trend="+1.2%" />
                <StatCard title="Claims Settled" value={claimsPaid} icon={<Shield className="text-emerald-500 w-5 h-5" />} trend="+4.2%" />
                <StatCard title="Active Policies" value={activePolicyCount.toString()} icon={<Activity className="text-blue-500 w-5 h-5" />} trend={`+${policies.length}`} />
                <StatCard title="Governance Power" value={govPower} icon={<Landmark className="text-purple-500 w-5 h-5" />} trend="Top 5%" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Insights Area */}
                <section className="lg:col-span-8 space-y-8">
                    {/* Performance Chart */}
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Portfolio Performance</h2>
                                <p className="text-sm text-slate-500">Historical growth of your protection assets</p>
                            </div>
                            <div className="flex gap-2">
                                {['1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
                                    <button key={range} className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${range === '1Y' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}>
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <PortfolioPerformanceChart />
                    </div>

                    {/* Active Policy List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-foreground">Your Policies</h2>
                            <button onClick={() => {
                                const el = document.getElementById('active-policies');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }} className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">View All</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => <PolicySkeleton key={i} />)
                            ) : policies.length === 0 ? (
                                <div className="col-span-2 p-12 text-center border border-dashed border-white/10 rounded-2xl">
                                    <p className="text-slate-500">No active policies found.</p>
                                </div>
                            ) : (
                                policies.slice(0, 4).map(policy => (
                                    <PolicyCard
                                        key={policy.id}
                                        policyId={policy.id}
                                        policyData={policy.data}
                                        txHash={txHashes[policy.id]}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Recent Activity Feed */}
                <section className="lg:col-span-4 bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl h-fit">
                    <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> Network Activity
                    </h2>
                    <div className="space-y-6">
                        {logsLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-800" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-24 bg-slate-800 rounded" />
                                        <div className="h-3 w-full bg-slate-800 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : logs.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-xs text-slate-500">No network activity yet.</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="flex gap-4 group">
                                    <div className={`w-2 h-2 mt-1.5 rounded-full ${log.type === 'claim' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(128,0,32,0.5)]'}`} />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">{log.title}</span>
                                            <span className="text-[10px] text-zinc-500">{log.time}</span>
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-snug">{log.desc}</p>
                                        <a
                                            href={`https://testnet.snowtrace.io/tx/${log.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] text-primary font-bold uppercase hover:underline inline-block pt-1"
                                        >
                                            View TX
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-black/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <span className="text-sm text-slate-400 font-medium">{title}</span>
                <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
            </div>
            <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
                <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-primary'}`}>{trend}</span>
            </div>
        </div>
    );
}

function PolicySkeleton() {
    return (
        <div className="h-[200px] rounded-2xl border border-white/5 bg-black/40 p-5 animate-pulse flex flex-col justify-between">
            <div className="flex justify-between">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800" />
                    <div className="space-y-2 pt-1">
                        <div className="w-24 h-4 bg-slate-800 rounded" />
                        <div className="w-16 h-3 bg-slate-800 rounded" />
                    </div>
                </div>
                <div className="w-16 h-5 rounded-full bg-slate-800" />
            </div>
            <div className="space-y-3">
                <div className="w-full h-4 bg-slate-800 rounded" />
                <div className="w-3/4 h-4 bg-slate-800 rounded" />
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="w-32 h-3 bg-slate-800 rounded" />
            </div>
        </div>
    );
}
