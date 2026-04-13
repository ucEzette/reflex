import { tool } from 'ai';
import { z } from 'zod';
import { pino } from 'pino';
import { ethers } from 'ethers';


const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
});

/**
 * Autonomous Tool: HarvestTool
 * Evaluates the Aave V3 APY and Avalanche Fuji gas fees.
 * Allows the WDK Agent to execute `harvestYield()` on the `ReflexLiquidityPool` 
 * via the Tether WDK wallet when the mathematical delta is optimal.
 */
export const createHarvestTool = (wallet: any) => tool({
    description: 'Execute the harvestYield function on the ReflexLiquidityPool to sweep idle Aave V3 interest into the Protocol Treasury. Only execute this if the expected yield profit exceeds gas costs.',
    parameters: z.object({
        expectedProfitUsdt: z.number().describe('The estimated profit in USDT after subtracting gas costs.'),
        poolAddress: z.string().startsWith('0x').length(42).describe('The contract address of the ReflexLiquidityPool.')
    }),
    execute: async ({ expectedProfitUsdt, poolAddress }: any) => {
        logger.info(`🤖 AGENT HARVEST INITIATED: Sweeping Yield from Aave V3 Pool...`);

        if (expectedProfitUsdt <= 0) {
            logger.warn('⚠️ Agent aborted harvest: Expected profit is 0 or negative.');
            return {
                success: false,
                error: 'Unprofitable transaction.',
                onChainConfirmation: undefined as string | undefined
            };
        }

        try {
            // Setup an ethers contract instance wrapping the WDK wallet
            // The WDK EVM wallet provider can act as a standard EIP-1193 provider
            const provider = new ethers.BrowserProvider(wallet.getProvider() as any);
            const signer = await provider.getSigner();

            const POOL_ABI = ["function harvestYield() external"];
            const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);

            logger.info('Broadcasting harvestYield transaction to Avalanche Fuji...');
            const tx = await poolContract.harvestYield();
            
            logger.info(`Transaction broadcasted. Hash: ${tx.hash}. Waiting for confirmation...`);
            const receipt = await tx.wait();

            logger.info(`✅ WDK Agent successfully harvested $${expectedProfitUsdt} USDT profit. (Block: ${receipt.blockNumber})`);
            return {
                success: true,
                onChainConfirmation: tx.hash,
                error: undefined as string | undefined
            };

        } catch (error) {
            logger.error(`❌ Agent Harvest execution failed during WDK broadcast: ${error}`);
            return {
                success: false,
                error: String(error),
                onChainConfirmation: undefined as string | undefined
            };
        }
    }
} as any);
