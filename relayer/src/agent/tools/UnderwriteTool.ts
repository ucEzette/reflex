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
 * Autonomous Tool: UnderwriteTool
 * Allows the WDK Agent to modify the core RISK_RATE_MAP on-chain 
 * in response to macroeconomic weather or aviation anomalies.
 */
export const createUnderwriteTool = (wallet: any) => tool({
    description: 'Dynamically update the Protocol Margin or Risk Premium for a specific insurance product on the Reflex L1 smart contracts.',
    parameters: z.object({
        productTarget: z.enum(['TravelSolutions', 'AgricultureIndex', 'EnergySolutions', 'MaritimeSolutions', 'CatastropheProximity']),
        newRiskMarginBps: z.number().min(100).max(10000).describe('The new protocol margin in basis points (100 = 1%). Must be scaled linearly against the detected anomaly risk.'),
        reasoning: z.string().describe('The LLMs justification for executing the pricing change (e.g., "Category 5 Hurricane approaching Florida coast").')
    }),
    execute: async ({ productTarget, newRiskMarginBps, reasoning }: any) => {
        logger.warn(`🚨 AGENT UNDERWRITING DECISION: Adjusting ${productTarget} margin to ${newRiskMarginBps} bps!`);
        logger.info(`🧠 Agent Reasoning: ${reasoning}`);

        try {
            // Setup an ethers contract instance wrapping the WDK wallet
            const provider = new ethers.BrowserProvider(wallet.getProvider() as any);
            const signer = await provider.getSigner();

            // Map product target to specific contract address from environment
            let contractAddress = '';
            switch (productTarget) {
                case 'TravelSolutions': contractAddress = process.env.TRAVEL_CONTRACT_ADDRESS || ''; break;
                case 'AgricultureIndex': contractAddress = process.env.AGRI_CONTRACT_ADDRESS || ''; break;
                case 'EnergySolutions': contractAddress = process.env.ENERGY_CONTRACT_ADDRESS || ''; break;
                case 'MaritimeSolutions': contractAddress = process.env.MARITIME_CONTRACT_ADDRESS || ''; break;
                case 'CatastropheProximity': contractAddress = process.env.CAT_CONTRACT_ADDRESS || ''; break;
            }

            if (!contractAddress) {
                throw new Error(`Contract address not found for product: ${productTarget}`);
            }

            const PRODUCT_ABI = ["function updateProtocolMargin(uint256 newMargin) external"];
            const productContract = new ethers.Contract(contractAddress, PRODUCT_ABI, signer);

            logger.info(`Broadcasting updateProtocolMargin(${newRiskMarginBps}) to ${contractAddress}...`);
            const tx = await productContract.updateProtocolMargin(newRiskMarginBps);
            
            logger.info(`Transaction broadcasted. Hash: ${tx.hash}. Waiting for confirmation...`);
            const receipt = await tx.wait();

            logger.info(`✅ WDK Agent successfully broadcasted risk update via Tether SDK. (Block: ${receipt.blockNumber})`);
            return {
                success: true,
                onChainConfirmation: tx.hash,
                error: undefined as string | undefined
            };

        } catch (error) {
            logger.error(`❌ Agent Underwriting failed during WDK broadcast: ${error}`);
            return {
                success: false,
                error: String(error),
                onChainConfirmation: undefined as string | undefined
            };
        }
    }
} as any);
