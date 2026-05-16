import React from 'react';
import { Shield, ArrowRight, Activity, Info } from 'lucide-react';
import { MarketDetail } from '@/lib/market-data';
import Link from 'next/link';
import { InstitutionalTooltip } from '@/components/ui/InstitutionalTooltip';

interface MarketCardProps {
    product: MarketDetail;
}

export function MarketCard({ product }: MarketCardProps) {
    return (
        <div className="parent live-market group">
            <Link href={`/market/${product.id}`} className="card-3d ruby block">
                <div className="glass ruby">
                    {/* 3D Decorative Circles */}
                    <div className="logo ruby">
                        <div className="circle circle1" />
                        <div className="circle circle2" />
                        <div className="circle circle3" />
                        <div className="circle circle4" />
                        <div className="circle circle5">
                            <span className="material-symbols-outlined text-[#1A1A1A] text-xl">{product.icon}</span>
                        </div>
                    </div>

                    <div className="content ruby">
                        <div className="mb-4">
                            <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-bold uppercase tracking-wider text-rose-400 opacity-60`}>
                                    {product.category}
                                </span>
                            </div>
                            <div className="flex justify-between items-start mt-1">
                                <h3 className="text-2xl font-bold text-[#1A1A1A] leading-tight group-hover:text-rose-200 transition-colors">
                                    {product.title}
                                </h3>
                                <InstitutionalTooltip
                                    title="Risk Attribution"
                                    content={product.about}
                                    position="bottom"
                                >
                                    <div className="p-1.5 rounded-full bg-black/[0.03] border border-black/[0.06] hover:bg-black/[0.05] transition-colors cursor-help shrink-0 ml-2 animate-blink-soft">
                                        <Info className="w-4 h-4 text-rose-200/50" />
                                    </div>
                                </InstitutionalTooltip>
                            </div>
                        </div>

                        <p className="text-rose-100/60 text-sm leading-relaxed mb-6 font-light line-clamp-2 pr-4">
                            {product.description}
                        </p>

                        <div className="space-y-2 relative z-50">
                            <InstitutionalTooltip title="Verification Engine" content={`This risk is continuously monitored by the ${product.bullet1}.`}>
                                <div className="flex items-center gap-2.5 text-[11px] text-rose-100/50 hover:text-rose-100 transition-colors">
                                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                                    <span>{product.bullet1}</span>
                                </div>
                            </InstitutionalTooltip>

                            <InstitutionalTooltip title="Settlement Parameter" content={`The policy uses a ${product.bullet2} logic.`}>
                                <div className="flex items-center gap-2.5 text-[11px] text-rose-100/50 hover:text-rose-100 transition-colors">
                                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{product.bullet2}</span>
                                </div>
                            </InstitutionalTooltip>
                        </div>
                    </div>

                    <div className="bottom ruby">
                        <div className="flex flex-col">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-rose-400">Buy Policy</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#1A1A1A]/30 group-hover:text-white transition-all duration-300">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Details</span>
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
