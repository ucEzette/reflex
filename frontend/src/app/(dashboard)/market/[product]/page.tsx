"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { generateMarketProducts } from '@/lib/mockState';
import { MarketProduct } from '@/types/market';
import { Plane, CloudRain, Zap, Flame, Anchor, ArrowLeft, HelpCircle, Activity, Globe, Calendar, Wind, RefreshCcw, CheckCircle2, Clock, Radio, Satellite, Shield, AlertTriangle } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { GENERIC_PRODUCT_ABI, PRODUCT_ABI } from '@/lib/enterprise_abis';
import { parseUnits } from 'viem';
import { toast } from 'sonner';

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
    'prod-flight': 'flight',
    'prod-agri': 'agri',
    'prod-energy': 'energy',
    'prod-cat': 'cat',
    'prod-maritime': 'maritime'
};

const PRODUCT_BG_MAP: Record<string, string> = {
    'prod-flight': '/travel.jpg',
    'prod-agri': '/agriculture.jpg',
    'prod-energy': '/energy.jpg',
    'prod-cat': '/catastrophe.jpg',
    'prod-maritime': '/maritime.jpg'
};

// Fallback risk rates used only when oracle data is unavailable
const DEFAULT_RISK_RATES: Record<string, number> = {
    'prod-flight': 0.05,
    'prod-agri': 0.10,
    'prod-energy': 0.08,
    'prod-cat': 0.02,
    'prod-maritime': 0.06
};

// Insurance loading factor: multiplier on expected loss to ensure underwriter profitability
// Accounts for capital reserves, adverse selection, admin costs, and profit margin
const INSURANCE_LOADING_FACTOR = 2.5;

export default function ProductDynamicPage({ params }: { params: { product: string } }) {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [product, setProduct] = useState<MarketProduct | null>(null);

    // Form states
    const [payoutInput, setPayoutInput] = useState("1000");
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
        if (!product || !oracleData) return { nDelayed: 5, nTotal: 100, riskRate: DEFAULT_RISK_RATES[product?.id || 'prod-flight'] || 0.05 };

        if (product.id === 'prod-flight' && oracleData.riskStats) {
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
    const flightValid = product?.id === 'prod-flight' ? (oracleData?.isValid !== false) : true;
    const flightInsurable = product?.id === 'prod-flight' ? (oracleData?.isInsurable !== false && flightValid) : true;
    const flightStatusLabel = oracleData?.flightStatusLabel || 'Scheduled';
    const flightAutoDuration = oracleData?.autoDurationSeconds || null;
    const flightScheduledArrival = oracleData?.scheduledArrival || null;

    // For flights, use auto-duration; for others, use manual selection
    const effectiveDuration = (product?.id === 'prod-flight' && flightAutoDuration)
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
            if (product.id === 'prod-flight' && flightId) queryParams.set('flightId', flightId);
            if (product.id === 'prod-agri' && zone) queryParams.set('zone', zone);
            if (product.id === 'prod-energy') {
                if (coordinates.lat) queryParams.set('lat', coordinates.lat);
                if (coordinates.lon) queryParams.set('lon', coordinates.lon);
            }
            if (product.id === 'prod-cat') {
                if (coordinates.lat) queryParams.set('lat', coordinates.lat);
                if (coordinates.lon) queryParams.set('lon', coordinates.lon);
            }
            if (product.id === 'prod-maritime') {
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
    const targetContract = product?.id === 'prod-flight' ? CONTRACTS.TRAVEL :
        product?.id === 'prod-agri' ? CONTRACTS.AGRI :
            product?.id === 'prod-energy' ? CONTRACTS.ENERGY :
                product?.id === 'prod-cat' ? CONTRACTS.CATASTROPHE :
                    CONTRACTS.MARITIME;

    // Calculate expected risk base from oracle-derived dynamic risk
    const expectedRiskBase = parseUnits(
        (parseFloat(payoutInput || "0") * dynamicRisk.riskRate).toFixed(6),
        6
    );

    const { data: premiumQuote, isFetching: isQuoting } = useReadContract({
        address: targetContract,
        abi: product?.id === 'prod-flight' ? PRODUCT_ABI : GENERIC_PRODUCT_ABI,
        functionName: 'quotePremium',
        args: product?.id === 'prod-flight'
            ? [BigInt(dynamicRisk.nDelayed), BigInt(dynamicRisk.nTotal), parseUnits(payoutInput || "0", 6)]
            : [expectedRiskBase],
        query: { enabled: !!product && !!payoutInput && parseFloat(payoutInput) > 0 && flightInsurable && flightValid }
    });

    const { data: activePolicyCount } = useReadContract({
        address: targetContract,
        abi: GENERIC_PRODUCT_ABI,
        functionName: 'getActivePolicyCount',
        query: { enabled: !!product && mounted }
    });

    const { writeContract, data: hash, isPending: isSubmitting } = useWriteContract();
    const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash });

    const handlePurchase = async () => {
        if (!isConnected) return toast.error("Connect wallet first");
        try {
            if (product?.id === 'prod-flight') {
                if (!flightInsurable) return toast.error("This flight cannot be insured — it has already departed or landed.");
                writeContract({
                    address: CONTRACTS.TRAVEL,
                    abi: PRODUCT_ABI,
                    functionName: 'purchasePolicy',
                    args: [flightId || "REF-001", parseUnits(payoutInput, 6), BigInt(dynamicRisk.nDelayed), BigInt(dynamicRisk.nTotal), BigInt(effectiveDuration), "0x" as `0x${string}`]
                });
            } else {
                writeContract({
                    address: targetContract,
                    abi: GENERIC_PRODUCT_ABI,
                    functionName: 'purchasePolicy',
                    args: [zone || coordinates.lat || "ZONE-A", parseUnits(payoutInput, 6), BigInt(100), BigInt(50), expectedRiskBase, BigInt(effectiveDuration)]
                });
            }
        } catch (err: any) {
            toast.error(err.message || "Execution failed");
        }
    };

    useEffect(() => {
        if (hash) toast.success("Policy broadcasted!");
    }, [hash]);

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Configuration */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="text-lg font-bold text-foreground">Configure Parameters</h3>

                            {product.id === 'prod-flight' && (
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
                            {product.id === 'prod-flight' ? (
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
                            {product.id === 'prod-flight' && oracleData && !flightValid && (
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
                            {product.id === 'prod-flight' && flightValid && !flightInsurable && (
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
                            ) : (product.id === 'prod-flight' && !flightInsurable) ? null : premiumQuote ? (
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
                                                {product.id === 'prod-flight' && flightScheduledArrival
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

                        <button
                            onClick={handlePurchase}
                            disabled={!premiumQuote || isSubmitting || isWaiting || (product.id === 'prod-flight' && !flightInsurable)}
                            className={`w-full mt-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2
                            ${isWaiting ? 'bg-zinc-700 text-zinc-400' : (product.id === 'prod-flight' && !flightInsurable) ? 'bg-red-900/30 text-red-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isWaiting ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Confirming...</> :
                                isSubmitting ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Sourcing...</> :
                                    (product.id === 'prod-flight' && !flightInsurable) ? <>Flight Not Insurable</> :
                                        <><CheckCircle2 className="w-4 h-4" /> Finalize Policy</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
