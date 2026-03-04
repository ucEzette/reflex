import axios from "axios";
import { logger } from "../utils/logger";

export class WeatherService {
    constructor(
        private readonly noaaApiKey: string,
        private readonly owmApiKey: string
    ) { }

    async getRainfall(zone: string): Promise<number | null> {
        try {
            // Production-grade date range (last 90 days for trend analysis)
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];

            logger.info({ zone, startDate, endDate }, "Fetching rainfall data from NOAA");

            const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&stationid=GHCND:${zone}&startdate=${startDate}&enddate=${endDate}&limit=1000`;

            const response = await axios.get(url, {
                headers: { token: this.noaaApiKey },
                timeout: 5000 // 5s timeout for production reliability
            });

            const readings = response.data.results || [];
            if (readings.length === 0) {
                logger.warn({ zone }, "No rainfall readings returned from NOAA for this zone");
                return 0;
            }

            // NOAA reports in tenths of mm, we convert to mm
            const totalRainfall = readings.reduce((sum: number, r: any) => sum + (r.value || 0), 0) / 10;
            logger.info({ zone, totalRainfall }, "Rainfall data retrieved successfully");

            return totalRainfall;
        } catch (error: any) {
            if (error.response?.status === 429) {
                logger.error("NOAA API Rate limit exceeded. Check subscription.");
            }
            logger.error({ zone, error: error.message }, "Error fetching rainfall data from NOAA");
            return null;
        }
    }

    async getTemperature(lat: string, lon: string): Promise<number | null> {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.owmApiKey}`;
            const response = await axios.get(url, { timeout: 3000 });

            if (response.data && response.data.main) {
                const temp = response.data.main.temp;
                logger.info({ lat, lon, temp }, "Temperature retrieved from OpenWeatherMap");
                return temp;
            }
            return null;
        } catch (error: any) {
            logger.error({ lat, lon, error: error.message }, "Error fetching temperature from OpenWeatherMap");
            return null;
        }
    }
}
