"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

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

/* --- Tooltip component --- */
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
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-surface-container-highest text-[10px] text-zinc-300 leading-relaxed p-3 rounded-lg border border-white/10 shadow-2xl z-50 pointer-events-none animate-fade-in">
          {text}
        </span>
      )}
    </span>
  );
}

/* --- Main --- */
export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params?.product as string;
  const market = useMemo(
    () => ALL_MARKETS.find((m) => m.id === marketId),
    [marketId]
  );

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

  const { data: allowance } = useReadContract({
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

  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });
  const { isSuccess: purchaseConfirmed } = useWaitForTransactionReceipt({
    hash: purchaseTxHash,
  });

  useEffect(() => {
    if (approveConfirmed) toast.success("USDT approved for spending");
  }, [approveConfirmed]);

  useEffect(() => {
    if (purchaseConfirmed)
      toast.success("Policy purchased! Check your Portfolio.");
  }, [purchaseConfirmed]);

  const handleApprove = () => {
    approve({
      address: CONTRACTS.USDT,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.ESCROW, premiumBigInt * BigInt(100)],
    });
  };

  const handlePurchase = () => {
    if (!apiTarget.trim()) {
      toast.error(isFlightMarket ? "Look up a flight first" : "Please enter a valid identifier");
      return;
    }
    if (effectivePayout <= 0) {
      toast.error("Enter a payout amount");
      return;
    }
    if (effectivePayout > availableCapacity && availableCapacity > 0) {
      toast.error("Requested payout exceeds pool capacity");
      return;
    }
    if (isFlightMarket && !flightData) {
      toast.error("Look up your flight before purchasing");
      return;
    }

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
  const DEFAULT_CONFIG = { label: "Target Identifier", placeholder: "Enter target", icon: "search" };
  const configMap: any = {
    travel: { label: "Flight Number", placeholder: "e.g. AA1234", icon: "flight_takeoff" },
    agri: { label: "Geographic Zone / Station", placeholder: "e.g. USW00094846", icon: "grass" },
    energy: { label: "Weather Station ID", placeholder: "e.g. USW00094846", icon: "thermostat" },
    catastrophe: { label: "Coordinates (Lat, Lon)", placeholder: "e.g. 34.05, -118.24", icon: "my_location" },
    maritime: { label: "Port / IMO Code", placeholder: "e.g. USNYC or IMO:9811000", icon: "sailing" },
  };
  const inputConfig = configMap[market.category] || DEFAULT_CONFIG;

  return (
    <main className="pt-28 pb-24 px-6 lg:px-8 max-w-[1600px] mx-auto">
      {/* --- Breadcrumb --- */}
      <div className="flex items-center gap-2 mb-8 text-xs text-zinc-500">
        <Link href="/market" className="hover:text-on-surface transition-colors">Markets</Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-on-surface font-medium">{market.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* ═════════ LEFT COLUMN ═════════ */}
        <div className="w-full lg:w-[58%] flex flex-col gap-10">

          {/* -- Header -- */}
          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center specular-border"
              style={{ background: `rgba(${market.rgb}, 0.12)` }}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: `rgb(${market.rgb})` }}
              >
                {market.icon}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-institutional">Insurance Market</span>
                <span
                  className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
                  style={{
                    background: `rgba(${market.rgb}, 0.1)`,
                    color: `rgb(${market.rgb})`,
                    border: `1px solid rgba(${market.rgb}, 0.2)`,
                  }}
                >
                  {market.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-tertiary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px] text-tertiary">hub</span>
                  <span className="text-[9px] font-bold text-tertiary uppercase">CCIP Enabled</span>
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-on-surface">
                {market.title}
              </h1>
              <p className="text-zinc-400 font-light leading-relaxed max-w-xl mt-1">
                {market.description}
              </p>
            </div>
          </div>

          {/* -- How This Model Works -- */}
          <details className="bg-surface-container-low rounded-xl p-8 specular-border group">
            <summary className="cursor-pointer text-institutional mb-0 group-open:mb-6 list-none flex items-center justify-between outline-none">
              How This Market Works
              <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Define Risk Parameters",
                  desc: market.category === "travel"
                    ? "Enter your flight number. We query FlightAware AeroAPI for historical delay rates on this specific route."
                    : "Enter your target identifier and define Strike/Exit thresholds for your parametric coverage.",
                  icon: "tune",
                },
                {
                  step: "2",
                  title: "Receive Underwriting Quote",
                  desc: "Premium is computed from expected loss ratio, protocol margin (5%), and any surge multiplier from the Dynamic Risk Engine.",
                  icon: "receipt_long",
                },
                {
                  step: "3",
                  title: "Automatic Settlement",
                  desc: "Chainlink DON monitors your target 24/7. If the trigger condition is met, USDT settles directly — no claims process.",
                  icon: "bolt",
                },
              ].map((s) => (
                <div key={s.step} className="flex flex-col gap-3 p-5 bg-surface-container-lowest rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                      style={{
                        background: `rgba(${market.rgb}, 0.15)`,
                        color: `rgb(${market.rgb})`,
                      }}
                    >
                      {s.step}
                    </div>
                    <span className="material-symbols-outlined text-zinc-500 text-lg">{s.icon}</span>
                  </div>
                  <h4 className="text-sm font-bold">{s.title}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{s.desc}</p>
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

              {/* --- Configure Protection --- */}
              <div className="bg-surface-container-high rounded-2xl p-8 flex flex-col gap-6 specular-border relative z-50">
                <h3 className="text-xl font-headline font-bold text-on-surface">
                  Configure Protection
                </h3>
              {/* ═══ FLIGHT MARKET: Flight Number + Date + Lookup ═══ */}
          {isFlightMarket ? (
            <>
              <div className="flex flex-col gap-3">
                <label className="text-institutional flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-blue-400">flight_takeoff</span>
                  Flight Details
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Flight Number</span>
                    <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-transparent focus-within:border-primary/30 transition-all">
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase().replace(/\s/g, ''))}
                        placeholder="e.g. AA1234"
                        className="bg-transparent border-none p-0 w-full mono-data text-base focus:ring-0 text-on-surface placeholder:text-zinc-700"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Flight Date</span>
                    <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-transparent focus-within:border-primary/30 transition-all">
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-transparent border-none p-0 w-full mono-data text-base focus:ring-0 text-on-surface placeholder:text-zinc-700 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={fetchFlightDetails}
                  disabled={flightLoading || !flightNumber.trim() || !flightDate}
                  className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed border border-white/5"
                >
                  {flightLoading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Fetching from FlightAware…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm text-blue-400">search</span>
                      Look Up Flight
                    </>
                  )}
                </button>
                {flightError && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                    <span className="text-[11px] text-red-400">{flightError}</span>
                  </div>
                )}
              </div>

              {/* -- Flight Details Card -- */}
              {flightData && (
                <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4 border border-blue-500/10 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-400">flight</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{flightData.airline}</p>
                        <p className="mono-data text-xs text-zinc-500">{flightData.flightNumber} · {flightData.flightDate}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      flightData.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      flightData.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      flightData.status === 'landed' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                      flightData.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {flightData.status}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 text-center">
                      <p className="mono-data text-2xl font-black text-on-surface">{flightData.departure.iata}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 truncate">{flightData.departure.airport}</p>
                      {flightData.departure.terminal && <p className="text-[9px] text-zinc-600">Terminal {flightData.departure.terminal}{flightData.departure.gate ? ` · Gate ${flightData.departure.gate}` : ''}</p>}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-24 h-px bg-gradient-to-r from-blue-500/50 via-blue-400 to-blue-500/50 relative">
                        <span className="material-symbols-outlined text-blue-400 text-sm absolute -top-[9px] left-1/2 -translate-x-1/2">flight</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="mono-data text-2xl font-black text-on-surface">{flightData.arrival.iata}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 truncate">{flightData.arrival.airport}</p>
                      {flightData.arrival.terminal && <p className="text-[9px] text-zinc-600">Terminal {flightData.arrival.terminal}{flightData.arrival.gate ? ` · Gate ${flightData.arrival.gate}` : ''}</p>}
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-container-highest p-3 rounded-lg">
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Departure</p>
                      <p className="mono-data text-sm text-on-surface">
                        {flightData.departure.scheduled ? new Date(flightData.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </p>
                      {flightData.departure.delay > 0 && (
                        <p className="text-[9px] text-amber-400 mt-0.5">+{flightData.departure.delay} min delay</p>
                      )}
                    </div>
                    <div className="bg-surface-container-highest p-3 rounded-lg">
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Arrival</p>
                      <p className="mono-data text-sm text-on-surface">
                        {flightData.arrival.scheduled ? new Date(flightData.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </p>
                      {flightData.arrival.delay > 0 && (
                        <p className={`text-[9px] mt-0.5 ${flightData.arrival.delay >= 120 ? 'text-red-400' : 'text-amber-400'}`}>
                          +{flightData.arrival.delay} min delay
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Coverage auto-set */}
                  <div className="flex items-center gap-2 px-2 py-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                    <span className="material-symbols-outlined text-blue-400 text-sm">schedule</span>
                    <span className="text-[10px] text-blue-300">
                      Coverage auto-set to <strong>{durationDays} day{Number(durationDays) > 1 ? 's' : ''}</strong> (through end of arrival day)
                    </span>
                  </div>

                  {flightData.isDelayedOver2Hours && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
                      <span className="text-[10px] text-emerald-300 font-bold">This flight qualifies for immediate payout — delay exceeds 120 minutes.</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* ═══ NON-FLIGHT: Generic Target Input ═══ */
            <>
              <div className="flex flex-col gap-2">
                <label className="text-institutional flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm" style={{ color: `rgb(${market.rgb})` }}>
                    {inputConfig.icon}
                  </span>
                  {inputConfig.label}
                </label>
                <div className="bg-surface-container-lowest p-4 rounded-lg border border-transparent focus-within:border-primary/30 transition-all">
                  <input
                    type="text"
                    value={apiTarget}
                    onChange={(e) => setApiTarget(e.target.value.toUpperCase())}
                    placeholder={inputConfig.placeholder}
                    className="bg-transparent border-none p-0 w-full mono-data text-lg focus:ring-0 text-on-surface placeholder:text-zinc-700"
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
                      <div className="flex flex-col gap-1.5">
                        <label className="text-institutional">Strike Index (mm)</label>
                        <input type="number" value={strikeValue} onChange={e => setStrikeValue(e.target.value)} placeholder="e.g. 200" className="bg-surface-container-lowest p-3 rounded-lg mono-data text-sm border-none focus:ring-0 text-on-surface placeholder:text-zinc-700" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-institutional">Exit Index (mm)</label>
                        <input type="number" value={exitValue} onChange={e => setExitValue(e.target.value)} placeholder="e.g. 80" className="bg-surface-container-lowest p-3 rounded-lg mono-data text-sm border-none focus:ring-0 text-on-surface placeholder:text-zinc-700" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-institutional">Latitude</label>
                        <input type="text" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="e.g. 34.0522" className="bg-surface-container-lowest p-3 rounded-lg mono-data text-sm border-none focus:ring-0 text-on-surface placeholder:text-zinc-700" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-institutional">Longitude</label>
                        <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="e.g. -118.2437" className="bg-surface-container-lowest p-3 rounded-lg mono-data text-sm border-none focus:ring-0 text-on-surface placeholder:text-zinc-700" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {market.category === "energy" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-institutional">Tick Value (USD per Degree Day)</label>
                  <input type="number" value={tickValue} onChange={e => setTickValue(e.target.value)} placeholder="10" className="bg-surface-container-lowest p-3 rounded-lg mono-data text-sm border-none focus:ring-0 text-on-surface placeholder:text-zinc-700" />
                </div>
              )}

              {/* Duration Selector (non-flight only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-institutional">Coverage Duration</label>
                <div className="flex gap-2">
                  {["1", "7", "14", "30"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDurationDays(d)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${durationDays === d
                          ? "bg-primary-container text-white"
                          : "bg-surface-container-lowest text-zinc-400 hover:text-on-surface"
                        }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* -- Expected Payout Input -- */}
          <div className="flex flex-col gap-2">
            <label className="text-institutional flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-400">payments</span>
              Expected Payout
            </label>
            <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center gap-2 border border-transparent focus-within:border-emerald-500/30 transition-all">
              <span className="text-zinc-500 text-sm">$</span>
              <input
                type="number"
                value={customPayout}
                onChange={(e) => setCustomPayout(e.target.value)}
                placeholder="Enter payout amount"
                min="1"
                className="bg-transparent border-none p-0 w-full mono-data text-lg focus:ring-0 text-on-surface placeholder:text-zinc-700"
              />
              <span className="text-zinc-500 text-xs shrink-0">USDT</span>
            </div>
            {effectivePayout > 0 && effectivePayout > availableCapacity && availableCapacity > 0 && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                <span className="material-symbols-outlined text-red-400 text-sm">warning</span>
                <span className="text-[10px] text-red-400">
                  Exceeds available pool capacity (${availableCapacity.toLocaleString()})
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
            <div className="bg-surface-container-high rounded-2xl p-8 flex flex-col gap-6 specular-border">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-headline font-bold text-on-surface">
                  Coverage Summary
                </h3>
                <div className="flex flex-col items-end">
                  <span className="text-institutional">Wallet Balance</span>
                  <span className="mono-data text-xs text-on-surface-variant">
                    {formattedBalance} USDT
                  </span>
                </div>
              </div>

              {/* --- Underwriting Quote Breakdown --- */}
              <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4 border border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">analytics</span>
                    Underwriting Quote
                  </h4>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[10px] text-primary hover:underline"
                  >
                    {showAdvanced ? "Hide details" : "Show calculation"}
                  </button>
                </div>

                {/* Main line items */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <Tooltip text={`Base premium = Expected Loss × Protocol Margin (${PROTOCOL_MARGIN_BPS} BPS / 5%). Expected Loss = ${historicalRiskRate.toFixed(4)} × $${effectivePayout} = $${expectedLoss.toFixed(2)}`}>
                      <span className="text-sm opacity-70 flex items-center gap-1">
                        Calculated Premium
                        <span className="material-symbols-outlined text-[14px] text-zinc-600">info</span>
                      </span>
                    </Tooltip>
                    <span className="mono-data text-on-surface">${calculatedPremium.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Tooltip text={`Origination fee of ${ORIGINATION_FEE_BPS} BPS (3%) on the calculated premium. Sent to Protocol Treasury for operational sustainability.`}>
                      <span className="text-sm opacity-70 flex items-center gap-1">
                        Origination Fee (3%)
                        <span className="material-symbols-outlined text-[14px] text-zinc-600">info</span>
                      </span>
                    </Tooltip>
                    <span className="mono-data text-zinc-400">${originationFee.toFixed(2)}</span>
                  </div>

                  {surgeMultiplier > 1.0 && (
                    <div className="flex justify-between items-center">
                      <Tooltip text={`Dynamic Risk Engine has applied a ${surgeMultiplier.toFixed(2)}x surge multiplier based on elevated environmental conditions. ${market.marketData.surgeReason || "Real-time risk data indicates heightened probability."}`}>
                        <span className="text-sm text-amber-400 flex items-center gap-1">
                          Surge Multiplier
                          <span className="material-symbols-outlined text-[14px] text-amber-500">warning</span>
                        </span>
                      </Tooltip>
                      <span className="mono-data text-amber-400">{surgeMultiplier.toFixed(2)}x</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <Tooltip text="Total cost = Calculated Premium + Origination Fee. This is the amount deducted from your wallet.">
                      <span className="text-sm font-bold flex items-center gap-1">
                        Total Cost
                        <span className="material-symbols-outlined text-[14px] text-zinc-600">info</span>
                      </span>
                    </Tooltip>
                    <span className="mono-data text-on-surface font-bold text-lg">
                      ${totalCost.toFixed(2)} USDT
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Tooltip text={`If the oracle confirms the parametric trigger, you receive the full $${effectivePayout} USDT. This represents a ${payoutRatio.toFixed(1)}x return on the premium paid.`}>
                      <span className="text-sm opacity-70 flex items-center gap-1">
                        Max Payout
                        <span className="material-symbols-outlined text-[14px] text-zinc-600">info</span>
                      </span>
                    </Tooltip>
                    <span className="mono-data font-bold" style={{ color: `rgb(${market.rgb})` }}>
                      ${effectivePayout.toFixed(2)} USDT
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Tooltip text="Ratio of max payout to total premium cost. Higher ratio = more capital-efficient protection.">
                      <span className="text-sm opacity-70 flex items-center gap-1">
                        Payout Ratio
                        <span className="material-symbols-outlined text-[14px] text-zinc-600">info</span>
                      </span>
                    </Tooltip>
                    <span className="mono-data text-emerald-400 font-bold">{payoutRatio.toFixed(1)}x</span>
                  </div>
                </div>

                {/* Advanced calculation breakdown */}
                {showAdvanced && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-fade-in">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Calculation Mechanics</h5>
                    <div className="bg-surface-container-highest p-4 rounded-lg mono-data text-[10px] space-y-2 text-zinc-400">
                      <p className="text-zinc-500">// Step 1: Historical Risk Rate</p>
                      <p>riskRate = basePremium / 100 = {historicalRiskRate.toFixed(4)}</p>
                      <p className="text-zinc-500 mt-2">// Step 2: Expected Loss</p>
                      <p>expectedLoss = riskRate × requestedPayout</p>
                      <p>expectedLoss = {historicalRiskRate.toFixed(4)} × ${effectivePayout} = <span className="text-primary">${expectedLoss.toFixed(4)}</span></p>
                      <p className="text-zinc-500 mt-2">// Step 3: Apply Protocol Margin ({PROTOCOL_MARGIN_BPS} BPS)</p>
                      <p>marginMultiplier = 1 + ({PROTOCOL_MARGIN_BPS} / 10000) = {marginMultiplier}</p>
                      <p>premium = expectedLoss × marginMultiplier × surgeMultiplier</p>
                      <p>premium = ${expectedLoss.toFixed(4)} × {marginMultiplier} × {surgeMultiplier} = <span className="text-primary">${calculatedPremium.toFixed(4)}</span></p>
                      <p className="text-zinc-500 mt-2">// Step 4: Origination Fee ({ORIGINATION_FEE_BPS} BPS)</p>
                      <p>originationFee = premium × ({ORIGINATION_FEE_BPS} / 10000) = <span className="text-amber-400">${originationFee.toFixed(4)}</span></p>
                      <p className="text-zinc-500 mt-2">// Step 5: Total Cost to Policyholder</p>
                      <p>totalCost = premium + originationFee = <span className="text-emerald-400 font-bold">${totalCost.toFixed(4)}</span></p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                      <span className="material-symbols-outlined text-blue-400 text-sm mt-0.5">info</span>
                      <p className="text-[10px] text-blue-300 leading-relaxed">
                        On-chain premium verification uses <strong>EIP-712 typed signatures</strong> from the authorized Quoter. The Relayer signs the premium quote off-chain, and the Product contract verifies the signature before accepting the purchase.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* -- Pool Health Indicator -- */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-institutional">Pool Utilization</span>
                  <span className="mono-data text-xs" style={{ color: utilization > 80 ? "#ef4444" : utilization > 50 ? "#f59e0b" : "#22c55e" }}>
                    {mounted ? `${utilization.toFixed(1)}%` : "—"}
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(utilization, 100)}%`,
                      background: utilization > 80
                        ? "linear-gradient(90deg, #ef4444, #dc2626)"
                        : utilization > 50
                        ? "linear-gradient(90deg, #f59e0b, #d97706)"
                        : `linear-gradient(90deg, rgb(${market.rgb}), rgba(${market.rgb}, 0.6))`,
                    }}
                  />
                </div>
                {utilization > 80 && (
                  <p className="text-[10px] text-amber-400 italic">⚠ High utilization — premium surge may apply.</p>
                )}
              </div>

              {/* -- Action Button -- */}
              {!isConnected ? (
                <p className="text-center text-zinc-500 text-sm py-2">
                  Connect your wallet to purchase protection.
                </p>
              ) : needsApproval ? (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-surface-container-highest text-on-surface py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-bright transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">lock</span>
                  {isApproving ? "Approving..." : "Approve USDT"}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full py-4 rounded-xl font-bold text-lg text-white hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, rgb(${market.rgb}), rgba(${market.rgb}, 0.7))`,
                    boxShadow: `0 4px 24px rgba(${market.rgb}, 0.3)`,
                  }}
                >
                  {isPurchasing ? "Purchasing..." : `Coverage Summary — $${totalCost.toFixed(2)}`}
                </button>
              )}

              <p className="text-[10px] text-center text-zinc-500 leading-relaxed uppercase tracking-wider">
                Settlement on Arbitrum Sepolia · Chainlink DON · Standard gas fees apply
              </p>
            </div>

            {/* -- Risk Calculator Card -- */}
            <div className="bg-surface-container-low rounded-2xl p-6 specular-border space-y-4">
              <h4 className="text-institutional flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-amber-400">calculate</span>
                Risk Calculator
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500">If you pay</span>
                  <span className="mono-data text-lg font-bold">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500">You receive up to</span>
                  <span className="mono-data text-lg font-bold" style={{ color: `rgb(${market.rgb})` }}>
                    ${effectivePayout.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="h-px bg-white/5" />

              {/* Scenarios */}
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Scenario Analysis</p>
                {market.category === "travel" ? (
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                      <span className="text-emerald-400">✓ Flight delayed ≥ 120 min</span>
                      <span className="mono-data text-emerald-400 font-bold">+${effectivePayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-zinc-500/5 p-2.5 rounded-lg border border-zinc-500/10">
                      <span className="text-zinc-400">✗ Flight on time</span>
                      <span className="mono-data text-zinc-500">-${totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                      <span className="text-emerald-400">✓ Flight cancelled</span>
                      <span className="mono-data text-emerald-400 font-bold">+${effectivePayout.toFixed(2)}</span>
                    </div>
                  </div>
                ) : market.category === "catastrophe" ? (
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between bg-red-500/5 p-2.5 rounded-lg border border-red-500/10">
                      <span className="text-red-400">✓ Quake &lt;25km: 100%</span>
                      <span className="mono-data text-red-400 font-bold">+${effectivePayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                      <span className="text-amber-400">✓ Quake 25-50km: 30%</span>
                      <span className="mono-data text-amber-400 font-bold">+${(effectivePayout * 0.3).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-zinc-500/5 p-2.5 rounded-lg border border-zinc-500/10">
                      <span className="text-zinc-400">✗ No qualifying event</span>
                      <span className="mono-data text-zinc-500">-${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : market.category === "agri" ? (
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                      <span className="text-emerald-400">✓ Rainfall ≤ Exit → 100%</span>
                      <span className="mono-data text-emerald-400 font-bold">+${effectivePayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                      <span className="text-amber-400">✓ Partial shortfall → Linear</span>
                      <span className="mono-data text-amber-400">+$??.??</span>
                    </div>
                    <div className="flex justify-between bg-zinc-500/5 p-2.5 rounded-lg border border-zinc-500/10">
                      <span className="text-zinc-400">✗ Rainfall ≥ Strike</span>
                      <span className="mono-data text-zinc-500">-${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                      <span className="text-emerald-400">✓ Trigger confirmed</span>
                      <span className="mono-data text-emerald-400 font-bold">+${effectivePayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between bg-zinc-500/5 p-2.5 rounded-lg border border-zinc-500/10">
                      <span className="text-zinc-400">✗ No trigger event</span>
                      <span className="mono-data text-zinc-500">-${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Net P/L */}
              <div className="p-3 bg-surface-container-highest rounded-lg flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Net Profit if Triggered</span>
                <span className="mono-data text-emerald-400 font-bold">
                  +${(effectivePayout - totalCost).toFixed(2)} USDT
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      {/* --- End Layout Wrapper --- */}

          {/* -- Resolution Rules -- */}
          <div className="bg-surface-container-low rounded-xl p-8 specular-border mt-4 w-full">
            <h2 className="text-institutional mb-6">Resolution Rules</h2>
            <ul className="flex flex-col gap-4">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sm mt-0.5" style={{ color: `rgb(${market.rgb})` }}>
                    check_circle
                  </span>
                  <span className="text-sm opacity-90">{rule.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* -- Contract Reference -- */}
          <div className="p-6 bg-surface-container-lowest rounded-xl specular-border space-y-4 w-full">
            <h3 className="text-institutional">Smart Contract Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[10px]">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 uppercase tracking-widest font-bold">Product Contract</span>
                <a href={`https://sepolia.arbiscan.io/address/${productAddr}`} target="_blank" rel="noopener noreferrer" className="mono-data text-primary truncate hover:underline">
                  {productAddr}
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 uppercase tracking-widest font-bold">Liquidity Pool</span>
                <a href={`https://sepolia.arbiscan.io/address/${poolAddr}`} target="_blank" rel="noopener noreferrer" className="mono-data text-primary truncate hover:underline">
                  {poolAddr}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
