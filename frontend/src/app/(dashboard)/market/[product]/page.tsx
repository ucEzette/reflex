"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ALL_MARKETS } from "@/lib/market-data";
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  CONTRACTS,
  ESCROW_ABI,
  ERC20_ABI,
  LP_POOL_ABI,
  PRODUCT_ABI,
  GENERIC_PRODUCT_ABI,
  TRAVEL_ABI,
  POLICY_PREMIUM,
  POLICY_PAYOUT,
  POLICY_DURATION_HOURS,
} from "@/lib/contracts";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { useSponsoredTx } from "@/hooks/useSponsoredTx";
import { 
  Shield, 
  Zap, 
  Activity, 
  ArrowLeft, 
  Info, 
  ChevronRight, 
  Search, 
  Calendar, 
  Plane, 
  Globe, 
  Droplets, 
  Thermometer, 
  Navigation, 
  Anchor,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  History,
  Terminal,
  ChevronDown
} from "lucide-react";

/* --- helpers --- */
const POOL_MAP: Record<string, `0x${string}`> = {
  flight: CONTRACTS.LP_TRAVEL,
  agri: CONTRACTS.LP_AGRI,
  energy: CONTRACTS.LP_ENERGY,
  cat: CONTRACTS.LP_CAT,
  maritime: CONTRACTS.LP_MARITIME,
};

const PRODUCT_MAP: Record<string, `0x${string}`> = {
  flight: CONTRACTS.TRAVEL,
  agri: CONTRACTS.AGRI,
  energy: CONTRACTS.ENERGY,
  cat: CONTRACTS.CATASTROPHE,
  maritime: CONTRACTS.MARITIME,
};

const categoryToABI = (cat: string) =>
  cat === "travel" ? PRODUCT_ABI : GENERIC_PRODUCT_ABI;

const PROTOCOL_MARGIN_BPS = 500;
const ORIGINATION_FEE_BPS = 300;

type FlightData = {
  airline: string;
  airlineIata: string;
  flightNumber: string;
  flightDate: string;
  status: string;
  aircraft: string | null;
  aircraftType: string | null;
  departure: {
    airport: string;
    iata: string;
    terminal: string | null;
    gate: string | null;
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
    delay: number;
    timezone: string;
  };
  arrival: {
    airport: string;
    iata: string;
    terminal: string | null;
    gate: string | null;
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
    delay: number;
    timezone: string;
  };
  isDelayedOver2Hours: boolean;
};

/* --- Tooltip component (Premium) --- */
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-[#15151A] text-[11px] text-zinc-400 leading-relaxed p-4 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-200">
           <div className="text-[#D31027] font-black uppercase tracking-widest mb-2 text-[9px]">Market Intelligence</div>
          {text}
        </span>
      )}
    </span>
  );
}

