import { useReadContracts } from 'wagmi';
import { CONTRACTS, POOLS } from '@/lib/contracts';
import { LIQUIDITY_POOL_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';
import { useMemo } from 'react';

export function usePoolMetrics() {
    const poolAddresses = POOLS.map(p => p.address as `0x${string}`);

    const { data: results, isLoading } = useReadContracts({
        contracts: [
            ...poolAddresses.map(address => ({
                address,
                abi: LIQUIDITY_POOL_ABI,
                functionName: 'totalAssets',
            })),
            ...poolAddresses.map(address => ({
                address,
                abi: LIQUIDITY_POOL_ABI,
                functionName: 'totalMaxPayouts',
            }))
        ],
        query: {
            refetchInterval: 20000,
        }
    });

    const metrics = useMemo(() => {
        if (!results || !Array.isArray(results)) return { tvl: 0, payouts: 0, utilization: 0, isLoading };

        const totalAssetsBigInt = results.slice(0, poolAddresses.length).reduce((acc: bigint, res: any) => {
            return acc + (res?.status === 'success' ? (res.result as bigint) : BigInt(0));
        }, BigInt(0));

        const totalPayoutsBigInt = results.slice(poolAddresses.length).reduce((acc: bigint, res: any) => {
            return acc + (res?.status === 'success' ? (res.result as bigint) : BigInt(0));
        }, BigInt(0));

        const tvl = Number(formatUnits(totalAssetsBigInt, 6));
        const payouts = Number(formatUnits(totalPayoutsBigInt, 6));
        const utilization = tvl > 0 ? (payouts / tvl) * 100 : 0;

        return { tvl, payouts, utilization, isLoading };
    }, [results, poolAddresses.length, isLoading]);

    return metrics;
}
