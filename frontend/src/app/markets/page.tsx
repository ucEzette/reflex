import { ActivePolicies } from "@/components/ActivePolicies";
import Link from "next/link";

export default function MarketsPage() {
    return (
        <div className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="max-w-7xl w-full relative z-10 flex flex-col gap-16">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Insurance Markets</h1>
                    <p className="text-slate-400 max-w-2xl text-lg font-light">Browse available parametric insurance pools and secure your assets with zkTLS validation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Flight Delay */}
                    <Link href="/profile" className="group relative bg-surface-dark border border-white/5 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden block">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-slate-500">flight_takeoff</span>
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                                    <span className="material-symbols-outlined">schedule</span>
                                </span>
                                <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">RISK-L1</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Flight Delay</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-2xl font-bold text-primary">$5 USDC</span>
                                <span className="text-sm text-slate-400">/ flight</span>
                            </div>
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                                    <span>Instant Oracle Payout</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                                    <span>Global Coverage</span>
                                </div>
                                <div className="w-full mt-4 bg-primary/20 hover:bg-primary/30 text-primary font-bold py-2 rounded border border-primary/20 transition-colors text-center">
                                    Purchase Policy
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Crop Failure */}
                    <div className="group relative bg-surface-dark border border-white/5 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden opacity-60 cursor-not-allowed">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-slate-500">grass</span>
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-green-500/20 text-green-400 p-2 rounded-lg">
                                    <span className="material-symbols-outlined">water_drop</span>
                                </span>
                                <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">RISK-L2</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Crop Failure</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-2xl font-bold text-green-500">2.5 AVAX</span>
                                <span className="text-sm text-slate-400">/ acre</span>
                            </div>
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                                    <span>Weather Data Oracle</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                                    <span>Automated Claims</span>
                                </div>
                                <div className="w-full mt-4 bg-white/5 text-slate-500 font-bold py-2 rounded border border-white/10 text-center">
                                    Coming Soon
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DeFi Hacks */}
                    <div className="group relative bg-surface-dark border border-white/5 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden opacity-60 cursor-not-allowed">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-slate-500">security</span>
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">
                                    <span className="material-symbols-outlined">code</span>
                                </span>
                                <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">RISK-L3</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">DeFi Hacks</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-2xl font-bold text-purple-500">5.0 AVAX</span>
                                <span className="text-sm text-slate-400">/ year</span>
                            </div>
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-purple-500 text-base">check_circle</span>
                                    <span>Smart Contract Cover</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-purple-500 text-base">check_circle</span>
                                    <span>Audit Verification</span>
                                </div>
                                <div className="w-full mt-4 bg-white/5 text-slate-500 font-bold py-2 rounded border border-white/10 text-center">
                                    Coming Soon
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-6">All Platform Policies</h2>
                    <ActivePolicies />
                </div>
            </div>
        </div>
    );
}
