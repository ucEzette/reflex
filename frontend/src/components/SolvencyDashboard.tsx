import { createPublicClient, http, formatUnits } from "viem";
import { avalancheFuji } from "viem/chains";
import { POOLS } from "@/lib/contracts";
import { LIQUIDITY_POOL_ABI } from "@/lib/enterprise_abis";
import { SolvencyDashboardClient } from "./SolvencyDashboardClient";
import { Suspense } from "react";

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc"),
});

const SolvencyDashboardData = async () => {
    const poolAddresses = POOLS.map(p => p.address as `0x${string}`);
    
    const assetCalls = poolAddresses.map(addr => ({
        address: addr,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets'
    }));
    
    const liabilityCalls = poolAddresses.map(addr => ({
        address: addr,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts'
    }));

    try {
        const results = await publicClient.multicall({
            contracts: [...assetCalls, ...liabilityCalls]
        });

        // Parse results
        const assets = results.slice(0, poolAddresses.length).reduce((acc: bigint, res) => {
            if (res.status === 'success' && typeof res.result === 'bigint') return acc + res.result;
            return acc;
        }, BigInt(0));

        const liabilities = results.slice(poolAddresses.length).reduce((acc: bigint, res) => {
            if (res.status === 'success' && typeof res.result === 'bigint') return acc + res.result;
            return acc;
        }, BigInt(0));

        const assetsNum = Number(formatUnits(assets, 6));
        const liabilitiesNum = Number(formatUnits(liabilities, 6));
        
        let ratio = 1000;
        if (liabilitiesNum > 0) {
            ratio = (assetsNum / liabilitiesNum) * 100;
        }

        const initialMetrics = {
            totalAssets: assetsNum,
            totalLiabilities: liabilitiesNum,
            ratio: Math.min(ratio, 999.9)
        };

        return <SolvencyDashboardClient initialMetrics={initialMetrics} />;

    } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        // Fallback layout if RPC burns out
        return <SolvencyDashboardClient initialMetrics={{ totalAssets: 0, totalLiabilities: 0, ratio: 0 }} />;
    }
}

// Suspense Boundary Wrapper
export const SolvencyDashboard = () => {
    return (
        <Suspense fallback={
            <div className="w-full p-8 rounded-[2rem] glass-panel-premium relative overflow-hidden group min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-neon-cyan/50">
                    <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Synchronizing with Decentralized Oracle Network...</span>
                </div>
            </div>
        }>
            <SolvencyDashboardData />
        </Suspense>
    )
}