/* --- Main --- */
export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = params?.product as string;
  const market = useMemo(
    () => ALL_MARKETS.find((m) => m.id === marketId),
    [marketId]
  );

  const { buyProtectionPolicy: executeSponsoredBuy, isExecuting: isSponsoring } = useSponsoredTx();
  const { authenticated, login } = usePrivy();

  const { address, isConnected } = useAccount();
  const { data: usdtBalance } = useBalance({
    address,
    token: CONTRACTS.USDT,
  });

  /* --- form state --- */
  const [apiTarget, setApiTarget] = useState("");
  const [customPayout, setCustomPayout] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  /* Market-specific extra fields */
  const [strikeValue, setStrikeValue] = useState("");
  const [exitValue, setExitValue] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [tickValue, setTickValue] = useState("10");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  /* Flight-specific state */
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState("");

  const isFlightMarket = market?.category === "travel";

  useEffect(() => setMounted(true), []);

  /* -- Fetch flight details -- */
  const fetchFlightDetails = useCallback(async () => {
    if (!flightNumber.trim()) {
      setFlightError("Enter a flight number");
      return;
    }
    if (!flightDate) {
      setFlightError("Select a flight date");
      return;
    }

    setFlightLoading(true);
    setFlightError("");
    setFlightData(null);

    try {
      const cleanFlight = flightNumber.replace(/\s+/g, "").toUpperCase();
      const res = await fetch(
        `/api/flight?flight_iata=${cleanFlight}&flight_date=${flightDate}`
      );
      const data = await res.json();

      if (!res.ok) {
        setFlightError(data.error || "Flight not found");
        return;
      }

      setFlightData(data);
      setApiTarget(cleanFlight);

      // Auto-calculate coverage duration from scheduled arrival to end-of-day
      if (data.arrival?.scheduled) {
        const arrivalTime = new Date(data.arrival.scheduled);
        // Set coverage to expire at end of arrival day (23:59 local)
        const endOfArrivalDay = new Date(arrivalTime);
        endOfArrivalDay.setHours(23, 59, 59, 0);
        const now = new Date();
        const hoursUntilEnd = Math.max(
          1,
          Math.ceil((endOfArrivalDay.getTime() - now.getTime()) / (1000 * 60 * 60))
        );
        const days = Math.max(1, Math.ceil(hoursUntilEnd / 24));
        setDurationDays(String(days));
      }

      toast.success(`Flight ${data.flightNumber} found — ${data.departure.iata} → ${data.arrival.iata}`);
    } catch {
      setFlightError("Failed to fetch flight data. Please try again.");
    } finally {
      setFlightLoading(false);
    }
  }, [flightNumber, flightDate]);

  const poolAddr = POOL_MAP[marketId] || CONTRACTS.LP_TRAVEL;
  const productAddr = PRODUCT_MAP[marketId] || CONTRACTS.TRAVEL;
  const productAbi = market ? categoryToABI(market.category) : PRODUCT_ABI;

  /* --- on-chain reads --- */
  const { data: poolData } = useReadContracts({
    contracts: [
      { address: poolAddr, abi: LP_POOL_ABI, functionName: "totalAssets" },
      { address: poolAddr, abi: LP_POOL_ABI, functionName: "totalMaxPayouts" },
      { address: poolAddr, abi: LP_POOL_ABI, functionName: "totalShares" },
    ],
  });
  const { data: activePolicies } = useReadContract({
    address: productAddr,
    abi: productAbi,
    functionName: "getActivePolicyCount",
  });

  const totalAssets = poolData?.[0]?.result as bigint | undefined;
  const totalMaxPayouts = poolData?.[1]?.result as bigint | undefined;
  const totalShares = poolData?.[2]?.result as bigint | undefined;

  const tvl = totalAssets ? Number(formatUnits(totalAssets, 6)) : 0;
  const utilization =
    totalAssets && totalMaxPayouts && totalAssets > BigInt(0)
      ? (Number(totalMaxPayouts) / Number(totalAssets)) * 100
      : 0;
  const availableCapacity = totalAssets && totalMaxPayouts
    ? Number(formatUnits(totalAssets - totalMaxPayouts, 6))
    : 0;

  /* --- premium calculation --- */
  const effectivePayout = customPayout ? Number(customPayout) : 0;
  const basePremium = market?.marketData.basePremium || 5;
  const surgeMultiplier = market?.marketData.surgeMultiplier || 1.0;

  // Premium = (expected loss ratio) × payout × margin × surge
  // For travel: historicalDelayRate ~18% → EL = 0.18 × payout
  // We approximate with the actual basePremium from market data scaled to payout
  const historicalRiskRate = basePremium / 100; // e.g. 5/100 = 0.05 base
  const expectedLoss = effectivePayout * historicalRiskRate;
  const marginMultiplier = 1 + (PROTOCOL_MARGIN_BPS / 10000);
  const calculatedPremium = expectedLoss * marginMultiplier * surgeMultiplier;
  const originationFee = calculatedPremium * (ORIGINATION_FEE_BPS / 10000);
  const totalCost = calculatedPremium + originationFee;
  const payoutRatio = effectivePayout / (totalCost || 1);

  /* --- allowance / approve / purchase --- */
  const premiumBigInt = parseUnits(totalCost.toFixed(6), 6);
  const payoutBigInt = parseUnits(effectivePayout.toFixed(6), 6);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.USDT,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.ESCROW] : undefined,
  });
  const needsApproval =
    allowance !== undefined && (allowance as bigint) < premiumBigInt;

  const {
    writeContract: approve,
    data: approveTxHash,
    isPending: isApproving,
  } = useWriteContract();
  const {
    writeContract: purchase,
    data: purchaseTxHash,
    isPending: isPurchasing,
  } = useWriteContract();

  const { isLoading: isConfirmingApprove, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });
  const { isLoading: isConfirmingPurchase, isSuccess: purchaseConfirmed } = useWaitForTransactionReceipt({
    hash: purchaseTxHash,
  });

  useEffect(() => {
    if (approveConfirmed) {
      toast.success("USDT approved for spending");
      refetchAllowance();
    }
  }, [approveConfirmed, refetchAllowance]);

  useEffect(() => {
    if (purchaseConfirmed) {
      toast.success("CONSENSUS_FINALIZED: Policy Registered", {
        description: `Tx: ${purchaseTxHash?.slice(0, 10)}... (Arbitrum Sepolia)`,
        action: {
          label: "PORTFOLIO",
          onClick: () => router.push("/portfolio"),
        },
        cancel: {
          label: "EXPLORER",
          onClick: () => window.open(`https://sepolia.arbiscan.io/tx/${purchaseTxHash}`, "_blank"),
        },
        duration: 8000,
      });
      // Clear forms
      setApiTarget("");
      setCustomPayout("");
      setFlightNumber("");
      setFlightDate("");
      setFlightData(null);
      setStrikeValue("");
      setExitValue("");
    }
  }, [purchaseConfirmed, router, purchaseTxHash]);

  const handleApprove = () => {
    approve({
      address: CONTRACTS.USDT,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.ESCROW, premiumBigInt * BigInt(100)],
    });
  };

  const handlePurchase = async () => {
    if (!apiTarget.trim()) {
      toast.error(isFlightMarket ? "Look up a flight first" : "Please enter a valid identifier");
      return;
    }
    if (effectivePayout <= 0) {
      toast.error("Enter a payout amount");
      return;
    }

    // Logic for Gasless / Smart Wallet Sponsorship
    if (authenticated && executeSponsoredBuy) {
      try {
        toast.info("Vectoring Sponsored Transaction...");
        await executeSponsoredBuy(Number(totalCost.toFixed(2)));
        return;
      } catch (err) {
        // Fallback or error handled in hook
        return;
      }
    }

    // Standard Wallet Fallback
    purchase({
      address: CONTRACTS.ESCROW,
      abi: ESCROW_ABI,
      functionName: "purchasePolicy",
      args: [
        apiTarget,
        premiumBigInt,
        payoutBigInt,
        BigInt(Number(durationDays) * 24),
      ],
    });
  };

  const formattedBalance = usdtBalance
    ? (Number(usdtBalance.value) / 1e6).toFixed(2)
    : "0.00";

  if (!market) {
    return (
      <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto text-center">
        <span className="material-symbols-outlined text-6xl text-zinc-700 mb-4">
          error_outline
        </span>
        <h1 className="text-3xl font-bold mb-4">Market Not Found</h1>
        <Link href="/market" className="text-primary hover:underline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const rules = market.rules.split(/\d+\.\s+/).filter(Boolean);

  /* --- market-specific input config --- */
  const DEFAULT_CONFIG = { label: "Target Identifier", placeholder: "Enter target", icon: Search };
  const configMap: any = {
    travel: { label: "Flight Number", placeholder: "e.g. AA1234", icon: Plane },
    agri: { label: "Geographic Zone / Station", placeholder: "e.g. USW00094846", icon: Globe },
    energy: { label: "Weather Station ID", placeholder: "e.g. USW00094846", icon: Thermometer },
    catastrophe: { label: "Coordinates (Lat, Lon)", placeholder: "e.g. 34.05, -118.24", icon: Navigation },
    maritime: { label: "Port / IMO Code", placeholder: "e.g. USNYC or IMO:9811000", icon: Anchor },
  };
  const inputConfig = market && market.category ? configMap[market.category] || DEFAULT_CONFIG : DEFAULT_CONFIG;

  return (
    <>
      <main className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">
        {/* --- Breadcrumb --- */}
      <div className="flex items-center gap-3 mb-10 text-[10px] uppercase font-black tracking-widest text-zinc-600">
        <Link href="/market" className="hover:text-white transition-colors">Marketplace</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#D31027]">{market.title}</span>
      </div>


          {/* -- Header Section -- */}
          <div className="flex flex-col md:flex-row items-end gap-10 mb-16">
            <div className="relative">
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl relative z-10 group">
                <span
                    className="material-symbols-outlined text-5xl transition-transform duration-500 group-hover:scale-110"
                    style={{ color: `rgb(${market.rgb})` }}
                >
                    {market.icon}
                </span>
                </div>
                {/* Glow Background */}
                <div className="absolute inset-0 blur-3xl rounded-full scale-150 opacity-20" style={{ background: `rgb(${market.rgb})` }} />
            </div>

            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: `rgb(${market.rgb})` }} />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Parametric Protection Node</span>
              </div>
              <h1 className="text-6xl font-black tracking-tighter mb-4 text-white uppercase italic">
                {market.title.split(' ')[0]} <span style={{ color: `rgb(${market.rgb})` }}>{market.title.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-[#888888] text-lg leading-relaxed font-medium">
                {market.description}
              </p>
            </div>

            {isConnected && (
                <div className="flex flex-col items-end gap-3 translate-y-[-8px]">
                    <div className="flex items-center gap-4 p-4 bg-[#0A0A0A] rounded-2xl border border-white/5 shadow-2xl">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                            <History className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Pool Status</span>
                            <span className="mono-data text-sm text-emerald-500 font-bold uppercase tracking-widest">Operational</span>
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* -- Market Mechanics -- */}
          <details className="bg-[#0A0A0A] rounded-[2rem] p-10 mb-16 border border-white/5 shadow-2xl group transition-all duration-500">
            <summary className="cursor-pointer list-none flex items-center justify-between outline-none">
              <div className="flex items-center gap-4">
                  <Info className="w-5 h-5 text-[#D31027]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">Protocol Methodology & Settlement Engine</span>
              </div>
              <ChevronDown className="w-5 h-5 text-zinc-600 transition-transform duration-500 group-open:rotate-180" />
            </summary>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-in fade-in slide-in-from-top-4 duration-500">
              {[
                {
                  step: "01",
                  title: "Risk Calibration",
                  desc: market.category === "travel"
                    ? "Query specific flight vectors. Real-time historical delay analysis determines loss projection."
                    : "Specify geographic strike/exit coordinates linked to decentralized climate nodes.",
                  icon: Zap,
                },
                {
                  step: "02",
                  title: "Underwriting Execution",
                  desc: "Automated premium derivation via Reflex Risk Engine. 105% coverage margin required in LP vault.",
                  icon: Shield,
                },
                {
                  step: "03",
                  title: "On-Chain Settlement",
                  desc: "DONs monitor triggers 24/7. Atomic USDT disbursement to policyholder upon verification.",
                  icon: Activity,
                },
              ].map((s) => (
                <div key={s.step} className="bg-[#101216] p-8 rounded-3xl border border-white/5 relative group/card">
                   <div className="text-[40px] font-black text-white/5 absolute -top-2 -left-2 tracking-tighter transition-colors group-hover/card:text-[#D31027]/10">{s.step}</div>
                   <div className="relative z-10 flex flex-col h-full">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover/card:bg-[#D31027]/10 transition-colors">
                            <s.icon className="w-6 h-6 text-zinc-400 group-hover/card:text-[#D31027]" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest mb-4 group-hover/card:text-white transition-colors">{s.title}</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{s.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </details>


          {/* -- About -- */}
          <div className="flex flex-col gap-4">
            <h2 className="text-institutional">About this Product</h2>
            <p className="text-on-surface leading-relaxed text-[15px] opacity-80 max-w-2xl">
              {market.about}
            </p>
          </div>

          {/* --- Layout Wrapper --- */}
          <div className="flex flex-col lg:flex-row gap-8 items-start w-full mt-12">
            
            {/* ═════════ LEFT COLUMN ═════════ */}
            <div className="w-full lg:w-[58%] flex flex-col gap-8">
              
              {/* --- Configure Protection --- */}
              <div className="bg-[#0A0A0A] rounded-[2rem] p-10 flex flex-col gap-10 border border-white/5 shadow-2xl relative z-50">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-[#D31027] rounded-full" />
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        Risk Parameter Matrix
                    </h3>
                </div>

          {/* ═══ FLIGHT MARKET: Flight Number + Date + Lookup ═══ */}
          {isFlightMarket ? (
            <div className="space-y-10">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
                  <Plane className="w-3.5 h-3.5 text-[#D31027]" />
                  Flight Authorization Details
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">Identifier (IATA)</span>
                    <div className="bg-[#101216] p-4 rounded-2xl border border-white/5 focus-within:border-[#D31027]/40 transition-all group/input">
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase().replace(/\s/g, ''))}
                        placeholder="e.g. AA1234"
                        className="bg-transparent border-none p-0 w-full mono-data text-base focus:ring-0 text-white placeholder:text-zinc-800"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">Departure Window</span>
                    <div className="bg-[#101216] p-4 rounded-2xl border border-white/5 focus-within:border-[#D31027]/40 transition-all group/input">
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-transparent border-none p-0 w-full mono-data text-base focus:ring-0 text-white placeholder:text-zinc-800 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={fetchFlightDetails}
                  disabled={flightLoading || !flightNumber.trim() || !flightDate}
                  className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all bg-white/5 text-zinc-400 hover:bg-[#D31027] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/5 shadow-xl"
                >
                  {flightLoading ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Interrogating Oracle Nodes…
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Interrogate Flight Vector
                    </>
                  )}
                </button>
                {flightError && (
                  <div className="flex items-center gap-3 px-5 py-3 bg-[#D31027]/10 rounded-2xl border border-[#D31027]/20">
                    <AlertTriangle className="w-4 h-4 text-[#FFB3B5]" />
                    <span className="text-[11px] font-bold text-[#FFB3B5] uppercase tracking-widest">{flightError}</span>
                  </div>
                )}

                {/* -- Premium Flight Details Card (Boarding Pass) -- */}
                {flightData && (
                  <div className="bg-[#101216] rounded-3xl p-8 border border-white/5 animate-in fade-in zoom-in duration-500 shadow-2xl relative overflow-hidden group">
                    {/* Decorative Scanline */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-[#D31027]/20 group-hover:h-[2px] transition-all" />
                    
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                          <Plane className="w-6 h-6 text-[#D31027]" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{flightData.airline}</p>
                          <p className="text-xl font-black text-white italic tracking-tighter uppercase">{flightData.flightNumber}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all duration-300 ${
                        flightData.status === 'scheduled' ? 'bg-white/5 text-zinc-400 border-white/10' :
                        flightData.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        flightData.status === 'landed' ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' :
                        flightData.status === 'cancelled' ? 'bg-[#D31027]/10 text-[#FFB3B5] border-[#D31027]/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {flightData.status}
                      </div>
                    </div>

                    {/* High Fidelity Route */}
                    <div className="flex items-center gap-8 mb-10">
                      <div className="flex-1">
                        <p className="text-4xl font-black text-white italic tracking-tighter mb-1 select-none">{flightData.departure.iata}</p>
                        <p className="text-[10px] font-black text-zinc-500 uppercase truncate tracking-widest">{flightData.departure.airport.split(' ')[0]} INT</p>
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-grow">
                          <div className="w-full flex items-center gap-2">
                               <div className="flex-1 h-px bg-white/5" />
                               <Plane className="w-4 h-4 text-zinc-700 mx-2" />
                               <div className="flex-1 h-px bg-white/5" />
                          </div>
                          <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Non-Stop Vector</span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-4xl font-black text-white italic tracking-tighter mb-1 select-none">{flightData.arrival.iata}</p>
                        <p className="text-[10px] font-black text-zinc-500 uppercase truncate tracking-widest">{flightData.arrival.airport.split(' ')[0]} INT</p>
                      </div>
                    </div>

                    {/* Times Ledger */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="w-1 h-2.5 bg-zinc-700 rounded-full" />
                           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Departure Schedule</p>
                        </div>
                        <p className="mono-data text-xl text-white font-bold">
                          {flightData.departure.scheduled ? new Date(flightData.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'}
                        </p>
                        {flightData.departure.delay > 0 && (
                          <p className="text-[9px] font-black text-[#D31027] mt-2 uppercase tracking-widest">+{flightData.departure.delay} MIN LATENCY</p>
                        )}
                      </div>
                      <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="w-1 h-2.5 bg-zinc-700 rounded-full" />
                           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Arrival Target</p>
                        </div>
                        <p className="mono-data text-xl text-white font-bold">
                          {flightData.arrival.scheduled ? new Date(flightData.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'}
                        </p>
                        {flightData.arrival.delay > 0 && (
                          <p className={`text-[9px] font-black mt-2 uppercase tracking-widest ${flightData.arrival.delay >= 120 ? 'text-[#D31027]' : 'text-amber-500'}`}>
                            +{flightData.arrival.delay} MIN LATENCY
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Auto-set Status */}
                    <div className="flex items-center gap-4 px-5 py-4 bg-[#D31027]/5 rounded-2xl border border-[#D31027]/10">
                      <Clock className="w-4 h-4 text-[#D31027]" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">
                        Temporal Locking Active: <strong className="text-white">{durationDays} DAY{Number(durationDays) > 1 ? 'S' : ''}</strong> (TERMINAL FINALITY)
                      </span>
                    </div>

                    {flightData.isDelayedOver2Hours && (
                      <div className="mt-4 flex items-center gap-4 px-5 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-relaxed">
                          Vector Validated: Instant Settlement Available via Parametric Trigger
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ═══ NON-FLIGHT: Generic Target Input ═══ */
              <div className="space-y-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
                    <inputConfig.icon className="w-3.5 h-3.5" style={{ color: `rgb(${market.rgb})` }} />
                    {inputConfig.label}
                  </label>
                  <div className="bg-[#101216] p-5 rounded-2xl border border-white/5 focus-within:border-[#D31027]/40 transition-all">
                    <input
                      type="text"
                      value={apiTarget}
                      onChange={(e) => setApiTarget(e.target.value.toUpperCase())}
                      placeholder={inputConfig.placeholder}
                      className="bg-transparent border-none p-0 w-full mono-data text-lg focus:ring-0 text-white placeholder:text-zinc-800"
                    />
                  </div>
                  {apiTarget && (
                    <div className="flex items-center gap-2 px-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400">
                        Oracle monitoring will activate on purchase
                      </span>
                    </div>
                  )}
                </div>

                {/* Market-specific extra fields */}
                {(market.category === "agri" || market.category === "catastrophe") && (
                  <div className="grid grid-cols-2 gap-3">
                    {market.category === "agri" ? (
                      <>
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">Strike Index (mm)</label>
                          <input type="number" value={strikeValue} onChange={e => setStrikeValue(e.target.value)} placeholder="e.g. 200" className="bg-[#101216] p-4 rounded-2xl border border-white/5 mono-data text-sm focus:ring-1 focus:ring-[#D31027]/40 text-white placeholder:text-zinc-800" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">Exit Index (mm)</label>
                          <input type="number" value={exitValue} onChange={e => setExitValue(e.target.value)} placeholder="e.g. 80" className="bg-[#101216] p-4 rounded-2xl border border-white/5 mono-data text-sm focus:ring-1 focus:ring-[#D31027]/40 text-white placeholder:text-zinc-800" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">Latitude</label>
                          <input type="text" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="e.g. 34.0522" className="bg-[#101216] p-4 rounded-2xl border border-white/5 mono-data text-sm focus:ring-1 focus:ring-[#D31027]/40 text-white placeholder:text-zinc-800" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">Longitude</label>
                          <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="e.g. -118.2437" className="bg-[#101216] p-4 rounded-2xl border border-white/5 mono-data text-sm focus:ring-1 focus:ring-[#D31027]/40 text-white placeholder:text-zinc-800" />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {market.category === "energy" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">Tick Value (USD per Degree Day)</label>
                    <input type="number" value={tickValue} onChange={e => setTickValue(e.target.value)} placeholder="10" className="bg-[#101216] p-4 rounded-2xl border border-white/5 mono-data text-sm focus:ring-1 focus:ring-[#D31027]/40 text-white placeholder:text-zinc-800" />
                  </div>
                )}

                {/* Duration Selector (non-flight only) */}
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1">Coverage Temporal Window</label>
                  <div className="flex gap-3">
                    {["1", "7", "14", "30"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDurationDays(d)}
                        className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${durationDays === d
                            ? "bg-[#D31027] border-[#D31027] text-white shadow-[0_10px_20px_rgba(211,16,39,0.2)]"
                            : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                          }`}
                      >
                        {d}D
                      </button>
                    ))}
                  </div>
                </div>
              </div>
          )}

          {/* -- Expected Payout Input -- */}
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              Maximum Exposure / Payout
            </label>
            <div className="bg-[#101216] p-5 rounded-2xl flex items-center gap-4 border border-white/5 focus-within:border-emerald-500/40 transition-all group">
              <span className="text-zinc-700 text-sm font-black">$</span>
              <input
                type="number"
                value={customPayout}
                onChange={(e) => setCustomPayout(e.target.value)}
                placeholder="0.00"
                min="1"
                className="bg-transparent border-none p-0 w-full mono-data text-2xl font-bold focus:ring-0 text-white placeholder:text-zinc-800"
              />
              <span className="text-zinc-700 text-[10px] font-black uppercase tracking-widest shrink-0">USDT</span>
            </div>
            {effectivePayout > 0 && effectivePayout > availableCapacity && availableCapacity > 0 && (
              <div className="flex items-center gap-3 px-5 py-3 bg-[#D31027]/10 rounded-2xl border border-[#D31027]/20">
                <AlertTriangle className="w-4 h-4 text-[#FFB3B5]" />
                <span className="text-[10px] font-bold text-[#FFB3B5] uppercase tracking-widest">
                  Capacity Warning: Pooled Liquidity Cap at ${availableCapacity.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          </div>
        </div>

        {/* ═════════ RIGHT COLUMN — Purchase Terminal ═════════ */}
        <div className="w-full lg:w-[42%]">
          <div className="sticky top-28 space-y-6">

            {/* -- Purchase Widget -- */}
            <div className="bg-[#0A0A0A] rounded-[2rem] p-10 flex flex-col gap-8 border border-white/5 shadow-2xl relative overflow-hidden group">
               {/* Accent Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#D31027]/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-[#D31027]/20 transition-colors" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Selected Risk Vector</span>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Coverage Summary
                    </h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Authority Balance</span>
                  <span className="mono-data text-xs text-emerald-500 font-bold">{formattedBalance} USDT</span>
                </div>
              </div>

              {/* --- Underwriting Quote Breakdown --- */}
              <div className="bg-[#101216] rounded-3xl p-8 space-y-6 border border-white/5 relative z-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 flex items-center gap-3">
                    <Terminal className="w-3.5 h-3.5 text-[#D31027]" />
                    Underwriting Ledger
                  </h4>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[9px] font-black text-[#D31027] uppercase tracking-widest hover:underline"
                  >
                    {showAdvanced ? "Hide Calc" : "Show Calc"}
                  </button>
                </div>

                {/* Main line items */}
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center group/item">
                    <Tooltip text={`Base premium derived from historical volatility and loss projections. Expected Loss = ${historicalRiskRate.toFixed(4)} × $${effectivePayout} = $${expectedLoss.toFixed(2)}`}>
                      <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-2 group-hover/item:text-zinc-200 transition-colors uppercase tracking-widest cursor-help">
                        Technical Premium
                        <Info className="w-3 h-3 text-zinc-700" />
                      </span>
                    </Tooltip>
                    <span className="mono-data text-sm text-white font-bold tracking-tight">${calculatedPremium.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center group/item">
                    <Tooltip text={`Origination fee of ${ORIGINATION_FEE_BPS} BPS (3%) on the calculated premium for operational node sustainability.`}>
                      <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-2 group-hover/item:text-zinc-200 transition-colors uppercase tracking-widest cursor-help">
                        Node Fee (3%)
                        <Info className="w-3 h-3 text-zinc-700" />
                      </span>
                    </Tooltip>
                    <span className="mono-data text-sm text-zinc-500 font-bold tracking-tight">${originationFee.toFixed(2)}</span>
                  </div>

                  {surgeMultiplier > 1.0 && (
                     <div className="flex justify-between items-center px-4 py-3 bg-[#D31027]/10 rounded-2xl border border-[#D31027]/20 group/surge">
                      <Tooltip text={`Dynamic Risk Engine has applied a ${surgeMultiplier.toFixed(2)}x surge multiplier based on elevated environmental conditions.`}>
                        <span className="text-[10px] font-black text-[#FFB3B5] flex items-center gap-2 uppercase tracking-widest cursor-help">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Risk Surge
                        </span>
                      </Tooltip>
                      <span className="mono-data text-sm text-[#FFB3B5] font-black">{surgeMultiplier.toFixed(2)}x</span>
                    </div>
                  )}

                  <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Total Authorization</span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Refund if oracle detects error</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-3xl font-black text-white italic tracking-tighter">${totalCost.toFixed(2)}</div>
                        <span className="text-[9px] font-black text-[#D31027] uppercase tracking-[0.2em]">USDT ERC-20</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                         <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Potential Payout</span>
                         <span className="text-sm font-black text-emerald-500 italic px-1">${effectivePayout.toFixed(2)}</span>
                    </div>
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                         <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Alpha Multiplier</span>
                         <span className="text-sm font-black text-white italic px-1">{payoutRatio.toFixed(1)}x</span>
                    </div>
                  </div>
                </div>

                {/* Advanced calculation breakdown */}
                {showAdvanced && (
                  <div className="mt-4 pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D31027]">Risk Engine Internal Matrix</h5>
                    <div className="bg-black/80 p-5 rounded-2xl font-mono text-[9px] space-y-2 text-zinc-500 border border-white/5 shadow-inner">
                      <p className="text-zinc-600 opacity-50">// STEP_01: RETRIEVE_VECT_DATA</p>
                      <p>risk_factor = base / 100 = <span className="text-zinc-300">{historicalRiskRate.toFixed(4)}</span></p>
                      <p className="text-zinc-600 opacity-50 mt-2">// STEP_02: COMPUTE_EXP_LOSS</p>
                      <p>exp_loss = risk_factor * payout = <span className="text-white">${expectedLoss.toFixed(4)}</span></p>
                      <p className="text-zinc-600 opacity-50 mt-2">// STEP_03: MARGIN_OVERHEAD</p>
                      <p>margin = 1 + ({PROTOCOL_MARGIN_BPS/10000}) = <span className="text-zinc-300">{marginMultiplier}</span></p>
                      <p>premium = exp_loss * margin * surge = <span className="text-[#D31027] font-bold">${calculatedPremium.toFixed(4)}</span></p>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                        Auth verified via <strong className="text-white">EIP-712</strong>. Quantum-resistant hashing ensures premium integrity across distributed node clusters.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  {!isConnected ? (
                    <div className="p-6 bg-white/5 rounded-3xl text-center border border-white/5 italic text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                      Vault Access Protocol Required
                    </div>
                  ) : needsApproval ? (
                    <button
                      onClick={handleApprove}
                      disabled={isApproving || isConfirmingApprove}
                      className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                    >
                      {isApproving || isConfirmingApprove ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin" />
                          Indexing Vault Permissions…
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          Confirm Authorization
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={isPurchasing || isConfirmingPurchase || effectivePayout <= 0 || (effectivePayout > availableCapacity && availableCapacity > 0)}
                      className="w-full py-5 bg-[#D31027] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-[#A9081E] transition-all shadow-[0_15px_40px_rgba(211,16,39,0.3)] flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                    >
                      {isPurchasing || isConfirmingPurchase ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin" />
                          Securing Vector Finality…
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current transition-transform group-hover/btn:scale-110" />
                          Initialize Protection
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-8 py-4 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default relative z-10">
                 <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Quantum-Secured</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-[#D31027]" />
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Arbitrum Nodes</span>
                 </div>
              </div>
            </div>

            {/* -- Market Liquidity HUD -- */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 shadow-2xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Activity className="w-8 h-8 text-[#D31027]" />
                  </div>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3 group-hover:text-zinc-400 transition-colors">Risk Utilization</p>
                  <div className="text-2xl font-black text-white italic tracking-tighter mb-3">{utilization.toFixed(1)}%</div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-gradient-to-r from-[#D31027] to-[#A9081E] transition-all duration-1000 shadow-[2px_0_10px_rgba(211,16,39,0.5)]" 
                        style={{ width: `${Math.min(utilization, 100)}%` }} 
                     />
                  </div>
               </div>
               <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 shadow-2xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Droplets className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3 group-hover:text-zinc-400 transition-colors">Market Depth</p>
                  <div className="text-2xl font-black text-emerald-500 italic tracking-tighter mb-1">${availableCapacity.toLocaleString()}</div>
                  <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Operational Capacity</span>
               </div>
            </div>

            {/* -- Risk Calculator Card -- */}
            <div className="bg-[#0A0A0A] rounded-[2rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="text-xl font-black uppercase tracking-tight text-white italic">
                        Scenario Analysis Matrix
                    </h3>
               </div>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest block">Exposure Basis</span>
                  <div className="text-2xl font-black text-white italic tracking-tighter">${totalCost.toFixed(2)}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest block">Target Disbursement</span>
                  <div className="text-2xl font-black italic tracking-tighter" style={{ color: `rgb(${market.rgb})` }}>
                    ${effectivePayout.toFixed(2)}
                  </div>
                </div>
              </div>

               {/* Scenario Ledger */}
               <div className="space-y-3 mb-10">
                {market.category === "travel" ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                      <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Delay Vector confirmed</span>
                          <span className="text-[9px] text-emerald-700 font-medium">Wait Time ≥ 120min or Cancelled</span>
                      </div>
                      <span className="mono-data text-emerald-400 font-black tracking-tight">+${effectivePayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/2 p-5 rounded-2xl border border-white/5">
                      <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Nominal Arrival</span>
                          <span className="text-[9px] text-zinc-800 font-medium">Vector completed within SLA</span>
                      </div>
                      <span className="mono-data text-zinc-700">-${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                      <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Parametric Trigger</span>
                          <span className="text-[9px] text-emerald-700 font-medium">Node Validation Successful</span>
                      </div>
                      <span className="mono-data text-emerald-400 font-black tracking-tight">+${effectivePayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/2 p-5 rounded-2xl border border-white/5">
                      <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Baseline Conditions</span>
                          <span className="text-[9px] text-zinc-800 font-medium">Trigger window expiration</span>
                      </div>
                      <span className="mono-data text-zinc-700">-${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Net P/L */}
              <div className="p-6 bg-emerald-500/10 rounded-3xl flex justify-between items-center border border-emerald-500/20">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Net P/L Result</span>
                </div>
                <span className="mono-data text-xl text-emerald-400 font-black tracking-tighter">
                  +${(effectivePayout - totalCost).toFixed(2)} USDT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* -- Resolution Ledger Rules -- */}
          <div className="bg-[#0A0A0A] rounded-[3rem] p-12 border border-white/5 shadow-2xl mt-16 group">
            <div className="flex items-center gap-5 mb-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#D31027]/40 transition-colors">
                    <Shield className="w-6 h-6 text-zinc-400 group-hover:text-[#D31027] transition-colors" />
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Resolution Protocol</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-4 p-6 bg-[#101216] rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-zinc-700 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-zinc-400 leading-relaxed font-medium">{rule.trim()}</span>
                    </div>
                ))}
            </div>
          </div>

          {/* -- Smart Contract Registry -- */}
          <div className="p-12 bg-[#0A0A0A] rounded-[3rem] border border-white/5 shadow-2xl space-y-10 mt-10 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D31027]/20 to-transparent" />
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">On-Chain Registry</h3>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Mainnet-Parity Nodes Active</span>
                </div>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col gap-4 group/addr">
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Protection Product Factory</span>
                <a 
                    href={`https://sepolia.arbiscan.io/address/${productAddr}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mono-data text-xs text-zinc-400 truncate hover:text-white transition-colors flex items-center gap-3"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#D31027]" />
                  {productAddr}
                </a>
              </div>
              <div className="flex flex-col gap-4 group/addr">
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Collateral Liquidity Vault</span>
                <a 
                    href={`https://sepolia.arbiscan.io/address/${poolAddr}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mono-data text-xs text-zinc-400 truncate hover:text-white transition-colors flex items-center gap-3"
                >
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  {poolAddr}
                </a>
              </div>
            </div>
          </div>
    </main>
    </>
  );
}
