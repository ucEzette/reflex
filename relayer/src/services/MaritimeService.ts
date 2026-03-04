import axios from "axios";
import { logger } from "../utils/logger";

export class MaritimeService {
    constructor(private readonly stormglassApiKey: string) { }

    /**
     * Fetches current wind speed for a target port using Stormglass.io
     * @param lat Latitude of the port
     * @param lon Longitude of the port
     * @returns Wind speed in knots
     */
    async getWindSpeed(lat: number, lon: number): Promise<number | null> {
        try {
            const params = 'windSpeed';
            const url = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${params}`;

            const response = await axios.get(url, {
                headers: {
                    'Authorization': this.stormglassApiKey
                }
            });

            // Stormglass returns multiple sources, we'll take the 'noaa' source or the first available
            const data = response.data.hours?.[0];
            if (!data || !data.windSpeed) {
                logger.warn({ lat, lon }, "No wind speed data found for coordinates");
                return null;
            }

            // Stormglass wind speed is in meters per second by default, convert to knots
            // 1 m/s = 1.94384 knots
            const windSpeedMs = data.windSpeed.noaa || Object.values(data.windSpeed)[0];
            const windSpeedKnots = parseFloat(windSpeedMs) * 1.94384;

            return windSpeedKnots;
        } catch (error: any) {
            logger.error({ lat, lon, error: error.message }, "Error fetching wind speed from Stormglass");
            return null;
        }
    }
}
