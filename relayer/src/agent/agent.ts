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
import { WeatherService } from '../services/WeatherService';
import { AviationStackService } from '../services/AviationStackService';
import { OracleAggregatorService } from '../services/OracleAggregatorService';
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
    private weather: WeatherService;
    private aviation: OracleAggregatorService;

    constructor(blockchain: BlockchainService, weather: WeatherService, aviation: OracleAggregatorService) {
        this.blockchain = blockchain;
        this.weather = weather;
        this.aviation = aviation;
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
                1. Monitor Aave V3 yield. If highly profitable (e.g. profit > 100 USDT), execute 'harvestYield'.
                2. Monitor real-world meteorological and aviation data. If an anomaly is detected, execute 'underwriteRisk' to adjust margins.
                
                You have a self-custodial Tether WDK wallet loaded with AVAX and USDT. Always execute the most appropriate tool based on the provided scenario data. Provide a brilliant, succinct summary of your decision.`,
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
                const profitUsdt = Number(stats.profit) / 1e6;

                // 2. Fetch Real-World Oracle Data (Risk Check)
                // Demo coordinates: Miami, FL (Hurricane zone) and Iowa (Agri zone)
                const temperature = await this.weather.getTemperature("25.7617", "-80.1918");
                const rainfall = await this.weather.getRainfall("41.8780,-93.0977"); // Random Iowa bbox
                
                // Demo flight check (JFK to LHR)
                const flight = await this.aviation.queryFlightStatus("flights/BA112");
                const flightDelay = flight ? Math.floor(flight.delaySeconds / 60) : 0; // delay in mins

                // 3. Construct live context for LLM
                const scenario = `
                [BLOCKCHAIN STATE]
                - Liquidity Pool: ${stats.totalAssets.toString()} assets, ${stats.totalShares.toString()} shares.
                - Harvestable Yield: ${profitUsdt.toFixed(2)} USDT.
                
                [MARKET SENTIMENT (LIVE ORACLES)]
                - Miami FL Temperature: ${temperature !== null ? temperature : 'N/A'}°C
                - Iowa Rainfall (Last 24h): ${rainfall !== null ? rainfall : 'N/A'} mm
                - JFK->LHR Aviation Delay: ${flightDelay} minutes
                `;

                // Only evaluate if there's actually something interesting to save API costs
                // Thresholds: Profit > 50 USDT, Temp > 35C (heatwave), Rain > 100mm (flood), Flight delay > 120 mins
                const isProfitable = profitUsdt > 50;
                const isWeatherAnomaly = (temperature !== null && temperature > 35) || (rainfall !== null && rainfall > 100);
                const isAviationAnomaly = flightDelay > 120;

                if (isProfitable || isWeatherAnomaly || isAviationAnomaly) {
                    await this.evaluateEcosystem(scenario);
                } else {
                    logger.debug(`Agent checked state: No action required (Yield: $${profitUsdt.toFixed(2)}, Temp: ${temperature}°C, Rain: ${rainfall}mm, Delay: ${flightDelay}m).`);
                }

            } catch (error) {
                logger.error(`❌ Monitor loop error: ${error}`);
            }
        }, 150000); // Poll every 2.5 minutes
    }
}


