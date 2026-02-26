import { useQuery } from '@tanstack/react-query';
import { mockPolicies, mockOracleLogs, mockTreasuryStats } from '../lib/mockData';

export function useActivePolicies() {
    return useQuery({
        queryKey: ['policies'],
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
            return mockPolicies;
        }
    });
}

export function useOracleFeed() {
    return useQuery({
        queryKey: ['oracleLogs'],
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return mockOracleLogs;
        },
        refetchInterval: 5000 // Polling
    });
}

export function useTreasuryStats() {
    return useQuery({
        queryKey: ['treasuryStats'],
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 600));
            return mockTreasuryStats;
        }
    });
}
