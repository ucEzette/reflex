import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { LIQUIDITY_POOL_ABI } from '@/lib/enterprise_abis';
import { formatUnits } from 'viem';

export function usePoolMetrics() {
    const { data: totalAssets } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalAssets',
    });

    const { data: totalMaxPayouts } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'totalMaxPayouts',
    });

    const tvl = totalAssets ? Number(formatUnits(totalAssets as bigint, 6)) : 0;
    const payouts = totalMaxPayouts ? Number(formatUnits(totalMaxPayouts as bigint, 6)) : 0;
    const utilization = tvl > 0 ? (payouts / tvl) * 100 : 0;

    return { tvl, payouts, utilization };
}
