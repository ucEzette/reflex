import { Trophy, Users, Award, TrendingUp, Activity, Shield } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { LIQUIDITY_POOL_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';

const leaderData: any[] = []; // Mock entities removed

export function GlobalRiskLeaderboard() {
    const { data: totalAssets } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets',
    });

    const { data: totalPayouts } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts',
    });

    const liveTVL = totalAssets ? Number(formatUnits(totalAssets as bigint, 6)) : 0;
    const liveUtilization = totalAssets && totalPayouts && (totalAssets as bigint) > BigInt(0)
        ? (Number(totalPayouts) / Number(totalAssets)) * 100
        : 0;

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Global Risk Leaderboard</h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Top LPs</span>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-bold tracking-widest border-b border-border">
                            <th className="py-3 px-4 text-left">Rank</th>
                            <th className="py-3 px-4 text-left">Entity</th>
                            <th className="py-3 px-4 text-right">Pool Stake</th>
                            <th className="py-3 px-4 text-right">Utilization</th>
                            <th className="py-3 px-4 text-right">Net Yield</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {/* Live Protocol Row */}
                        <tr className="bg-primary/5 hover:bg-primary/10 transition-colors group">
                            <td className="py-4 px-4 text-left">
                                <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center font-bold font-mono text-xs shadow-lg shadow-primary/30">
                                    <Activity className="w-3 h-3" />
                                </div>
                            </td>
                            <td className="py-4 px-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">Reflex L1 Protocol</p>
                                        <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Live On-Chain</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-foreground font-medium">
                                {totalAssets ? (
                                    (() => {
                                        const assets = Number(formatUnits(totalAssets as bigint, 6));
                                        if (assets >= 1_000_000) return `$${(assets / 1_000_000).toFixed(1)}M`;
                                        if (assets >= 1_000) return `$${(assets / 1_000).toFixed(1)}K`;
                                        return `$${assets.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
                                    })()
                                ) : '$0'}
                            </td>
                            <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <div className="w-12 bg-accent/30 rounded-full h-1">
                                        <div
                                            className="h-1 rounded-full bg-primary"
                                            style={{ width: `${liveUtilization}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-mono text-primary font-bold">{liveUtilization.toFixed(1)}%</span>
                                </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-emerald-500 font-bold">
                                    <TrendingUp className="w-3 h-3" />
                                    {(() => {
                                        if (liveTVL >= 1_000_000) return `$${(liveTVL / 1_000_000).toFixed(1)}M`;
                                        if (liveTVL >= 1_000) return `$${(liveTVL / 1_000).toFixed(1)}K`;
                                        return `$${liveTVL.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
                                    })()}
                                </div>
                            </td>
                        </tr>

                        {leaderData.length > 0 && leaderData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-accent/20 transition-colors group">
                                <td className="py-4 px-4 text-left">
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold font-mono text-xs ${idx === 0 ? "bg-primary text-white" :
                                        idx === 1 ? "bg-amber-500/20 text-amber-500" :
                                            idx === 2 ? "bg-slate-500/20 text-slate-400" :
                                                "bg-accent/50 text-muted-foreground"
                                        }`}>
                                        {item.rank}
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined !text-[18px]">
                                                {item.icon === "person" ? "account_circle" :
                                                    item.icon === "agriculture" ? "grass" :
                                                        item.icon === "shield" ? "verified_user" :
                                                            item.icon === "thermostat" ? "thermostat" : "sailing"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">{item.type}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-foreground font-medium">{item.stake}</td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-12 bg-accent/30 rounded-full h-1">
                                            <div
                                                className="h-1 rounded-full bg-primary"
                                                style={{ width: item.utilization }}
                                            />
                                        </div>
                                        <span className="text-[11px] font-mono text-muted-foreground">{item.utilization}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5 text-emerald-500 font-bold">
                                        <TrendingUp className="w-3 h-3" />
                                        {item.yield}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-muted/20 border-t border-border">
                <button className="w-full py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                    <Award className="w-4 h-4" />
                    VIEW ALL PERFORMANCE RANKINGS
                </button>
            </div>
        </div>
    );
}
