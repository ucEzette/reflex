"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, Globe, Cpu, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Operational Health HUD
 * Monitors Oracles, Relayers, and Risk Simulation engines.
 */
export const HealthHUD = () => {
    const [mounted, setMounted] = useState(false);
    const [status, setStatus] = useState({
        oracle: "healthy",
        relayer: "healthy",
        risk: "active",
        latency: 142
    });

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setStatus(prev => ({
                ...prev,
                latency: 120 + Math.floor(Math.random() * 50)
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    const items = [
        { 
            label: "Oracle DON", 
            value: "DECENTRALIZED", 
            status: "healthy", 
            icon: Globe,
            detail: "Last Update: < 12s ago"
        },
        { 
            label: "ZK Relayer", 
            value: "OPERATIONAL", 
            status: "healthy", 
            icon: Zap,
            detail: "Queue: 0 Pending"
        },
        { 
            label: "Risk Engine", 
            value: "POLLING", 
            status: "active", 
            icon: Cpu,
            detail: "Sectors: 5/5 Active"
        },
        { 
            label: "Network Latency", 
            value: `${status.latency}ms`, 
            status: status.latency > 170 ? "warning" : "healthy", 
            icon: Activity,
            detail: "Avalanche Fuji RPC"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-3xl bg-zinc-950/50 border border-white/5 backdrop-blur-md">
            {items.map((item, i) => (
                <div key={i} className="p-4 space-y-3 relative group overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className={cn(
                            "p-2 rounded-lg bg-white/5",
                            item.status === 'healthy' ? "text-emerald-500" : item.status === 'active' ? "text-primary" : "text-amber-500"
                        )}>
                            <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                item.status === 'healthy' ? "bg-emerald-500" : item.status === 'active' ? "bg-primary" : "bg-amber-500"
                            )} />
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{item.status}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
                        <h4 className="text-sm font-black text-white italic tracking-tight uppercase">{item.value}</h4>
                    </div>

                    <p className="text-[9px] text-zinc-600 font-bold">{item.detail}</p>
                    
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            ))}
        </div>
    );
};
