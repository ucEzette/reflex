"use client";

import React, { useState, useEffect } from 'react';
import { PoolMetrics } from '@/types/market';
import { DollarSign, ShieldCheck, TrendingUp, Layers, Activity, AlertTriangle, CheckCircle2, RefreshCcw, ArrowUpRight, ArrowDownLeft, Lock, Verified, UserCheck } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnect, usePublicClient } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { LIQUIDITY_POOL_ABI, ERC20_ABI } from '@/lib/enterprise_abis';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { avalancheFuji } from 'wagmi/chains';

const performanceData = [
    { date: '2024-02-23', tvl: 4.2, yield: 12.1, utilization: 45 },
    { date: '2024-02-24', tvl: 4.5, yield: 12.4, utilization: 48 },
    { date: '2024-02-25', tvl: 4.8, yield: 13.2, utilization: 52 },
    { date: '2024-02-26', tvl: 5.1, yield: 14.1, utilization: 58 },
    { date: '2024-02-27', tvl: 5.4, yield: 13.8, utilization: 55 },
    { date: '2024-02-28', tvl: 5.9, yield: 14.5, utilization: 62 },
    { date: '2024-03-01', tvl: 6.2, yield: 15.1, utilization: 68 },
];

const mockPools: PoolMetrics[] = [
    { id: "pool-1", productId: "flight", productTitle: "Travel Solutions", tvl: 4500000, apy: 14.2, baseAaveApy: 4.2, riskPremiumApy: 10.0, utilization: 65, maxPayouts: 2925000 },
    { id: "pool-2", productId: "agri", productTitle: "Agriculture Solutions", tvl: 8200000, apy: 18.5, baseAaveApy: 4.2, riskPremiumApy: 14.3, utilization: 82, maxPayouts: 6724000 },
    { id: "pool-3", productId: "energy", productTitle: "Energy Solutions", tvl: 5100000, apy: 12.8, baseAaveApy: 4.2, riskPremiumApy: 8.6, utilization: 45, maxPayouts: 2295000 },
    { id: "pool-4", productId: "cat", productTitle: "Wildfire & Reinsurance", tvl: 12500000, apy: 22.4, baseAaveApy: 4.2, riskPremiumApy: 18.2, utilization: 98, maxPayouts: 12250000 },
    { id: "pool-5", productId: "maritime", productTitle: "Maritime Solutions", tvl: 3600000, apy: 15.1, baseAaveApy: 4.2, riskPremiumApy: 10.9, utilization: 58, maxPayouts: 2088000 }
];

