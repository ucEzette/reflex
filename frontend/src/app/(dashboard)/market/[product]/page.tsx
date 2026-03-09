"use client";

export const dynamic = "force-dynamic";


import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { generateMarketProducts } from '../../../../lib/mockState';
import { MarketProduct } from '../../../../types/market';
import { Plane, CloudRain, Zap, Flame, Anchor, ArrowLeft, HelpCircle, Activity, Globe, Calendar, RefreshCcw, CheckCircle2, Clock, Radio, Satellite, Shield, AlertTriangle } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";
import { CONTRACTS, PRODUCT_ABI, GENERIC_PRODUCT_ABI, ERC20_ABI } from "@/lib/contracts";
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import type { ISuccessResult } from '@worldcoin/idkit';

const IconMap: Record<string, React.ElementType> = {
    Plane, CloudRain, Zap, Flame, Anchor
};

const DURATION_OPTIONS = [
    { label: '7 Days', value: 7 * 86400, short: '7d' },
    { label: '14 Days', value: 14 * 86400, short: '14d' },
    { label: '30 Days', value: 30 * 86400, short: '30d' },
    { label: '90 Days', value: 90 * 86400, short: '90d' },
];

const PRODUCT_ORACLE_MAP: Record<string, string> = {
    'flight': 'flight',
    'agri': 'agri',
    'energy': 'energy',
    'cat': 'cat',
    'maritime': 'maritime'
};

const PRODUCT_BG_MAP: Record<string, string> = {
    'flight': '/travel.jpg',
    'agri': '/agriculture.jpg',
    'energy': '/energy.jpg',
    'cat': '/catastrophe.jpg',
    'maritime': '/maritime.jpg'
};

// Fallback risk rates used only when oracle data is unavailable
const DEFAULT_RISK_RATES: Record<string, number> = {
    'flight': 0.05,
    'agri': 0.10,
    'energy': 0.08,
    'cat': 0.02,
    'maritime': 0.06
};

// Insurance loading factor: multiplier on expected loss to ensure underwriter profitability
// Accounts for capital reserves, adverse selection, admin costs, and profit margin
const INSURANCE_LOADING_FACTOR = 2.5;

