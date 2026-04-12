import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from '@/lib/contracts';
import { LIQUIDITY_POOL_ABI, ESCROW_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShieldAlert, Info, Play, Pause, Zap, TrendingUp, RefreshCcw, Shield, Lock, Unlock } from 'lucide-react';
import { InstitutionalTooltip } from '@/components/ui/InstitutionalTooltip';

export function AdminControl() {
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Live on-chain metrics
    const { data: totalAssets, refetch: refetchAssets } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets',
        query: { enabled: mounted }
    });

    const { data: totalMaxPayouts, refetch: refetchPayouts } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts',
        query: { enabled: mounted }
    });

    const { data: totalShares, refetch: refetchShares } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalShares',
        query: { enabled: mounted }
    });

    const { data: requiredQuorum, refetch: refetchQuorum } = useReadContract({
        address: CONTRACTS.ESCROW as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'requiredQuorum',
        query: { enabled: mounted }
    });

    const { data: paused, refetch: refetchPause } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'paused',
        query: { enabled: mounted }
    });

    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isTxSuccess) {
            refetchPause();
            refetchQuorum();
            refetchAssets();
            refetchPayouts();
            refetchShares();
        }
    }, [isTxSuccess]);

    const handleTogglePause = () => {
        writeContract({
            address: CONTRACTS.LP_POOL as `0x${string}`,
            abi: LIQUIDITY_POOL_ABI,
            functionName: paused ? 'unpause' : 'pause',
        });

        toast.info(paused ? "Requesting Resume..." : "Requesting Emergency Pause...", {
            description: "Please confirm the transaction in your wallet."
        });
    };

    const handleAddRelayer = () => {
        const relayerAddress = prompt("Enter Relayer Ethereum Address:");
        if (!relayerAddress || !relayerAddress.startsWith('0x')) return;

        writeContract({
            address: CONTRACTS.ESCROW as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'addAuthorizedRelayer',
            args: [relayerAddress as `0x${string}`],
        });

        toast.info("Authorizing Relayer...", { description: `Granting guardian permissions to ${relayerAddress.slice(0, 10)}...` });
    };

    const handleAdjustQuorum = () => {
        const newQuorum = prompt("Enter New Quorum Threshold (e.g., 2):");
        if (!newQuorum) return;

        writeContract({
            address: CONTRACTS.ESCROW as `0x${string}`,
            abi: ESCROW_ABI,
            functionName: 'updateQuorum',
            args: [BigInt(newQuorum)],
        });

        toast.info("Updating Quorum...", { description: `Setting consensus threshold to ${newQuorum} relayers.` });
    };

    return (
        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl space-y-8">
            <div>
                <InstitutionalTooltip title="Protocol Command Center" content="High-privileged terminal for emergency management, yield harvesting, and controlling the decentralized relayer quorum.">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 cursor-help">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        Protocol Command Center
                        <Info className="w-4 h-4 text-zinc-500 opacity-50" />
                    </h2>
                </InstitutionalTooltip>
                <p className="text-slate-400 text-sm mt-1">High-privileged administrative controls for protocol governance and emergency management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Emergency Killswitch */}
                <div className={`p-6 rounded-2xl border transition-all ${paused ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${paused ? 'bg-red-500/20' : 'bg-white/10'}`}>
                            {paused ? <Play className="w-5 h-5 text-red-500" /> : <Pause className="w-5 h-5 text-slate-400" />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${paused ? 'bg-red-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {paused ? 'Paused' : 'Active'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Emergency Pause</h3>
                    <p className="text-xs text-slate-400 font-light mb-6">Instantly halt all product creation and settlements across the entire ecosystem.</p>
                    <button
                        onClick={handleTogglePause}
                        disabled={isTxLoading}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${paused ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} disabled:opacity-50`}
                    >
                        {isTxLoading ? 'Processing...' : (paused ? 'Resume Protocol' : 'Trigger Emergency Pause')}
                    </button>
                </div>

                {/* Relayer Management */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <Lock className="w-4 h-4 text-slate-500 group-hover:text-foreground transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Relayer Network</h3>
                    <p className="text-xs text-slate-400 font-light mb-6">Manage authorized relayers and adjust the M-of-N quorum threshold.</p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddRelayer}
                            disabled={isTxLoading}
                            className="flex-1 py-2 bg-white/5 border border-white/10 hover:border-primary/50 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            Add Relayer
                        </button>
                        <button
                            onClick={handleAdjustQuorum}
                            disabled={isTxLoading}
                            className="flex-1 py-2 bg-white/5 border border-white/10 hover:border-red-500/50 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            Adjust Quorum
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                <div className="flex items-center gap-2 mb-4">
                    <Unlock className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global State Variables</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total TVL</p>
                        <p className="text-xl font-bold text-foreground">
                            {mounted ? `$${(Number(formatUnits(totalAssets || 0n, 6))).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "$0"}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Utilization Rate</p>
                        <p className="text-xl font-bold text-foreground">
                            {mounted && totalAssets && totalAssets > 0n ? `${((Number(totalMaxPayouts || 0n) / Number(totalAssets)) * 100).toFixed(1)}%` : "0.0%"}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Active Quorum</p>
                        <p className="text-xl font-bold text-foreground">{mounted ? `${requiredQuorum?.toString() || '0'} / 3` : "0 / 3"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Execution Engine</p>
                        <p className="text-xl font-bold text-emerald-400">
                            Zero-Touch
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