export function InvestDashboardClient() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();
    const { connectors, connectAsync } = useConnect();

    // Compliance State
    const [isKycVerified, setIsKycVerified] = useState(false);
    const [showKycModal, setShowKycModal] = useState(false);
    const [kycProgress, setKycProgress] = useState(0);

    // Deposit Form State
    const [selectedPool, setSelectedPool] = useState<PoolMetrics>(mockPools[0]);
    const [amount, setAmount] = useState("");
    const [actionType, setActionType] = useState<"deposit" | "withdraw">("deposit");

    // History State
    const publicClient = usePublicClient();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedKyc = localStorage.getItem('reflex_kyc_verified');
        if (storedKyc === 'true') setIsKycVerified(true);
    }, []);

    // Contract Reads
    const { data: totalAssets } = useReadContract({
        address: CONTRACTS.LP_POOL,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets',
    });

    const { data: totalMaxPayouts } = useReadContract({
        address: CONTRACTS.LP_POOL,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts',
    });

    const { data: userShares } = useReadContract({
        address: CONTRACTS.LP_POOL,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'lpShares',
        args: address ? [address] : undefined,
    });

    const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, CONTRACTS.LP_POOL] : undefined,
    });

    // Contract Writes
    const { writeContractAsync, data: hash, isPending: isSubmitting, error: writeError } = useWriteContract();
    const { isLoading: isWaiting, isSuccess: isTxSuccess, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash });

    const [isApproving, setIsApproving] = useState(false);
    const [isMinting, setIsMinting] = useState(false);

    const needsApproval = actionType === "deposit" && usdcAllowance !== undefined && amount && parseUnits(amount, 6) > (usdcAllowance as bigint);

    const handleTransaction = async () => {
        console.log("Initiating transaction...", { actionType, amount, isKycVerified, needsApproval });

        if (!isConnected) {
            toast.info("Connecting wallet...");
            if (connectors.length > 0) {
                try {
                    await connectAsync({ connector: connectors[0], chainId: avalancheFuji.id });
                    toast.success("Wallet connected!");
                    return;
                } catch (err: any) {
                    console.error("Connection failed", err);
                    return toast.error("Connection failed: " + (err.message || "Unknown error"));
                }
            }
            return toast.error("No wallet provider detected.");
        }

        // Compliance Check
        if (actionType === "deposit" && !isKycVerified) {
            console.log("KYC Required - opening modal");
            setShowKycModal(true);
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            return toast.error("Enter a valid amount");
        }

        const value = parseUnits(amount, 6);

        // Pre-flight balance check
        if (actionType === "deposit" && usdcBalance !== undefined && value > (usdcBalance as bigint)) {
            return toast.error(`Insufficient USDC balance. You need ${amount} USDC but only have ${formatUnits(usdcBalance as bigint, 6)} USDC.`);
        }

        try {
            const txConfig = {
                gas: BigInt(500000), // Override gas limit to force transaction through and see internal revert reason if any
            };

            if (actionType === "deposit") {
                if (needsApproval) {
                    setIsApproving(true);
                    console.log("Step 1: Approving USDC", value.toString());
                    toast.loading("Requesting USDC Approval...", { id: "tx" });
                    await writeContractAsync({
                        ...txConfig,
                        address: CONTRACTS.USDC,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [CONTRACTS.LP_POOL, value]
                    });
                } else {
                    console.log("Step 2: Depositing USDC", value.toString());
                    toast.loading("Confirming Deposit...", { id: "tx" });
                    await writeContractAsync({
                        ...txConfig,
                        address: CONTRACTS.LP_POOL,
                        abi: LIQUIDITY_POOL_ABI,
                        functionName: 'depositLiquidity',
                        args: [value]
                    });
                }
            } else {
                console.log("Withdrawing USDC", value.toString());
                toast.loading("Confirming Withdrawal...", { id: "tx" });
                await writeContractAsync({
                    ...txConfig,
                    address: CONTRACTS.LP_POOL,
                    abi: LIQUIDITY_POOL_ABI,
                    functionName: 'withdrawLiquidity',
                    args: [value]
                });
            }
        } catch (err: any) {
            console.error("Transaction Error:", err);
            const msg = err.message || "Transaction failed";
            if (msg.toLowerCase().includes("user rejected")) {
                toast.error("Transaction rejected by user", { id: "tx" });
            } else {
                toast.error(msg, { id: "tx" });
            }
            setIsApproving(false);
        }
    };

    const handleMint = async () => {
        if (!address) return;
        setIsMinting(true);
        toast.loading("Minting 1000 Test USDC...", { id: "mint" });
        try {
            await writeContractAsync({
                address: CONTRACTS.USDC,
                abi: ERC20_ABI,
                functionName: 'mint',
                args: [address, parseUnits("1000", 6)]
            });
            toast.success("Minting initiated! Refreshing balance...", { id: "mint" });
            setTimeout(() => refetchBalance(), 2000);
        } catch (err: any) {
            console.error("Mint Error:", err);
            const msg = err.message || "Minting failed";
            if (msg.toLowerCase().includes("gas limit") || msg.toLowerCase().includes("reverted")) {
                toast.error("Standard USDC doesn't support public minting. Please use the official Fuji Faucet: core.app/tools/faucet", { id: "mint", duration: 5000 });
                window.open("https://core.app/tools/faucet/", "_blank");
            } else {
                toast.error(msg, { id: "mint" });
            }
        } finally {
            setIsMinting(false);
        }
    };

    const runKyc = () => {
        console.log("Starting mock KYC flow...");
        setKycProgress(1);
        const interval = setInterval(() => {
            setKycProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setIsKycVerified(true);
                    localStorage.setItem('reflex_kyc_verified', 'true');
                    toast.success("Institutional KYC Verified");
                    setTimeout(() => setShowKycModal(false), 1000);
                    return 100;
                }
                return p + 10;
            });
        }, 100);
    };

    useEffect(() => {
        if (isTxSuccess) {
            if (isApproving) {
                console.log("Approval Success");
                toast.success("USDC Approved!", { id: "tx" });
                setIsApproving(false);
                refetchAllowance();
            } else {
                console.log("Transaction Success");
                toast.success(`${actionType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`, { id: "tx" });
                setAmount("");
            }
        }
        if (isTxError) {
            console.error("Receipt Error:", txError);
            toast.error("On-chain execution failed", { id: "tx" });
            setIsApproving(false);
        }
    }, [isTxSuccess, isTxError, txError, actionType, isApproving, refetchAllowance]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!address || !publicClient) return;
            setIsLoadingHistory(true);
            try {
                const [depositLogs, withdrawLogs] = await Promise.all([
                    publicClient.getLogs({
                        address: CONTRACTS.LP_POOL,
                        event: LIQUIDITY_POOL_ABI.find(x => x.type === 'event' && x.name === 'LiquidityDeposited') as any,
                        args: { provider: address },
                        fromBlock: BigInt(0)
                    }),
                    publicClient.getLogs({
                        address: CONTRACTS.LP_POOL,
                        event: LIQUIDITY_POOL_ABI.find(x => x.type === 'event' && x.name === 'LiquidityWithdrawn') as any,
                        args: { provider: address },
                        fromBlock: BigInt(0)
                    })
                ]);

                const allLogs = await Promise.all([
                    ...depositLogs.map(async (log: any) => {
                        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                        return {
                            id: log.transactionHash,
                            type: 'deposit',
                            amount: formatUnits(log.args.amount, 6),
                            timestamp: Number(block.timestamp) * 1000,
                            hash: log.transactionHash
                        };
                    }),
                    ...withdrawLogs.map(async (log: any) => {
                        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                        return {
                            id: log.transactionHash,
                            type: 'withdraw',
                            amount: formatUnits(log.args.amount, 6),
                            timestamp: Number(block.timestamp) * 1000,
                            hash: log.transactionHash
                        };
                    })
                ]);

                setHistory(allLogs.sort((a, b) => b.timestamp - a.timestamp));
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [address, publicClient, isTxSuccess]);

    if (!mounted) return null;

    const globalUtilization = totalAssets && totalMaxPayouts ? (Number(totalMaxPayouts) * 100) / Number(totalAssets) : 0;
    const formattedBalance = usdcBalance ? formatUnits(usdcBalance as bigint, 6) : "0";

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto pb-20">

            {/* KYC Modal */}
            {showKycModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-card border border-white/10 rounded-3xl p-8 max-w-md w-full space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <UserCheck className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-foreground">Institutional Onboarding</h2>
                            <p className="text-zinc-400 text-sm">To provide liquidity, regulatory standards require a one-time Institutional KYC verification via Reflex Compliance Services.</p>
                        </div>

                        {kycProgress > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                                    <span>Scanning Global Lists...</span>
                                    <span>{kycProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${kycProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={runKyc}
                                    className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-primary/90 transition-all shadow-[0_10px_30px_rgba(128,0,32,0.4)]"
                                >
                                    Verify Identity
                                </button>
                                <button
                                    onClick={() => setShowKycModal(false)}
                                    className="w-full py-4 bg-white/5 text-zinc-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:text-foreground transition-all underline underline-offset-4"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        )}

                        <p className="text-[9px] text-center text-zinc-600 font-bold uppercase tracking-tighter">Powered by Quadrata & Reflex Protocol</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Underwriting Terminal</h1>
                    <p className="text-sm text-zinc-400 mt-1">Provide USDC liquidity to back 100% collateralized institutional risk.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Your Liquidity Position</p>
                        <p className="text-xl font-black text-foreground">{userShares ? formatUnits(userShares as bigint, 6) : "0.00"} USDC</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className={`px-4 py-2 border rounded-xl flex items-center gap-2 transition-all duration-500 ${isKycVerified ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                        {isKycVerified ? (
                            <>
                                <Verified className="w-5 h-5 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">KYC VERIFIED</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5 text-orange-500" />
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">KYC REQUIRED</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left: Pool Overview Grid */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">Risk Distributions</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Global Protocol Solvency:</span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">100.00%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockPools.map(pool => {
                            const isSelected = selectedPool.id === pool.id;
                            const utilization = pool.id === "pool-4" ? 98 : (globalUtilization > 0 ? globalUtilization : pool.utilization);
                            const isCapped = utilization >= 95;

                            return (
                                <div
                                    key={pool.id}
                                    onClick={() => setSelectedPool(pool)}
                                    className={`bg-card border rounded-2xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group
                                        ${isSelected ? 'border-primary ring-1 ring-primary/50 bg-primary/5' : 'border-border hover:border-zinc-700'}`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <h3 className="font-black text-foreground group-hover:text-primary transition-colors">{pool.productTitle}</h3>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-tighter">
                                                    {pool.apy}% Blended Yield
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-zinc-500'}`}>
                                            <Layers className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Active TVL</p>
                                                <p className="font-bold text-foreground text-base">
                                                    {pool.id === "pool-1" && totalAssets ? `$${(Number(totalAssets) / 1e6).toFixed(2)}M` : `$${(pool.tvl / 1e6).toFixed(2)}M`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Cap Exposure</p>
                                                <p className="font-bold text-zinc-300 text-sm">
                                                    {pool.id === "pool-1" && totalMaxPayouts ? `$${(Number(totalMaxPayouts) / 1e6).toFixed(2)}M` : `$${(pool.maxPayouts / 1e6).toFixed(2)}M`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-zinc-500 font-bold uppercase tracking-wider">Utilization</span>
                                                <span className={`font-black ${isCapped ? "text-orange-500" : "text-emerald-500"}`}>
                                                    {utilization.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isCapped ? 'bg-orange-500' : 'bg-primary'}`}
                                                    style={{ width: `${utilization}%` }}
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
                <div className="xl:col-span-1">
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
                                        <span className="text-sm font-black text-foreground">{selectedPool.productTitle}</span>
                                    </div>
                                    <span className="text-xs text-primary font-black bg-primary/10 px-2 py-1 rounded">{selectedPool.apy}% APY</span>
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
                            </div>

                            <button
                                onClick={handleTransaction}
                                disabled={isSubmitting || isWaiting}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-500 relative flex items-center justify-center gap-2
                                    ${isTxSuccess ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]' :
                                        (isSubmitting || isWaiting) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' :
                                            'bg-primary hover:bg-primary/90 text-white shadow-[0_10px_20px_rgba(128,0,32,0.3)]'}
                                    disabled:opacity-50`}
                            >
                                {isWaiting ? <RefreshCcw className="w-4 h-4 animate-spin" /> :
                                    isSubmitting ? (isApproving ? 'Approving...' : 'Confirming...') :
                                        isTxSuccess ? <><CheckCircle2 className="w-5 h-5" /> SUCCEEDED</> :
                                            !isConnected ? <><Layers className="w-4 h-4" /> CONNECT WALLET</> :
                                                (!isKycVerified && actionType === 'deposit') ? <><Lock className="w-4 h-4" /> VERIFY IDENTITY</> :
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
                                <span className="text-emerald-400 font-mono">+{selectedPool.riskPremiumApy}%</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
