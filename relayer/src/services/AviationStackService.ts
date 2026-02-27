import { FlightData } from "../types";
import { withRetry } from "../utils/retry";

export class AviationStackService {
    private readonly baseUrl = "http://api.aviationstack.com/v1/flights";

    constructor(private readonly apiKey: string) { }

    async queryFlightStatus(apiTarget: string): Promise<FlightData | null> {
        const flightCode = apiTarget.replace(/^flights\//, "").toUpperCase();
        const url = `${this.baseUrl}?access_key=${this.apiKey}&flight_iata=${flightCode}`;

        return withRetry(
            async () => {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`AviationStack API error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json() as { data: any[] };
                const flights = data.data;

                if (!flights || flights.length === 0) {
                    console.warn(`[Aviationstack] No flight data found for: ${flightCode}`);
                    return null;
                }

                const flight = flights[0];
                const delayMinutes = flight.arrival?.delay || 0;

                return {
                    flightId: flight.flight?.iata || flightCode,
                    flightDate: flight.flight_date || "",
                    scheduledArrival: flight.arrival?.scheduled || "",
                    actualArrival: flight.arrival?.actual || "",
                    delaySeconds: delayMinutes * 60,
                    status: flight.flight_status || "unknown",
                };
            },
            {
                onRetry: (error, attempt) => {
                    console.warn(`[Aviationstack] Retry attempt ${attempt} for ${flightCode}: ${error.message}`);
                }
            }
        );
    }
}
