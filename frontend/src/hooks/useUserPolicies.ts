import { useAccount, useReadContract, usePublicClient, useReadContracts } from 'wagmi';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { CONTRACTS, ESCROW_ABI, LP_POOL_ABI } from '@/lib/contracts';
import { useEffect, useState } from 'react';
import { parseAbiItem, formatUnits } from 'viem';

export interface UserPolicy {
    policyId: `0x${string}`;
    product: string;
    productLabel: string;
    policyholder: string;
    premium: bigint;
    maxPayout: bigint;
    status: number; // 0=active, 1=claimed, 2=expired
    expiresAt: bigint;
    identifier: string; // flightId, zone, port, etc.
    icon: string;
    txHash?: string;
}

const PRODUCT_CONFIGS = [
    { key: 'flight', label: 'Travel Solutions', contract: CONTRACTS.TRAVEL, icon: 'Plane', isTravel: true },
    { key: 'agri', label: 'Agriculture Index', contract: CONTRACTS.AGRI, icon: 'CloudRain', isTravel: false },
    { key: 'energy', label: 'Energy Solutions', contract: CONTRACTS.ENERGY, icon: 'Zap', isTravel: false },
    { key: 'cat', label: 'Catastrophe Proximity', contract: CONTRACTS.CATASTROPHE, icon: 'Flame', isTravel: false },
    { key: 'maritime', label: 'Maritime Solutions', contract: CONTRACTS.MARITIME, icon: 'Anchor', isTravel: false },
] as const;

const policyCreatedEvent = parseAbiItem('event PolicyCreated(bytes32 id, address indexed holder, uint256 premium, uint256 maxPayout, uint256 expiresAt)');
const travelPolicyCreatedEvent = parseAbiItem('event PolicyCreated(bytes32 id, address indexed holder, uint256 premium, uint256 payout, uint256 expiresAt)');

export function useUserPolicies() {
    const { address: eoaAddress, isConnected } = useAccount();
    const { client } = useSmartWallets();
    const address = client?.account?.address || eoaAddress;
    const publicClient = usePublicClient();
    const [policies, setPolicies] = useState<UserPolicy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: policyIds, isLoading: listLoading, refetch } = useReadContract({
        address: CONTRACTS.ESCROW as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'getUserPolicies',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address && isConnected }
    });

    // Fetch LP Shares from all 5 pools for voting power
    const POOL_ADDRESSES = [
        CONTRACTS.LP_TRAVEL,
        CONTRACTS.LP_AGRI,
        CONTRACTS.LP_ENERGY,
        CONTRACTS.LP_CAT,
        CONTRACTS.LP_MARITIME
    ];

    const { data: lpSharesData } = useReadContracts({
        contracts: POOL_ADDRESSES.map(pool => ({
            address: pool as `0x${string}`,
            abi: LP_POOL_ABI,
            functionName: 'lpShares',
            args: [address as `0x${string}`]
        })),
        query: { enabled: !!address && isConnected }
    });

    const totalVotingPower = lpSharesData 
        ? lpSharesData.reduce((acc, curr) => acc + (curr.result ? Number(formatUnits(curr.result as bigint, 18)) : 0), 0)
        : 0;

    useEffect(() => {
        if (!isConnected || !address || !policyIds || !publicClient) {
            setPolicies([]);
            return;
        }

        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const results: UserPolicy[] = [];
                const ids = (policyIds as `0x${string}`[]) || [];
                const userAddress = address as `0x${string}`;

                // Fetch logs for all PolicyPurchased events to find transaction hashes
                const purchasedLogs = await publicClient.getLogs({
                    address: CONTRACTS.ESCROW,
                    event: parseAbiItem('event PolicyPurchased(bytes32 indexed policyId, address indexed policyholder, string apiTarget, uint256 premium, uint256 payoutAmount, uint256 expirationTime)'),
                    args: { policyholder: userAddress },
                    fromBlock: BigInt(0),
                    toBlock: 'latest'
                });

                const txMap: Record<string, string> = {};
                purchasedLogs.forEach(log => {
                    const pid = (log as any).args.policyId;
                    if (pid) txMap[pid.toLowerCase()] = log.transactionHash;
                });

                for (const pid of ids) {
                    try {
                        const data = await publicClient.readContract({
                            address: CONTRACTS.ESCROW,
                            abi: ESCROW_ABI,
                            functionName: 'getPolicy',
                            args: [pid],
                        }) as any;

                        if (!data || !Array.isArray(data) || data.length < 7) continue;

                        const apiTarget = data[1] || "";
                        const isFlight = apiTarget.match(/^[A-Za-z]{2}\d{2,4}$/);
                        const isActive = data[5];
                        const isClaimed = data[6];
                        
                        // status: 0=active, 1=claimed, 2=expired
                        let status = 2; // Default Expired
                        if (isActive) status = 0;
                        else if (isClaimed) status = 1;

                        results.push({
                            policyId: pid,
                            product: isFlight ? 'flight' : 'weather',
                            productLabel: isFlight ? 'Travel Solutions' : 'Weather Index',
                            policyholder: data[0],
                            premium: data[2],
                            maxPayout: data[3],
                            status,
                            expiresAt: data[4],
                            identifier: apiTarget,
                            icon: isFlight ? 'Plane' : 'CloudRain',
                            txHash: txMap[pid.toLowerCase()]
                        });
                    } catch (e) {
                        console.error("Failed to fetch policy detail", pid, e);
                    }
                }

                setPolicies(results.sort((a, b) => Number(b.expiresAt - a.expiresAt)));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [address, isConnected, policyIds, publicClient]);

    const activePolicies = policies.filter(p => p.status === 0);
    const claimedPolicies = policies.filter(p => p.status === 1);
    const expiredPolicies = policies.filter(p => p.status === 2);

    return {
        policies,
        activePolicies,
        claimedPolicies,
        expiredPolicies,
        totalVotingPower,
        isLoading: isLoading || listLoading,
        error,
        refetch
    };
}
