import { logger } from "../utils/logger";
import { WeatherService } from "./WeatherService";

export interface RiskMultipliers {
    marketId: string;
    multiplier: number; // e.g. 1.5 for 150%
    reason: string;
    timestamp: number;
}

export class RiskEngineService {
    constructor(private readonly weatherService: WeatherService) {}

    /**
     * Calculates the dynamic multiplier for a specific market based on real-time factors.
     */
    async calculateMarketRisk(marketId: string, lat: string, lon: string): Promise<RiskMultipliers> {
        const indicators = await this.weatherService.getRiskIndicators(lat, lon);
        
        let multiplier = 1.0;
        let reason = "Standard Risk Profile";

        if (!indicators) {
            return { marketId, multiplier, reason, timestamp: Date.now() };
        }

        // 1. Flight / Travel Risk (Wind Speed)
        if (marketId === "flight" || marketId === "maritime") {
            if (indicators.windSpeed > 15) { // Over 15m/s (approx 30kt) is high risk for delays
                multiplier = 2.0;
                reason = "Extreme Wind Alert - Arrival Latency Risk Highly Elevated";
            } else if (indicators.windSpeed > 10) {
                multiplier = 1.4;
                reason = "Moderate Winds - Increased Operational Delay Probability";
            }
        }

        // 2. Agriculture / Weather Risk (Rain Probability)
        if (marketId === "agri") {
            if (indicators.rainProbability < 20) {
                multiplier = 1.8;
                reason = "Severe Drought Outlook - Soil Hydration Index Below Safe Margin";
            }
        }

        // 3. Energy Risk (Temperature Heatwave)
        if (marketId === "energy" || marketId === "heat-wave") {
            if (indicators.temperature > 38) {
                multiplier = 2.5;
                reason = "Critical Thermal Event - Grid Stability & Cooling Demand Spike";
            } else if (indicators.temperature > 34) {
                multiplier = 1.6;
                reason = "Above Optimal Thermal Operational Threshold";
            }
        }

        // 4. Catastrophe (Simulated Seismic risk based on recent activity polling if available)
        if (marketId === "cat") {
            // For demo: multiplier based on "simulated" proximity to fault lines in high-activity periods
            multiplier = 1.25;
            reason = "Elevated Seismic Micro-Volatility - Proximity Surge Active";
        }

        // 5. Powder Protect (Snow depth/forecast)
        if (marketId === "powder-protect") {
            if (indicators.temperature > 2) {
                multiplier = 2.0;
                reason = "Thaw Warning - Base Depth Integrity at Alpine Risk";
            }
        }

        // 6. Peg Shield (Stablecoin Deviation - Mocked via Price Feed Simulation)
        if (marketId === "peg-shield") {
            // In a real scenario, we'd hook into a price feed
            multiplier = 1.15;
            reason = "Liquidity Depth Variance Detected - Peg Stability Premium Applied";
        }

        // 7. Sun Yield (Solar Irradiance)
        if (marketId === "sun-yield") {
            if (indicators.rainProbability > 70) { // High clouds/rain = low solar output
                multiplier = 1.45;
                reason = "Persistent Cloud Cover - Irradiance Output Below Forecast";
            }
        }

        // 8. Freight Wait (Port Congestion)
        if (marketId === "freight-wait") {
            if (indicators.windSpeed > 20) {
                multiplier = 1.75;
                reason = "Port Congestion Emergency - Vessel Berthing Delayed by Gale Conditions";
            }
        }

        logger.info({ marketId, multiplier, reason }, "Dynamic risk calculation complete");

        return {
            marketId,
            multiplier,
            reason,
            timestamp: Date.now()
        };
    }
}
