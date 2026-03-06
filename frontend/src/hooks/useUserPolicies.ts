"use client";

import { useAccount, useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { PRODUCT_ABI, GENERIC_PRODUCT_ABI } from '@/lib/enterprise_abis';
import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { avalancheFuji } from 'viem/chains';

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
    const { address, isConnected } = useAccount();
    const [policies, setPolicies] = useState<UserPolicy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isConnected || !address) {
            setPolicies([]);
            return;
        }

        const fetchPolicies = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const client = createPublicClient({
                    chain: avalancheFuji,
                    transport: http(),
                });

                const allPolicies: UserPolicy[] = [];

                for (const config of PRODUCT_CONFIGS) {
                    try {
                        const eventAbi = config.isTravel ? travelPolicyCreatedEvent : policyCreatedEvent;

                        const logs = await client.getLogs({
                            address: config.contract,
                            event: eventAbi,
                            args: { holder: address },
                            fromBlock: 'earliest',
                            toBlock: 'latest',
                        });

                        for (const log of logs) {
                            const policyId = log.args.id as `0x${string}`;
                            if (!policyId) continue;

                            // Read current policy status from contract
                            try {
                                const data = (await client.readContract({
                                    address: config.contract,
                                    abi: config.isTravel ? PRODUCT_ABI : GENERIC_PRODUCT_ABI,
                                    functionName: 'policies' as any,
                                    args: [policyId],
                                })) as unknown as any[];

                                if (!data || !data[0]) continue;

                                allPolicies.push({
                                    policyId,
                                    product: config.key,
                                    productLabel: config.label,
                                    policyholder: data[0] as string,
                                    premium: data[1] as bigint,
                                    maxPayout: data[2] as bigint,
                                    status: Number(data[3]),
                                    expiresAt: data[4] as bigint,
                                    identifier: (data[5] as string) || '',
                                    icon: config.icon,
                                });
                            } catch {
                                // Policy may not have a readable struct
                            }
                        }
                    } catch {
                        // Contract may not be deployed yet
                    }
                }

                // Sort by expiry descending (most recent first)
                allPolicies.sort((a, b) => Number(b.expiresAt - a.expiresAt));
                setPolicies(allPolicies);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch policies');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPolicies();
    }, [address, isConnected]);

    const activePolicies = policies.filter(p => p.status === 0);
    const claimedPolicies = policies.filter(p => p.status === 1);
    const expiredPolicies = policies.filter(p => p.status === 2);

    const totalPremiumsPaid = policies.reduce((sum, p) => sum + p.premium, BigInt(0));
    const totalPayoutsReceived = claimedPolicies.reduce((sum, p) => sum + p.maxPayout, BigInt(0));

    return {
        policies,
        activePolicies,
        claimedPolicies,
        expiredPolicies,
        totalPremiumsPaid,
        totalPayoutsReceived,
        isLoading,
        error,
    };
}
