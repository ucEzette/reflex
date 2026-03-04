"use client";

import React, { useState } from 'react';
import { Download, FileText, PieChart, BarChart3, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReportingSummary() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = (type: string) => {
        setIsExporting(true);
        toast.info(`Generating ${type} report...`);

        setTimeout(() => {
            setIsExporting(false);
            toast.success(`${type} report downloaded successfully!`, {
                description: "Institutional audit log for Q1 2026 is ready.",
            });
        }, 2000);
    };

    return (
        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">Institutional Reporting</h2>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                        Generate compliant audit logs and performance snapshots for your parametric risk portfolio.
                        All reports include on-chain transaction hashes and oracle verification proofs.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <PieChart className="w-4 h-4 text-cyan-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Allocation</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-lg font-bold text-foreground">4 Sectors</span>
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Diversified</span>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-4 h-4 text-purple-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Score</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-lg font-bold text-foreground">99.2%</span>
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Perfect</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0 min-w-[240px]">
                    <button
                        onClick={() => handleExport('PDF')}
                        disabled={isExporting}
                        className="flex items-center justify-between gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                <FileText className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-foreground">Professional PDF</p>
                                <p className="text-[10px] text-slate-500 font-medium">Full Audit Log</p>
                            </div>
                        </div>
                        <Download className="w-4 h-4 text-slate-500 group-hover:text-foreground transition-colors" />
                    </button>

                    <button
                        onClick={() => handleExport('CSV')}
                        disabled={isExporting}
                        className="flex items-center justify-between gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                <FileText className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-foreground">Raw Data (CSV)</p>
                                <p className="text-[10px] text-slate-500 font-medium">Reconciliation Sheet</p>
                            </div>
                        </div>
                        <Download className="w-4 h-4 text-slate-500 group-hover:text-foreground transition-colors" />
                    </button>

                    <div className="mt-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verification Status</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                            &quot;This portfolio meets the standard for high-net-worth parametric risk disclosure.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
