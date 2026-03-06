import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { pino } from 'pino';
import { createUnderwriteTool } from './tools/UnderwriteTool';
import { createKeeperTool } from './tools/KeeperTool';
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
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            logger.warn('⚠️ GOOGLE_GENERATIVE_AI_API_KEY is missing. Autonomous Agent will hibernate.');
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
                model: google('gemini-1.5-flash'),
                system: `You are the Autonomous Risk and Treasury Agent for Reflex L1, a decentralized parametric micro-insurance protocol.
                Your primary objectives are:
                1. Monitor Aave V3 yield. If highly profitable (e.g. profit > 100 USDC), execute 'harvestYield'.
                2. Monitor real-world meteorological and aviation data. If an anomaly is detected, execute 'underwriteRisk' to adjust margins.
                3. Monitor expired policies. If human relayers stall, execute 'processKeeperSettlement'.
                
                You have a self-custodial Tether WDK wallet loaded with AVAX and USDC. Always execute the most appropriate tool based on the provided scenario data. Provide a brilliant, succinct summary of your decision.`,
                prompt: `Analyze the following blockchain state and off-chain market sentiment. Determine the optimal on-chain action:\n${simulatedScenario}`,
                tools: {
                    underwriteRisk: createUnderwriteTool(this.account),
                    processKeeperSettlement: createKeeperTool(this.account),
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

                // 2. Fetch active policies (Keeper check)
                const policies = await this.blockchain.getActiveEnterprisePolicies();
                const expiredCount = policies.filter(p => p.status === 0 && Date.now() / 1000 > Number(p.expiresAt)).length;

                // 3. Construct live context for LLM
                const scenario = `
                [BLOCKCHAIN STATE]
                - Liquidity Pool: ${stats.totalAssets.toString()} assets, ${stats.totalShares.toString()} shares.
                - Harvestable Yield: ${profitUsdc.toFixed(2)} USDC.
                - Active Enterprise Policies: ${policies.length}.
                - Expired but unsettled policies: ${expiredCount}.
                
                [MARKET SENTIMENT]
                - External meteorology looks stable.
                - Aviation traffic is normal.
                `;

                // Only evaluate if there's actually something interesting (yield or expired policies)
                if (profitUsdc > 1 || expiredCount > 0) {
                    await this.evaluateEcosystem(scenario);
                } else {
                    logger.debug('Agent checked state: No immediate action required (Yield low, no expired policies).');
                }

            } catch (error) {
                logger.error(`❌ Monitor loop error: ${error}`);
            }
        }, 30000); // Poll every 30 seconds
    }
}