export default function ProductMarketPage({ params }: { params: { product: string } }) {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [product, setProduct] = useState<MarketProduct | null>(null);

    // World ID / Hackathon States
    const [worldIDProof, setWorldIDProof] = useState<ISuccessResult | null>(null);
    const [isHumanVerified, setIsHumanVerified] = useState(false);

    const handleWorldIDSuccess = (result: ISuccessResult) => {
        setWorldIDProof(result);
        setIsHumanVerified(true);
        toast.success("Humanness verified via World ID");
    };

    // Form states
    const [payoutInput, setPayoutInput] = useState("");
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
    const [zone, setZone] = useState('');
    const [flightId, setFlightId] = useState('');
    const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[2]); // default 30d

    // Oracle Data & Dynamic Risk
    const [oracleData, setOracleData] = useState<any>(null);
    const [isLoadingOracle, setIsLoadingOracle] = useState(false);

    // Derive dynamic risk from oracle data
    const dynamicRisk = React.useMemo(() => {
        if (!product || !oracleData) return { nDelayed: 5, nTotal: 100, riskRate: DEFAULT_RISK_RATES[product?.id || 'flight'] || 0.05 };

        if (product.id === 'flight' && oracleData.riskStats) {
            // Apply insurance loading factor to nDelayed for actuarial soundness
            const rawDelayed = oracleData.riskStats.nDelayed || 5;
            const loadedDelayed = Math.ceil(rawDelayed * INSURANCE_LOADING_FACTOR);
            const nTotal = oracleData.riskStats.nTotal || 100;
            return {
                nDelayed: Math.min(loadedDelayed, nTotal), // cap at nTotal
                nTotal,
                riskRate: oracleData.riskStats.probability || 0.05
            };
        }

        if (oracleData.riskProbability !== undefined) {
            return {
                nDelayed: 0,
                nTotal: 0,
                riskRate: oracleData.riskProbability
            };
        }

        return { nDelayed: 5, nTotal: 100, riskRate: DEFAULT_RISK_RATES[product.id] || 0.05 };
    }, [product, oracleData]);

    // Flight-specific: validity, insurability check and auto-duration
    const flightValid = product?.id === 'flight' ? (oracleData?.isValid !== false) : true;
    const flightInsurable = product?.id === 'flight' ? (oracleData?.isInsurable !== false && flightValid) : true;
    const flightStatusLabel = oracleData?.flightStatusLabel || 'Scheduled';
    const flightAutoDuration = oracleData?.autoDurationSeconds || null;
    const flightScheduledArrival = oracleData?.scheduledArrival || null;

    // For flights, use auto-duration; for others, use manual selection
    const effectiveDuration = (product?.id === 'flight' && flightAutoDuration)
        ? flightAutoDuration
        : selectedDuration.value;

    useEffect(() => {
        setMounted(true);
        const data = generateMarketProducts().find(p => p.id === params.product);
        if (data) {
            setProduct(data as unknown as MarketProduct);
        }
    }, [params.product]);

    // Fetch oracle data when product loads
    useEffect(() => {
        if (!product) return;
        fetchOracleData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product, flightId, zone, coordinates.lat, coordinates.lon]);

    const fetchOracleData = async () => {
        if (!product) return;
        const oracleKey = PRODUCT_ORACLE_MAP[product.id];
        if (!oracleKey) return;

        setIsLoadingOracle(true);
        try {
            const queryParams = new URLSearchParams();
            if (product.id === 'flight' && flightId) queryParams.set('flightId', flightId);
            if (product.id === 'agri' && zone) queryParams.set('zone', zone);
            if (product.id === 'energy') {
                if (coordinates.lat) queryParams.set('lat', coordinates.lat);
                if (coordinates.lon) queryParams.set('lon', coordinates.lon);
            }
            if (product.id === 'cat') {
                if (coordinates.lat) queryParams.set('lat', coordinates.lat);
                if (coordinates.lon) queryParams.set('lon', coordinates.lon);
            }
            if (product.id === 'maritime') {
                if (coordinates.lat) queryParams.set('lat', coordinates.lat);
                if (coordinates.lon) queryParams.set('lon', coordinates.lon);
            }

            const res = await fetch(`/api/oracle/${oracleKey}?${queryParams.toString()}`);
            const data = await res.json();
            setOracleData(data);
        } catch (err) {
            setOracleData({ status: 'error', message: 'Failed to fetch oracle data' });
        } finally {
            setIsLoadingOracle(false);
        }
    };

    // Contract Interactions
    const targetContractAddress = product?.id === 'flight' ? CONTRACTS.TRAVEL :
        product?.id === 'agri' ? CONTRACTS.AGRI :
            product?.id === 'energy' ? CONTRACTS.ENERGY :
                product?.id === 'cat' ? CONTRACTS.CATASTROPHE :
                    CONTRACTS.MARITIME;

    // Calculate expected risk base from oracle-derived dynamic risk
    const expectedRiskBase = parseUnits(
        (parseFloat(payoutInput || "0") * dynamicRisk.riskRate).toFixed(6),
        6
    );

    const { data: premiumQuote, isLoading: isQuoting } = useReadContract({
        address: targetContractAddress as `0x${string}`,
        abi: product?.id === 'flight' ? PRODUCT_ABI : GENERIC_PRODUCT_ABI,
        functionName: "quotePremium",
        args: product?.id === 'flight'
            ? [BigInt(dynamicRisk.nDelayed), BigInt(dynamicRisk.nTotal), parseUnits(payoutInput || "0", 6)] as const
            : [expectedRiskBase] as const,
        query: { enabled: mounted && !!targetContractAddress && (product?.id === 'flight' ? !!flightId : !!payoutInput) }
    });

    const { data: activePolicyCount } = useReadContract({
        address: targetContractAddress as `0x${string}`,
        abi: product?.id === 'flight' ? PRODUCT_ABI : GENERIC_PRODUCT_ABI,
        functionName: "getActivePolicyCount",
        query: { enabled: mounted && !!targetContractAddress }
    });

    const { writeContract: purchasePolicy, data: hash, isPending: isTxPending, error: purchaseError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({ hash });

    // USDC Allowance Check
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address as `0x${string}`, targetContractAddress as `0x${string}`],
        query: { enabled: !!address && !!targetContractAddress }
    });

    const { writeContract: approveUSDC, isPending: isApprovePending, data: approveHash } = useWriteContract();
    const { isLoading: isConfirmingApprove, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    useEffect(() => {
        if (isApproveSuccess) {
            toast.success("USDC Approved!");
            refetchAllowance();
        }
    }, [isApproveSuccess, refetchAllowance]);

    useEffect(() => {
        if (purchaseError) {
            console.error("Purchase Error:", purchaseError);
            toast.error(purchaseError.message || "Purchase failed");
        }
    }, [purchaseError]);

    const needsApproval = allowance !== undefined && premiumQuote !== undefined && BigInt(allowance) < BigInt(premiumQuote);

    const handlePurchase = async () => {
        console.log("Handle Purchase Triggered");
        if (!isConnected || !address) {
            console.log("Wallet not connected");
            return toast.error("Connect wallet to proceed");
        }
        if (!isHumanVerified) {
            console.log("Not human verified");
            return toast.error("Please verify your humanness with World ID first");
        }

        if (needsApproval) {
            console.log("Requesting USDC Approval for:", targetContractAddress);
            approveUSDC({
                address: CONTRACTS.USDC as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [targetContractAddress as `0x${string}`, premiumQuote as bigint]
            });
            return;
        }

        try {
            const args = product?.id === 'flight'
                ? [flightId || "REF-001", parseUnits(payoutInput, 6), BigInt(dynamicRisk.nDelayed), BigInt(dynamicRisk.nTotal), BigInt(effectiveDuration), "0x" as `0x${string}`]
                : [zone || coordinates.lat || "ZONE-A", parseUnits(payoutInput, 6), BigInt(100), BigInt(50), expectedRiskBase, BigInt(effectiveDuration)];

            console.log("Executing purchasePolicy on:", targetContractAddress);
            console.log("Arguments:", args);

            purchasePolicy({
                address: targetContractAddress as `0x${string}`,
                abi: product?.id === 'flight' ? PRODUCT_ABI : GENERIC_PRODUCT_ABI,
                functionName: "purchasePolicy",
                args: product?.id === 'flight'
                    ? [...args as any] // already includes signature placeholder or real sig
                    : [...args as any] // Generic takes 6 arguments, no signature
            });

        } catch (err: any) {
            console.error("Handle Purchase Try/Catch Error:", err);
            toast.error(err.message || "Execution failed");
        }
    };

    useEffect(() => {
        if (isPurchaseSuccess) {
            toast.success("Policy secured successfully!");
        }
    }, [isPurchaseSuccess]);

    const [showCalcInfo, setShowCalcInfo] = useState(false);
    const calc = (product as any)?.calculationMethod;

    if (!mounted) return null;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-foreground z-10 relative">Product not found.</div>;

    const Icon = IconMap[product.iconType] || Plane;
    const expiryDate = new Date(Date.now() + selectedDuration.value * 1000);
    const bgImage = PRODUCT_BG_MAP[product.id] || '/travel.jpg';

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            {/* 3D Verlet Background Layer */}
            <div className="fixed inset-0 z-0 flex items-center justify-center bg-background-dark overflow-hidden pointer-events-none">
                <Image
                    src={bgImage}
                    alt={`${product.title} background`}
                    layout="fill"
                    objectFit="cover"
                    quality={100}
                    priority
                    className="opacity-40 mix-blend-screen scale-105"
                />
                {/* Vignette & Gradient Overlays for smooth blending */}
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/20 via-transparent to-background-dark/90" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark/60 via-transparent to-background-dark/60" />
            </div>

            {/* Content Layer (Glassmorphism) */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 pb-32">
                <button onClick={() => router.push('/market')} className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full border border-white/5 w-fit">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Market
                </button>

                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground">{product.title}</h1>
                        <p className="text-sm text-zinc-400 mt-1">{product.description}</p>
                    </div>
                </div>

                {isPurchaseSuccess ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto shadow-2xl shadow-emerald-500/10">
                        <div className="flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-foreground">Policy Secured!</h2>
                            <p className="text-zinc-400">
                                Your parametric protection for <span className="text-white font-bold">{flightId || zone || "your asset"}</span> is now active on the Avalanche Fuji network.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Coverage</p>
                                <p className="text-lg font-black text-emerald-400">${Number(payoutInput).toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Status</p>
                                <p className="text-lg font-black text-sky-400">Active ✓</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <a
                                href={`https://testnet.snowscan.xyz/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 rounded-xl bg-sky-500 text-black font-black uppercase tracking-widest text-sm hover:bg-sky-400 transition-all flex items-center justify-center gap-2"
                            >
                                <Globe className="w-4 h-4" /> View Transaction on Snowscan
                            </a>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
                            >
                                Go to Portfolio
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5">
                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Powered by Chainlink DON & Avalanche CCIP</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Configuration */}
                        <div className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                                <h3 className="text-lg font-bold text-foreground">Configure Parameters</h3>
                                {/* ... existing form content ... */}

                                {product.id === 'flight' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Flight Number</label>
                                            <input type="text" placeholder="EK202" value={flightId} onChange={e => setFlightId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-foreground text-sm focus:border-primary outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Departure Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-foreground text-sm focus:border-primary outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Arrival Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-foreground text-sm focus:border-primary outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {product.id === 'prod-cat' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Latitude</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <input type="text" placeholder="34.0522" value={coordinates.lat} onChange={e => setCoordinates({ ...coordinates, lat: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-foreground text-sm focus:border-primary outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Longitude</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <input type="text" placeholder="-118.2437" value={coordinates.lon} onChange={e => setCoordinates({ ...coordinates, lon: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-foreground text-sm focus:border-primary outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(product.id === 'prod-agri' || product.id === 'prod-energy' || product.id === 'prod-maritime') && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Target Zone / Port</label>
                                        <input type="text" placeholder={product.inputPlaceholder} value={zone} onChange={e => setZone(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-foreground text-sm focus:border-primary outline-none" />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex justify-between">Requested Max Payout (USDC)</label>
                                    <input type="number" value={payoutInput} onChange={e => setPayoutInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-foreground focus:border-primary outline-none" />
                                </div>

                                {/* Duration Selector — hidden for flights (auto-computed from schedule) */}
                                {product.id === 'flight' ? (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Policy Duration (Auto)
                                        </label>
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                            {flightScheduledArrival ? (
                                                <>
                                                    <p className="text-sm font-bold text-emerald-400">
                                                        Expires on arrival + 6h buffer
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 mt-1">
                                                        Scheduled Arrival: {new Date(flightScheduledArrival).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Auto-settled by Chainlink Keepers
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-xs text-zinc-400">Enter a flight number to auto-compute duration</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Policy Duration
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {DURATION_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setSelectedDuration(opt)}
                                                    className={`py-2.5 rounded-lg text-sm font-bold transition-all ${selectedDuration.value === opt.value
                                                        ? 'bg-primary text-white shadow-[0_0_12px_rgba(128,0,32,0.3)]'
                                                        : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-primary/50 hover:text-foreground'}`}
                                                >
                                                    {opt.short}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1">
                                            Expires: {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Auto-settled by Chainlink Keepers
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Oracle Data Panel */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Satellite className="w-4 h-4 text-cyan-500" /> Live Oracle Feed
                                    </h3>
                                    <button onClick={fetchOracleData} className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                                        <RefreshCcw className={`w-3 h-3 ${isLoadingOracle ? 'animate-spin' : ''}`} /> Refresh
                                    </button>
                                </div>
                                {isLoadingOracle ? (
                                    <div className="flex items-center justify-center py-6">
                                        <RefreshCcw className="w-5 h-5 text-primary animate-spin" />
                                    </div>
                                ) : oracleData?.status === 'ok' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Connected — {oracleData.source}</span>
                                        </div>
                                        {Object.entries(oracleData.data || {}).map(([key, value]: [string, any]) => {
                                            if (typeof value === 'object') return null; // skip nested objects
                                            return (
                                                <div key={key} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="text-xs font-medium text-foreground">{String(value)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : oracleData?.status === 'no_key' ? (
                                    <div className="py-4 text-center">
                                        <Shield className="w-6 h-6 text-amber-500 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs text-amber-500">{oracleData.message}</p>
                                        <p className="text-[10px] text-zinc-600 mt-1">Add API key to .env.local to enable</p>
                                    </div>
                                ) : (
                                    <div className="py-4 text-center">
                                        <Activity className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                                        <p className="text-xs text-zinc-500">Enter parameters to fetch oracle data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Quote & Purchase */}
                        <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between relative">
                            <div>
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                    <h3 className="text-lg font-bold text-foreground">Underwriting Quote</h3>
                                    <button onClick={() => setShowCalcInfo(!showCalcInfo)}><HelpCircle className={`w-5 h-5 cursor-pointer transition-colors ${showCalcInfo ? 'text-primary' : 'text-zinc-500 hover:text-white'}`} /></button>
                                </div>

                                {showCalcInfo && calc && (
                                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-6 space-y-3 text-xs">
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1.5">Pricing Formula</span>
                                            <code className="text-[11px] text-emerald-400 font-mono bg-black/40 px-2.5 py-1.5 rounded block leading-relaxed">{calc.formula}</code>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1.5">Variables</span>
                                            <ul className="space-y-1.5">
                                                {calc.variables.map((v: string, i: number) => (
                                                    <li key={i} className="text-[10px] text-zinc-400 leading-relaxed flex gap-1.5">
                                                        <span className="text-primary mt-0.5 shrink-0">•</span> {v}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="border-t border-white/5 pt-2.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/80 block mb-1">Example</span>
                                            <span className="text-[10px] text-zinc-300 leading-relaxed">{calc.example}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Flight Not Found Banner */}
                                {product.id === 'flight' && oracleData && !flightValid && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-6 text-center space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                                            <span className="text-lg font-black text-amber-400">Flight Not Found</span>
                                        </div>
                                        <p className="text-sm text-zinc-400">
                                            {oracleData.message || `No flights found for this identifier.`}
                                        </p>
                                        <p className="text-xs text-zinc-500 max-w-[280px] mx-auto">
                                            Please verify the flight number and try again. Example: <strong>UA532</strong>, <strong>EK202</strong>
                                        </p>
                                    </div>
                                )}

                                {/* Flight Status Gating Banner */}
                                {product.id === 'flight' && flightValid && !flightInsurable && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-6 text-center space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <Plane className="w-5 h-5 text-red-400" />
                                            <span className="text-lg font-black text-red-400">Flight Not Insurable</span>
                                        </div>
                                        <p className="text-sm text-zinc-400">
                                            Status: <span className="font-bold text-red-300">{flightStatusLabel}</span>
                                        </p>
                                        <p className="text-xs text-zinc-500 max-w-[280px] mx-auto">
                                            Insurance can only be purchased for flights with a <strong>Scheduled</strong> status. This flight has already departed, arrived, or been cancelled.
                                        </p>
                                    </div>
                                )}

                                {isQuoting ? (
                                    <div className="h-48 flex flex-col items-center justify-center space-y-4">
                                        <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Sourcing Premium...</p>
                                    </div>
                                ) : (product.id === 'flight' && !flightInsurable) ? null : premiumQuote ? (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Required Premium (USDC)</p>
                                            <span className="text-6xl font-black text-foreground">${(Number(premiumQuote) / 1e6).toFixed(2)}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Max Coverage</p>
                                                <p className="text-sm font-bold text-emerald-400">${Number(payoutInput).toLocaleString()}</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Duration</p>
                                                <p className="text-sm font-bold text-foreground">
                                                    {product.id === 'flight' && flightScheduledArrival
                                                        ? `Until ${new Date(flightScheduledArrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} + 6h`
                                                        : selectedDuration.label}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Oracle Route</p>
                                                <p className="text-sm font-bold text-foreground">Chainlink DON</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Auto-Settlement</p>
                                                <p className="text-sm font-bold text-cyan-400">Keepers ✓</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-48 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                                        <Activity className="w-12 h-12 opacity-20" />
                                        <p className="text-sm max-w-[200px] text-center">Configure parameters to generate a live hazard quote</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* World ID Verification Widget */}
                                {!isHumanVerified ? (
                                    <div className="space-y-3">
                                        <IDKitWidget
                                            app_id="app_staging_reflex"
                                            action="purchase_policy"
                                            onSuccess={handleWorldIDSuccess}
                                            verification_level={VerificationLevel.Device}
                                        >
                                            {({ open }: { open: () => void }) => (
                                                <button
                                                    onClick={open}
                                                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-all font-bold text-sm text-white shadow-xl group"
                                                >
                                                    <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full p-1 group-hover:scale-110 transition-transform">
                                                        <Image src="/world-id.svg" alt="World ID" width={16} height={16} />
                                                    </div>
                                                    Verify Humanness with World ID
                                                </button>
                                            )}
                                        </IDKitWidget>

                                        {/* Testnet Bypass */}
                                        <button
                                            onClick={() => {
                                                setIsHumanVerified(true);
                                                toast.info("Testnet Bypass: Humanness verified manually");
                                            }}
                                            className="w-full text-[10px] text-zinc-600 hover:text-primary transition-colors uppercase tracking-[0.2em] font-black py-1"
                                        >
                                            [ Dev: Bypass Verification ]
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                                        <CheckCircle2 className="w-4 h-4" /> Humanness Verified
                                    </div>
                                )}

                                <button
                                    onClick={handlePurchase}
                                    disabled={!premiumQuote || isConfirming || isTxPending || isApprovePending || isConfirmingApprove || (product.id === 'flight' && !flightInsurable)}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2
                                ${(isConfirming || isTxPending || isConfirmingApprove || isApprovePending) ? 'bg-zinc-700 text-zinc-400' : (product.id === 'flight' && !flightInsurable) ? 'bg-red-900/30 text-red-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {(isConfirming || isTxPending || isConfirmingApprove || isApprovePending) ? <><RefreshCcw className="w-4 h-4 animate-spin" /> {isApprovePending || isConfirmingApprove ? "Approving..." : "Confirming..."}</> :
                                        (product.id === 'flight' && !flightInsurable) ? <>Flight Not Insurable</> :
                                            needsApproval ? <><CheckCircle2 className="w-4 h-4" /> Approve USDC for Policy</> :
                                                <><CheckCircle2 className="w-4 h-4" /> Finalize Policy (Wagmi Optimized)</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
