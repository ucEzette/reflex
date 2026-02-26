export enum FlightStatus {
    ACTIVE = 'ACTIVE',
    SCHEDULED = 'SCHEDULED',
    DELAYED = 'DELAYED',
    LANDED = 'LANDED',
    UNKNOWN = 'UNKNOWN'
}

export interface UnifiedFlightData {
    flightNumber: string;
    flightId: string;
    origin: string;
    destination: string;
    scheduledDeparture: string;
    estimatedDeparture: string;
    status: FlightStatus;
}

const mapStatus = (rawStatus?: string): FlightStatus => {
    if (!rawStatus) return FlightStatus.UNKNOWN;
    const statusLower = rawStatus.toLowerCase();

    if (statusLower.includes('en route') || statusLower.includes('active')) return FlightStatus.ACTIVE;
    if (statusLower.includes('scheduled')) return FlightStatus.SCHEDULED;
    if (statusLower.includes('delayed')) return FlightStatus.DELAYED;
    if (statusLower.includes('arrived') || statusLower.includes('landed') || statusLower.includes('completed')) return FlightStatus.LANDED;

    return FlightStatus.UNKNOWN;
};

export const searchFlight = async (query: string): Promise<UnifiedFlightData> => {
    const apiKey = process.env.FLIGHTAWARE_API_KEY;

    if (!apiKey) {
        throw new Error("FlightAware API key not configured");
    }

    // fa_flight_id format typically contains hyphens and is long, e.g., UAL123-1730955600-schedule-0001
    const isFaFlightId = query.includes('-') && query.length > 10;

    const url = `https://aeroapi.flightaware.com/aeroapi/flights/${encodeURIComponent(query)}`;

    const response = await fetch(url, {
        headers: {
            'x-apikey': apiKey,
            'Accept': 'application/json'
        },
        cache: 'no-store'
    });

    if (response.status === 404) {
        throw new Error("Flight not found");
    }

    if (response.status === 402) {
        throw new Error("Payment Required: Quota exceeded");
    }

    if (!response.ok) {
        throw new Error(`FlightAware API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.flights || data.flights.length === 0) {
        throw new Error("No active flights found for this query");
    }

    // Sort to prioritize next upcoming or active flight
    let targetFlight = data.flights[0];

    if (!isFaFlightId && data.flights.length > 1) {
        // Find the first active or scheduled flight, ignoring past ones
        const activeOrScheduled = data.flights.find((f: { status: string }) => {
            const status = (f.status || '').toLowerCase();
            return status.includes('en route') || status.includes('active') || status.includes('scheduled') || status.includes('delayed');
        });

        if (activeOrScheduled) {
            targetFlight = activeOrScheduled;
        }
    }

    return {
        flightNumber: targetFlight.ident_iata || targetFlight.ident || query,
        flightId: targetFlight.fa_flight_id,
        origin: targetFlight.origin?.code_iata || targetFlight.origin?.code || "UNKNOWN",
        destination: targetFlight.destination?.code_iata || targetFlight.destination?.code || "UNKNOWN",
        scheduledDeparture: targetFlight.scheduled_out || "",
        estimatedDeparture: targetFlight.estimated_out || "",
        status: mapStatus(targetFlight.status)
    };
};
