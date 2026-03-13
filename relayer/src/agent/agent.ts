import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { pino } from 'pino';

// Initialize Groq via OpenAI SDK wrapper
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
});

import { createUnderwriteTool } from './tools/UnderwriteTool';
import { createHarvestTool } from './tools/HarvestTool';
import { BlockchainService } from '../services/BlockchainService';
import * as dotenv from 'dotenv';

dotenv.config();

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
});
export class ReflexAutonomousAgent {
    private walletManager: any = null;
    private account: any = null;
    private address: string = '';
    private blockchain: BlockchainService;

    constructor(blockchain: BlockchainService) {
        this.blockchain = blockchain;
        if (!process.env.GROQ_API_KEY) {
            logger.warn('⚠️ GROQ_API_KEY is missing. Autonomous Agent will hibernate.');
            return;
        }

        if (!process.env.AGENT_MNEMONIC) {
            logger.warn('⚠️ AGENT_MNEMONIC is missing. Please provide a 12 or 24-word seed phrase.');
            return;
        }

        this.initWallet();
    }

    private async initWallet() {
        try {
            logger.info('Initializing Tether WDK WalletManagerEvm for Autonomous Agent...');

            // Bypass tsc require transpilation for ESM import
            const dynamicImport = new Function('specifier', 'return import(specifier)');
            const WDK = await dynamicImport('@tetherto/wdk-wallet-evm');
            const WalletManagerEvm = WDK.default;

            const wdkWalletConfig = {
                provider: process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
            };

            // Initialize self-custodial Tether WDK WalletManager
            this.walletManager = new WalletManagerEvm(
                process.env.AGENT_MNEMONIC!,
                wdkWalletConfig as any
            );

            this.account = await this.walletManager.getAccount("0'/0/0");
            this.address = this.account.address;
            logger.info(`✅ Agent WDK Wallet Initialized: ${this.address}`);

        } catch (error) {
            logger.error(`❌ Failed to initialize WDK Wallet: ${error}`);
        }
    }

    public async evaluateEcosystem(simulatedScenario: string) {
        if (!this.account) {
            logger.warn('⚠️ Agent wallet not initialized. Cannot evaluate ecosystem.');
            return;
        }

        logger.info(`\n🧠 Agent evaluating Reflex L1 ecosystem conditions...`);

        try {
            const { text } = await generateText({
                model: groq('llama-3.3-70b-versatile'),
                system: `You are the Autonomous Risk and Treasury Agent for Reflex L1, a decentralized parametric micro-insurance protocol.
                Your primary objectives are:
                1. Monitor Aave V3 yield. If highly profitable (e.g. profit > 100 USDC), execute 'harvestYield'.
                2. Monitor real-world meteorological and aviation data. If an anomaly is detected, execute 'underwriteRisk' to adjust margins.
                
                You have a self-custodial Tether WDK wallet loaded with AVAX and USDC. Always execute the most appropriate tool based on the provided scenario data. Provide a brilliant, succinct summary of your decision.`,
                prompt: `Analyze the following blockchain state and off-chain market sentiment. Determine the optimal on-chain action:\n${simulatedScenario}`,
                tools: {
                    underwriteRisk: createUnderwriteTool(this.account),
                    harvestYield: createHarvestTool(this.account)
                }
            });

            logger.info(`💡 Agent Final Summary: ${text}`);

        } catch (error) {
            logger.error(`❌ Agent evaluation failed: ${error}`);
        }
    }

    /**
     * @notice Production loop that polls the blockchain and triggers agent evaluation
     */
    public async monitorEcosystem() {
        logger.info('🚀 Autonomous Performance Loop started.');

        setInterval(async () => {
            try {
                // 1. Fetch live pool stats (Harvest check)
                const stats = await this.blockchain.getPoolStats();
                const profitUsdc = Number(stats.profit) / 1e6;

                // 2. Construct live context for LLM
                const scenario = `
                [BLOCKCHAIN STATE]
                - Liquidity Pool: ${stats.totalAssets.toString()} assets, ${stats.totalShares.toString()} shares.
                - Harvestable Yield: ${profitUsdc.toFixed(2)} USDC.
                
                [MARKET SENTIMENT]
                - External meteorology looks stable.
                - Aviation traffic is normal.
                `;

                // Only evaluate if there's actually something interesting (yield crossing threshold)
                // Note: Keeper/Settlement is explicitly left to human intervention
                if (profitUsdc > 1) {
                    await this.evaluateEcosystem(scenario);
                } else {
                    logger.debug('Agent checked state: No immediate action required (Yield low).');
                }

            } catch (error) {
                logger.error(`❌ Monitor loop error: ${error}`);
            }
        }, 150000); // Poll every 2.5 minutes
    }
}


