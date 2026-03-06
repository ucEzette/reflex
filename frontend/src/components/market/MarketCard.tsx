import React from 'react';
import { Shield, ArrowRight, Activity, Info } from 'lucide-react';
import { MarketDetail } from '@/lib/market-data';
import Link from 'next/link';

interface MarketCardProps {
    product: MarketDetail;
}

export function MarketCard({ product }: MarketCardProps) {
    return (
        <div className="parent live-market group">
            <div className={`card-3d !h-[420px] bg-gradient-to-br border-white/5`}>
                <div className="glass !inset-0 !rounded-3xl border border-white/10 flex flex-col p-8 justify-between relative">
                    {/* Background Decorative Element - Moved inside a clipped container if needed, but for now just allowing pop-outs */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/40 transition-all duration-500 pointer-events-none" />

                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500`} title="Protection Category">
                                <span className={`material-symbols-outlined text-4xl ${product.iconColor}`}>{product.icon}</span>
                            </div>
                            <div className="text-right" title={product.about}>
                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/20 transition-all cursor-help">
                                    <Info className="w-5 h-5 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-foreground mb-3 leading-tight">{product.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 font-light">
                            {product.description}
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-xs text-slate-400 p-2 rounded-lg bg-white/5 border border-transparent group-hover:border-white/5 transition-all" title="Verified Oracle Network monitoring this risk">
                                <Activity className="w-3.5 h-3.5 text-primary" />
                                <span>{product.bullet1}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 p-2 rounded-lg bg-white/5 border border-transparent group-hover:border-white/5 transition-all" title="Settlement trigger and security parameter">
                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{product.bullet2}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Link
                            href={`/market/${product.id}`}
                            className="dexter-btn-container relative z-30"
                        >
                            <button className="dexter-btn !w-full !min-h-[50px] !rounded-xl" type="button">
                                <span className="dexter-btn-drawer dexter-transition-top !text-[10px]">RESERVE CAP</span>
                                <span className="dexter-btn-text flex items-center justify-center gap-2 w-full">
                                    Insure <ArrowRight className="w-4 h-4" />
                                </span>
                                <svg className="dexter-btn-corner !w-[32px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                                <svg className="dexter-btn-corner !w-[32px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                                <svg className="dexter-btn-corner !w-[32px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                                <svg className="dexter-btn-corner !w-[32px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                                <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[10px] uppercase tracking-widest">{product.price} Premium</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
