"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useChainId, useSwitchChain, useSimulateContract } from "wagmi";
import { CONTRACTS, POOLS } from '@/lib/contracts';
import { config } from '@/lib/wagmiConfig';
import { getPublicClient } from '@wagmi/core';
import { LIQUIDITY_POOL_ABI, ERC20_ABI } from '@/lib/enterprise_abis';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const FUJI_START_BLOCK = BigInt(52515483);
const MAX_BLOCKS_PER_QUERY = 2000;
const MAX_TOTAL_BLOCKS = 500000;
import { cn } from '@/lib/utils';
import { Trophy, Users, Activity, Shield, TrendingUp, Award, RefreshCcw, ArrowUpRight, ArrowDownLeft, DollarSign, Clock, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { InstitutionalTooltip } from '@/components/ui/InstitutionalTooltip';

const performanceData = [
    { date: '2024-02-23', tvl: 4.2, yield: 12.1, utilization: 45 },
    { date: '2024-02-24', tvl: 4.5, yield: 12.4, utilization: 48 },
    { date: '2024-02-25', tvl: 4.8, yield: 13.2, utilization: 52 },
    { date: '2024-02-26', tvl: 5.1, yield: 14.1, utilization: 58 },
    { date: '2024-02-27', tvl: 5.4, yield: 13.8, utilization: 55 },
    { date: '2024-02-28', tvl: 5.9, yield: 14.5, utilization: 62 },
    { date: '2024-03-01', tvl: 6.2, yield: 15.1, utilization: 68 },
];

// No mock pools needed. using REAL POOLS from contracts.ts

export function InvestDashboardClient() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const TARGET_CHAIN_ID = 43113; // Fuji

    // Pool Selection & Forms
    const [selectedPool, setSelectedPool] = useState(POOLS[0]);
    const [amount, setAmount] = useState("");
    const [actionType, setActionType] = useState<"deposit" | "withdraw">("deposit");
    const [isScheduled, setIsScheduled] = useState(false);
    const [withdrawalDate, setWithdrawalDate] = useState("");

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [isTxPending, setIsTxPending] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedHistory = localStorage.getItem("invest_history");
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("invest_history", JSON.stringify(history));
        }
    }, [history, mounted]);
    const getLogsInChunks = async (params: any) => {
        if (!publicClient) return [];
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
            console.error("Invest chunked logs error:", e);
            return [];
        }
    };

    // Contract Reads
    const { data: totalAssets, refetch: refetchAssets } = useReadContract({
        address: selectedPool.address as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets',
        query: {
            enabled: mounted,
            refetchInterval: 10000 // Refetch every 10s
        },
        chainId: 43113
    });

    const { data: totalMaxPayouts, refetch: refetchPayouts } = useReadContract({
        address: selectedPool.address as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts',
        query: { enabled: mounted },
        chainId: 43113
    });

    const { data: totalShares, refetch: refetchTotalShares } = useReadContract({
        address: selectedPool.address as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalShares',
        query: { enabled: mounted },
        chainId: 43113
    });

    const { data: globalPositions, refetch: refetchGlobalPositions } = useReadContracts({
        contracts: [
            ...POOLS.map(pool => ({
                address: pool.address as `0x${string}`,
                abi: LIQUIDITY_POOL_ABI,
                functionName: 'lpShares',
                args: address ? [address] : undefined,
            })),
            ...POOLS.map(pool => ({
                address: pool.address as `0x${string}`,
                abi: LIQUIDITY_POOL_ABI,
                functionName: 'totalAssets',
            })),
            ...POOLS.map(pool => ({
                address: pool.address as `0x${string}`,
                abi: LIQUIDITY_POOL_ABI,
                functionName: 'totalShares',
            })),
        ],
        query: {
            enabled: mounted && !!address && chainId === TARGET_CHAIN_ID,
            refetchInterval: 10000
        },
        chainId: 43113
    });

    const userLiquidityValue = useMemo(() => {
        if (!globalPositions || !address) return BigInt(0);

        let totalValue = BigInt(0);
        try {
            for (let i = 0; i < POOLS.length; i++) {
                const sharesResult = globalPositions[i];
                const assetsResult = globalPositions[i + POOLS.length];
                const supplyResult = globalPositions[i + (POOLS.length * 2)];

                if (sharesResult?.status === 'success' && assetsResult?.status === 'success' && supplyResult?.status === 'success') {
                    const shares = sharesResult.result as bigint;
                    const assets = assetsResult.result as bigint;
                    const supply = supplyResult.result as bigint;

                    if (shares > 0 && supply > 0) {
                        totalValue += (shares * assets) / supply;
                    }
                }
            }
        } catch (e) {
            console.error("Error calculating user liquidity:", e);
        }
        return totalValue;
    }, [globalPositions, address, chainId]);

    // Force refetch on address or chain change
    useEffect(() => {
        if (mounted && address && chainId === TARGET_CHAIN_ID) {
            console.log("Forcing refetch of liquidity data for address:", address);
            refetchAssets();
            refetchPayouts();
            refetchTotalShares();
            refetchGlobalPositions();
            refetchBalance();
            refetchAllowance();
        }
    }, [address, chainId, mounted]);

    const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: mounted && !!address,
            refetchInterval: 10000
        },
        chainId: 43113
    });

    const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, selectedPool.address as `0x${string}`] : undefined,
        query: { enabled: mounted && !!address },
        chainId: 43113
    });

    const { data: intentAmount, refetch: refetchIntentAmount } = useReadContract({
        address: selectedPool.address as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'withdrawalIntentAmount',
        args: address ? [address] : undefined,
        query: { enabled: mounted && !!address },
        chainId: 43113
    });

    const { data: intentTimestamp, refetch: refetchIntentTimestamp } = useReadContract({
        address: selectedPool.address as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'withdrawalIntentTimestamp',
        args: address ? [address] : undefined,
        query: { enabled: mounted && !!address },
        chainId: 43113
    });

    // Contract Writes
    const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
    const { isLoading: isTxConfirming, isSuccess: isTxSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash });

    // Robust approval check
    const needsApproval = useMemo(() => {
        if (actionType !== "deposit" || !amount || usdcAllowance === undefined) return false;
        try {
            const val = parseUnits(amount, 6);
            return val > (usdcAllowance as bigint);
        } catch (e) {
            return false;
        }
    }, [actionType, amount, usdcAllowance]);

    // Pre-simulate approval to catch reverts early
    const depositAmountBigInt = useMemo(() => {
        try {
            return amount ? parseUnits(amount, 6) : BigInt(0);
        } catch {
            return BigInt(0);
        }
    }, [amount]);

    const { data: simulateApprove, error: simulateApproveError } = useSimulateContract({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [selectedPool.address as `0x${string}`, depositAmountBigInt],
        query: {
            enabled: mounted && isConnected && actionType === 'deposit' && needsApproval && !!amount && parseFloat(amount) > 0
        },
        chainId: TARGET_CHAIN_ID
    });

    useEffect(() => {
        if (isTxConfirming) {
            toast.loading("Confirming transaction...", { id: "tx" });
        } else if (isTxSuccess) {
            if (isApproving) {
                toast.success("USDC Approved!", { id: "tx" });
                setIsApproving(false);
                setIsSubmitting(false);
                refetchAllowance();
                // We keep amount so user can deposit immediately
            } else {
                toast.success(`${actionType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`, { id: "tx" });

                // Add to history explicitly on success
                const newEntry = {
                    id: hash,
                    type: actionType,
                    amount: amount,
                    timestamp: Date.now(),
                    hash: hash
                };
                setHistory(prev => [newEntry, ...prev].slice(0, 50));

                setAmount("");
                refetchAssets();
                refetchTotalShares();
                refetchAllowance();
                refetchPayouts();
                refetchGlobalPositions();
                refetchBalance();
                refetchIntentAmount();
                refetchIntentTimestamp();
                setIsSubmitting(false);
            }
        } else if (confirmError) {
            console.error("Transaction Confirmation Error:", confirmError);
            toast.error(confirmError.message || "Transaction failed during confirmation", { id: "tx" });
            setIsApproving(false);
            setIsSubmitting(false);
        }
    }, [isTxConfirming, isTxSuccess, confirmError, isApproving, actionType, refetchAllowance, refetchAssets, refetchTotalShares, refetchPayouts, refetchGlobalPositions, refetchBalance, refetchIntentAmount, refetchIntentTimestamp]);

    useEffect(() => {
        if (writeError) {
            console.error("Transaction Write Error:", writeError);
            toast.error(writeError.message || "Transaction failed to send", { id: "tx" });
            setIsApproving(false);
            setIsSubmitting(false);
        }
    }, [writeError]);


    const handleTransaction = async () => {
        console.log("Initiating transaction...", { actionType, amount, needsApproval });

        if (!isConnected || !address) {
            return toast.error("Connect wallet to secure liquidity.");
        }

        if (!amount || parseFloat(amount) <= 0) {
            return toast.error("Enter a valid amount");
        }

        const value = parseUnits(amount, 6);

        // Pre-flight balance check
        if (actionType === "deposit" && usdcBalance !== undefined && value > (usdcBalance as bigint)) {
            return toast.error(`Insufficient USDC balance.`);
        }

        try {
            // Pre-flight chain check
            if (chainId !== TARGET_CHAIN_ID) {
                toast.info("Switching to Avalanche Fuji...");
                switchChain?.({ chainId: TARGET_CHAIN_ID });
                return;
            }

            if (actionType === "deposit") {
                if (needsApproval) {
                    setIsApproving(true);
                    console.log("Invest Page: Requesting USDC Approval", {
                        spender: selectedPool.address,
                        amount: value.toString(),
                        token: CONTRACTS.USDC
                    });
                    toast.loading("Requesting USDC Approval...", { id: "tx" });

                    const executeApprove = (isReset = false) => {
                        const approveValue = isReset ? BigInt(0) : value;
                        console.log(`Invest Page: Calling ${isReset ? 'Reset' : 'Approval'}`, {
                            spender: selectedPool.address,
                            amount: approveValue.toString()
                        });

                        writeContract({
                            address: CONTRACTS.USDC as `0x${string}`,
                            abi: ERC20_ABI,
                            functionName: 'approve',
                            args: [selectedPool.address as `0x${string}`, approveValue],
                            chainId: TARGET_CHAIN_ID,
                            gas: BigInt(650000)
                        }, {
                            onError: (error: any) => {
                                console.error("Invest Page: Transaction Error", error);
                                // If it reverted, maybe it needs a reset (USDC race condition protection)
                                toast.error("Approval failed. Some USDC contracts require a 0-allowance reset first.", {
                                    id: "tx",
                                    action: {
                                        label: "Reset to 0",
                                        onClick: () => executeApprove(true)
                                    }
                                });
                                setIsApproving(false);
                            }
                        });
                    };

                    executeApprove();
                } else {
                    setIsSubmitting(true);
                    console.log("Invest Page: Depositing Liquidity", {
                        pool: selectedPool.address,
                        amount: value.toString()
                    });
                    toast.loading(`Depositing to ${selectedPool.sector} Pool...`, { id: "tx" });
                    writeContract({
                        address: selectedPool.address as `0x${string}`,
                        abi: LIQUIDITY_POOL_ABI,
                        functionName: 'depositLiquidity',
                        args: [value],
                        chainId: TARGET_CHAIN_ID,
                        gas: BigInt(800000) // Force manual gas limit for deposit
                    });
                }
            } else {
                setIsSubmitting(true);
                const message = isScheduled ? `Scheduling Withdrawal for ${withdrawalDate}` : "Confirming Withdrawal...";
                console.log("Invest Page: Withdrawing Liquidity", {
                    pool: selectedPool.address,
                    amount: value.toString(),
                    isScheduled
                });
                toast.loading(message, { id: "tx" });

                if (isScheduled) {
                    const unlockTime = Math.floor(new Date(withdrawalDate).getTime() / 1000);
                    writeContract({
                        address: selectedPool.address as `0x${string}`,
                        abi: LIQUIDITY_POOL_ABI,
                        functionName: 'scheduleWithdrawal',
                        args: [value, BigInt(unlockTime)],
                        chainId: TARGET_CHAIN_ID,
                        gas: BigInt(500000)
                    });
                } else {
                    writeContract({
                        address: selectedPool.address as `0x${string}`,
                        abi: LIQUIDITY_POOL_ABI,
                        functionName: 'withdrawLiquidity',
                        args: [value],
                        chainId: TARGET_CHAIN_ID,
                        gas: BigInt(500000)
                    });
                }
            }
        } catch (err: any) {
            toast.error(err.message || "Transaction failed");
            setIsSubmitting(false);
            setIsApproving(false);
        }
    };

    const handleMint = async () => {
        if (!address) return;
        setIsMinting(true);
        writeContract({
            address: CONTRACTS.USDC,
            abi: ERC20_ABI,
            functionName: 'mint',
            args: [address, parseUnits("1000", 6)],
            chainId: TARGET_CHAIN_ID,
            gas: BigInt(200000)
        });
    };

    useWatchContractEvent({
        address: selectedPool.address as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        eventName: 'LiquidityDeposited',
        onLogs: (logs) => {
            const userLogs = logs.filter(l => (l.args as any).provider?.toLowerCase() === address?.toLowerCase());
            if (userLogs.length > 0) {
                setHistory(prev => [...userLogs.map(l => ({
                    id: l.transactionHash,
                    type: 'deposit',
                    amount: formatUnits(((l.args as any).amount || BigInt(0)) as bigint, 6),
                    timestamp: Date.now(),
                    hash: l.transactionHash
                })), ...prev].slice(0, 50));
            }
        },
    });

    useWatchContractEvent({
        address: selectedPool.address as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        eventName: 'LiquidityWithdrawn',
        onLogs: (logs) => {
            const userLogs = logs.filter(l => (l.args as any).provider?.toLowerCase() === address?.toLowerCase());
            if (userLogs.length > 0) {
                setHistory(prev => [...userLogs.map(l => ({
                    id: l.transactionHash,
                    type: 'withdraw',
                    amount: formatUnits(((l.args as any).amount || BigInt(0)) as bigint, 6),
                    timestamp: Date.now(),
                    hash: l.transactionHash
                })), ...prev].slice(0, 50));
            }
        },
    });

    // Initial fetch of historical logs
    useEffect(() => {
        const fetchHistory = async () => {
            if (!address || !mounted) return;
            setIsLoadingHistory(true);
            try {
                const publicClient = getPublicClient(config);
                if (!publicClient) return;

                const poolContracts = [
                    CONTRACTS.LP_TRAVEL,
                    CONTRACTS.LP_AGRI,
                    CONTRACTS.LP_ENERGY,
                    CONTRACTS.LP_CAT,
                    CONTRACTS.LP_MARITIME
                ];

                const allLogsPromises = poolContracts.flatMap(poolAddr => [
                    getLogsInChunks({
                        address: poolAddr as `0x${string}`,
                        event: {
                            type: 'event',
                            name: 'LiquidityDeposited',
                            inputs: [
                                { indexed: true, name: 'provider', type: 'address' },
                                { indexed: false, name: 'amount', type: 'uint256' },
                                { indexed: false, name: 'shares', type: 'uint256' }
                            ]
                        },
                        fromBlock: FUJI_START_BLOCK
                    }),
                    getLogsInChunks({
                        address: poolAddr as `0x${string}`,
                        event: {
                            type: 'event',
                            name: 'LiquidityWithdrawn',
                            inputs: [
                                { indexed: true, name: 'provider', type: 'address' },
                                { indexed: false, name: 'amount', type: 'uint256' },
                                { indexed: false, name: 'shares', type: 'uint256' }
                            ]
                        },
                        fromBlock: FUJI_START_BLOCK
                    })
                ]);

                const results = await Promise.all(allLogsPromises);
                const allLogs = results.flat();

                const userHistory = allLogs
                    .filter((l: any) => (l.args as any).provider?.toLowerCase() === address.toLowerCase())
                    .map((l: any) => ({
                        id: `${l.transactionHash}-${l.logIndex}`,
                        type: l.eventName === 'LiquidityDeposited' ? 'deposit' : 'withdraw',
                        amount: formatUnits((l.args as any).amount, 6),
                        timestamp: Date.now(), // approximation
                        hash: l.transactionHash
                    }))
                    .sort((a, b) => b.timestamp - a.timestamp);

                setHistory(userHistory.slice(0, 50));

            } catch (err) {
                console.error("Error fetching historical liquidity logs:", err);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [address, mounted]);

    const globalUtilization = totalAssets && totalMaxPayouts ? (Number(totalMaxPayouts) * 100) / Number(totalAssets) : 0;
    const formattedBalance = usdcBalance ? formatUnits(usdcBalance as bigint, 6) : "0";

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Underwriting Terminal</h1>
                    <p className="text-sm text-zinc-400 mt-1">Provide USDC liquidity to back 100% collateralized institutional risk.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Your Liquidity Position</p>
                        <p className="text-xl font-black text-foreground">{userLiquidityValue ? formatUnits(userLiquidityValue, 6) : "0.00"} USDC</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left: Pool Overview Grid */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">Risk Distributions</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Global Protocol Solvency:</span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">100.00%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {POOLS.map(pool => {
                            const isSelected = selectedPool.id === pool.id;
                            const utilization = totalAssets && totalMaxPayouts && isSelected ? (Number(totalMaxPayouts) * 100) / Number(totalAssets) : 15.5;
                            const isCapped = utilization >= 95;

                            return (
                                <div
                                    key={pool.id}
                                    onClick={() => setSelectedPool(pool)}
                                    className={cn(
                                        "relative cursor-pointer bg-zinc-900/40 backdrop-blur-md border rounded-3xl p-6 transition-all group",
                                        isSelected ? "border-primary shadow-[0_0_20px_rgba(128,0,32,0.1)]" : "border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center", pool.color)}>
                                                <span className="material-symbols-outlined text-2xl">
                                                    {pool.icon}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xl font-black text-foreground">{pool.sector}</p>
                                                    <InstitutionalTooltip
                                                        title={`${pool.sector} Security`}
                                                        content={`This vault strictly supports the ${pool.sector} insurance product line. Funds are protected via collateral isolation.`}
                                                        position="top"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{pool.name}</p>
                                            </div>
                                        </div>
                                        <div className={cn("p-2 rounded-lg transition-colors", isSelected ? 'bg-primary text-white' : 'bg-white/5 text-zinc-500')}>
                                            <Shield className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                            {pool.description}
                                        </p>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-zinc-500 font-bold uppercase">Utilization Rate</span>
                                                <span className={cn("font-black", utilization > 80 ? "text-orange-500" : "text-emerald-500")}>
                                                    {isSelected ? utilization.toFixed(1) : "--"}%
                                                </span>
                                            </div>
                                            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-1000", isSelected ? 'bg-primary' : 'bg-zinc-800')}
                                                    style={{ width: isSelected ? `${utilization}%` : '5%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Performance History Section */}
                    <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" /> Performance Analytics
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    <span className="text-[9px] text-zinc-500 uppercase font-black">TVL (USDC M)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    <span className="text-[9px] text-zinc-500 uppercase font-black">Blended APY %</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                                    <span className="text-[9px] text-zinc-500 uppercase font-black">Utilization %</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[320px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#800020" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#800020" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorUtilization" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#52525b"
                                        fontSize={9}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => str.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        stroke="#52525b"
                                        fontSize={9}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px' }}
                                        labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '10px', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="tvl" stroke="#800020" strokeWidth={3} fillOpacity={1} fill="url(#colorTvl)" />
                                    <Area type="monotone" dataKey="utilization" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUtilization)" strokeDasharray="5 5" />
                                    <Area type="monotone" dataKey="yield" stroke="#34d399" strokeWidth={3} fillOpacity={0} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* LP History Section */}
                    <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <RefreshCcw className={`w-5 h-5 text-primary ${isLoadingHistory ? 'animate-spin' : ''}`} /> Liquidity History
                            </h3>
                            <button
                                onClick={() => refetchBalance()} // Simple refresh trigger
                                className="text-[10px] font-black text-zinc-500 hover:text-foreground transition-colors uppercase tracking-widest"
                            >
                                {isLoadingHistory ? 'Refreshing...' : 'Refresh History'}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 tracking-widest">
                                        <th className="pb-4">Date / Time</th>
                                        <th className="pb-4">Type</th>
                                        <th className="pb-4">Amount</th>
                                        <th className="pb-4 text-right">Transaction</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-zinc-500 font-bold italic">
                                                {isLoadingHistory ? 'Indexing blockchain events...' : 'No liquidity events found for this wallet.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((item) => (
                                            <tr key={item.id} className="border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 text-zinc-300 font-medium">
                                                    {new Date(item.timestamp).toLocaleString()}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${item.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary/10 text-primary'
                                                        }`}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-foreground font-mono font-bold">
                                                    {Number(item.amount).toLocaleString()} USDC
                                                </td>
                                                <td className="py-4 text-right">
                                                    <a
                                                        href={`https://testnet.snowtrace.io/tx/${item.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-black uppercase tracking-widest text-[10px] group-hover:translate-x-1 transition-all"
                                                    >
                                                        Details <ArrowUpRight className="w-3 h-3" />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Action Interface Form */}
                <div className="lg:col-span-4 lg:sticky lg:top-24">
                    <div className="bg-card border border-border rounded-2xl p-8 sticky top-24 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                        <h3 className="text-lg font-black text-foreground mb-8 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" /> Execution Engine
                        </h3>

                        <div className="flex rounded-xl border border-white/5 bg-black/50 p-1 mb-8">
                            <button
                                onClick={() => setActionType("deposit")}
                                className={`flex-1 flex items-center justify-center gap-2 text-xs font-black py-3 rounded-lg transition-all
                                    ${actionType === 'deposit' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <ArrowUpRight className="w-3.5 h-3.5" /> DEPOSIT
                            </button>
                            <button
                                onClick={() => setActionType("withdraw")}
                                className={`flex-1 flex items-center justify-center gap-2 text-xs font-black py-3 rounded-lg transition-all
                                    ${actionType === 'withdraw' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <ArrowDownLeft className="w-3.5 h-3.5" /> WITHDRAW
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Backing Asset Pool</label>
                                <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-sm font-black text-foreground">{selectedPool.sector} Protection</span>
                                    </div>
                                    <span className="text-xs text-primary font-black bg-primary/10 px-2 py-1 rounded">12.4% APY</span>
                                </div>
                            </div>

                            <div className="space-y-3 relative">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex justify-between items-center">
                                    Liquidity Amount (USDC)
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary font-black opacity-60">BAL: {Number(formattedBalance).toLocaleString()}</span>
                                        <button onClick={() => refetchBalance()} className="p-1 hover:bg-white/5 rounded-md transition-colors">
                                            <RefreshCcw className="w-3 h-3 text-zinc-500" />
                                        </button>
                                    </div>
                                </label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
                                    <input
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-16 py-5 text-2xl font-black text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                                    />
                                    <button onClick={() => setAmount(formattedBalance)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">
                                        MAX
                                    </button>
                                </div>
                                {isConnected && Number(formattedBalance) < 1000 && (
                                    <button
                                        onClick={handleMint}
                                        disabled={isMinting}
                                        className="w-full py-3 bg-primary/5 border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isMinting ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <DollarSign className="w-3 h-3" />}
                                        Get Test USDC (Faucet)
                                    </button>
                                )}
                                {actionType === "withdraw" && (
                                    <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-bold text-foreground text-[10px] uppercase tracking-widest">Scheduled Withdrawal</span>
                                            </div>
                                            <button
                                                onClick={() => setIsScheduled(!isScheduled)}
                                                className={cn("w-10 h-5 rounded-full transition-all relative", isScheduled ? "bg-primary" : "bg-zinc-700")}
                                            >
                                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", isScheduled ? "left-5.5" : "left-0.5")} />
                                            </button>
                                        </div>
                                        {isScheduled && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <p className="text-[9px] text-zinc-500 font-medium leading-relaxed italic">
                                                    Set a target date to signal your exit. This help the protocol manage capital buffers.
                                                </p>
                                                <input
                                                    type="date"
                                                    value={withdrawalDate}
                                                    onChange={(e) => setWithdrawalDate(e.target.value)}
                                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isConnected && intentTimestamp && Number(intentTimestamp) > 0 && (
                                    <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">On-Chain Intent Detected</p>
                                            <p className="text-xs text-zinc-300 font-bold">
                                                Active scheduling for <span className="text-foreground">{formatUnits((intentAmount as bigint) || BigInt(0), 6)} shares</span>.
                                            </p>
                                            <p className="text-[10px] text-zinc-500 font-medium italic" id="intent-lock-text">
                                                Locked until: {new Date(Number(intentTimestamp) * 1000).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleTransaction}
                                disabled={isSubmitting || isTxPending}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-500 relative flex items-center justify-center gap-2
                                    ${isTxSuccess ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]' :
                                        (isSubmitting || isTxPending) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' :
                                            'bg-primary hover:bg-primary/90 text-white shadow-[0_10px_20px_rgba(128,0,32,0.3)]'}
                                    disabled:opacity-50`}
                            >
                                {isTxPending ? <RefreshCcw className="w-4 h-4 animate-spin" /> :
                                    isSubmitting ? (isApproving ? 'Approving...' : 'Confirming...') :
                                        (isTxSuccess && !isApproving && !amount) ? <><CheckCircle2 className="w-5 h-5" /> SUCCEEDED</> :
                                            !isConnected ? <><Layers className="w-4 h-4" /> CONNECT WALLET</> :
                                                chainId !== TARGET_CHAIN_ID ? <><Activity className="w-4 h-4" /> SWITCH TO FUJI</> : // Explicit CTA for network
                                                    !amount ? <><DollarSign className="w-4 h-4" /> ENTER AMOUNT</> :
                                                        (actionType === 'deposit' ? (needsApproval ? 'APPROVE USDC' : 'INITIATE DEPOSIT') : 'REQUEST WITHDRAWAL')}
                            </button>
                        </div>

                        <div className="mt-10 p-5 bg-white/[0.02] rounded-2xl border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest opacity-60">
                                <Activity className="w-3.5 h-3.5" /> Dynamic Yield Vector
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-500">Aave V3 Protocol Rate</span>
                                <span className="text-zinc-300 font-mono">4.20%</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-500">Underwriting Risk Premium</span>
                                <span className="text-emerald-400 font-mono">+12.4%</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
