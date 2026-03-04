"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Database } from 'lucide-react';
import { useWatchContractEvent } from 'wagmi';
import { CONTRACTS, TRAVEL_ABI, AGRI_ABI, ENERGY_ABI, ESCROW_ABI } from '@/lib/contracts';

export function LiveOracleConsole() {
    const [mounted, setMounted] = useState(false);
    const [liveLogs, setLiveLogs] = useState<any[]>([]);

    const handleNewEvent = (log: any, type: string, target: string) => {
        const newLog = {
            id: log.transactionHash,
            timestamp: new Date().toISOString(),
            target,
            message: `${type}: ${log.args?.policyId || log.args?.id || 'N/A'} - Tx: ${log.transactionHash.slice(0, 10)}...`,
            status: type.includes('Claimed') || type.includes('Success') ? 'Success' : 'Active'
        };
        setLiveLogs(prev => [newLog, ...prev].slice(0, 50));
    };

    useWatchContractEvent({ address: CONTRACTS.ESCROW as `0x${string}`, abi: ESCROW_ABI, eventName: 'PolicyPurchased', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Purchased', 'ESCROW')) });
    useWatchContractEvent({ address: CONTRACTS.ESCROW as `0x${string}`, abi: ESCROW_ABI, eventName: 'PolicyClaimed', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Claimed', 'ESCROW')) });
    useWatchContractEvent({ address: CONTRACTS.TRAVEL as `0x${string}`, abi: TRAVEL_ABI, eventName: 'PolicyCreated', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Created', 'TRAVEL')) });
    useWatchContractEvent({ address: CONTRACTS.AGRI as `0x${string}`, abi: AGRI_ABI, eventName: 'PolicyCreated', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Created', 'AGRI')) });
    useWatchContractEvent({ address: CONTRACTS.ENERGY as `0x${string}`, abi: ENERGY_ABI, eventName: 'PolicyCreated', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Created', 'ENERGY')) });
    useWatchContractEvent({ address: CONTRACTS.TRAVEL as `0x${string}`, abi: TRAVEL_ABI, eventName: 'PolicyClaimed', onLogs: (logs: any[]) => logs.forEach(l => handleNewEvent(l, 'Claimed', 'TRAVEL')) });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const displayLogs = liveLogs;

    return (
        <article className="bg-[#0a0a0a] border border-border rounded-xl h-full overflow-hidden flex flex-col shadow-sm">
            {/* Terminal Header */}
            <div className="bg-zinc-900/50 px-4 py-3 text-[10px] font-bold text-zinc-500 flex items-center justify-between border-b border-border">
                <span className="flex items-center gap-3 tracking-widest uppercase">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    Chainlink // DON-Verification-Feed
                </span>
                <div className="flex gap-1.5 items-center">
                    <span className="text-[9px] text-zinc-600 mr-2">VERIFIED-TS-01</span>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    </div>
                </div>
            </div>

            {/* Feed Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-[11px] leading-relaxed custom-scrollbar bg-transparent text-zinc-400 max-h-[400px]">
                {displayLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <Database className="w-8 h-8 text-zinc-700 mb-3" />
                        <p className="text-zinc-500 text-xs">Listening for on-chain events...</p>
                        <p className="text-zinc-600 text-[10px] mt-1">Events will appear in real-time as policies are created/claimed</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {displayLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative pl-4 border-l border-zinc-800"
                            >
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-zinc-500 tabular-nums">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {log.target}
                                    </span>
                                    <span className="text-[9px] text-zinc-600 font-bold ml-auto">0x{log.id.slice(0, 6)}</span>
                                </div>
                                <p className="text-zinc-300 leading-snug">{log.message}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Terminal Footer */}
            <div className="bg-zinc-900/30 p-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Global Consensus Active</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600">SIG_VER: ECDSA_SEC_PV2</span>
            </div>
        </article>
    );
}
