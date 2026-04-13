import { useState, useCallback } from 'react';
import { 
    encodeFunctionData, 
    type Address, 
    type Hash,
    type Abi,
    parseUnits 
} from 'viem';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { toast } from 'sonner';

interface ExecuteParams {
    address: Address;
    abi: Abi;
    functionName: string;
    args?: any[];
    value?: bigint;
}

/**
 * Hook for executing gasless transactions sponsored by Pimlico Paymaster.
 * Requires "Smart Wallets" to be enabled and "Paymaster" configured in Privy Dashboard.
 */
export function useSponsoredTx() {
    const { client } = useSmartWallets();
    const [isExecuting, setIsExecuting] = useState(false);
    const [txHash, setTxHash] = useState<Hash | null>(null);

    /**
     * Executes a generic contract call where gas is sponsored.
     */
    const sendSponsoredTransaction = useCallback(async ({ 
        address, 
        abi, 
        functionName, 
        args = [], 
        value = 0n 
    }: ExecuteParams) => {
        if (!client) {
            toast.error("Smart account not initialized. Please log in.");
            return;
        }

        setIsExecuting(true);
        setTxHash(null);

        try {
            toast.info(`Constructing UserOperation for ${functionName}...`);

            // Encode the function data
            const data = encodeFunctionData({
                abi,
                functionName,
                args,
            });

            /**
             * Privy's Smart Wallet client automatically handles:
             * 1. UserOp construction
             * 2. Sponsorship from Pimlico (if configured in Dashboard)
             * 3. Bundling to the sequencer
             */
            const hash = await client.sendTransaction({
                to: address,
                data,
                value,
            });

            setTxHash(hash);
            toast.success(`${functionName} submitted successfully!`);
            console.log(`Sponsored Tx [${functionName}] Hash:`, hash);
            return hash;

        } catch (error: any) {
            console.error("Sponsored Transaction Error:", error);
            
            if (error.message?.includes('user rejected')) {
                toast.error("Transaction rejected by user.");
            } else if (error.message?.includes('paymaster')) {
                toast.error("Gas sponsorship failed. Insufficient paymaster balance.");
            } else {
                toast.error(error.message || "Failed to execute sponsored transaction.");
            }
            throw error;
        } finally {
            setIsExecuting(false);
        }
    }, [client]);

    /**
     * Convenience helper for buying protection policies (legacy support)
     */
    const buyProtectionPolicy = useCallback(async (premium: number) => {
        const dummyAbi = [{
            inputs: [{ name: "premium", type: "uint256" }],
            name: "buyProtectionPolicy",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        }];
        
        return sendSponsoredTransaction({
            address: (process.env.NEXT_PUBLIC_ESCROW_ADDRESS || process.env.NEXT_PUBLIC_PROTOCOL_ADDRESS) as Address,
            abi: dummyAbi,
            functionName: 'buyProtectionPolicy',
            args: [parseUnits(premium.toString(), 6)],
        });
    }, [sendSponsoredTransaction]);

    return {
        sendSponsoredTransaction,
        buyProtectionPolicy,
        isExecuting,
        txHash,
        smartAccount: client?.account?.address,
        isConnected: !!client,
    };
}
