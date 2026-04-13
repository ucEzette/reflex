import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const flightIata = searchParams.get("flight_iata");
    const flightDate = searchParams.get("flight_date"); // YYYY-MM-DD

    if (!flightIata) {
        return NextResponse.json(
            { error: "Flight IATA code is required" },
            { status: 400 }
        );
    }

    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "Aviationstack API key not configured" },
            { status: 500 }
        );
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Build URL (AviationStack free tier doesn't allow historical queries via param)
        const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightIata}`;

        const response = await fetch(url, {
            signal: controller.signal,
            cache: "no-store",
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(
                `Aviationstack API responded with status: ${response.status}`
            );
        }

        const data = await response.json();

        if (data.error) {
            return NextResponse.json(
                { error: data.error.message || "API returned an error" },
                { status: 502 }
            );
        }

        if (!data.data || data.data.length === 0) {
            return NextResponse.json(
                {
                    error: flightDate
                        ? `Flight ${flightIata.toUpperCase()} not found for ${flightDate}`
                        : `Flight ${flightIata.toUpperCase()} not found or not active`,
                },
                { status: 404 }
            );
        }

        // Find best match — prefer the one matching the requested date
        let flight = data.data[0];
        if (flightDate && data.data.length > 1) {
            const dateMatch = data.data.find(
                (f: any) => f.flight_date === flightDate
            );
            if (dateMatch) flight = dateMatch;
        }

        const delayMinutes = flight.arrival?.delay || 0;

        return NextResponse.json({
            airline: flight.airline?.name || "Unknown Airline",
            airlineIata: flight.airline?.iata || "",
            flightNumber: flight.flight?.iata || flightIata.toUpperCase(),
            flightDate: flight.flight_date || flightDate || "",
            status: flight.flight_status || "unknown",
            aircraft: flight.aircraft?.registration || null,
            aircraftType: flight.aircraft?.iata || null,
            live: flight.live || null,
            departure: {
                airport: flight.departure?.airport || "Unknown",
                iata: flight.departure?.iata || "",
                terminal: flight.departure?.terminal || null,
                gate: flight.departure?.gate || null,
                scheduled: flight.departure?.scheduled || null,
                estimated: flight.departure?.estimated || null,
                actual: flight.departure?.actual || null,
                delay: flight.departure?.delay || 0,
                timezone: flight.departure?.timezone || "",
            },
            arrival: {
                airport: flight.arrival?.airport || "Unknown",
                iata: flight.arrival?.iata || "",
                terminal: flight.arrival?.terminal || null,
                gate: flight.arrival?.gate || null,
                scheduled: flight.arrival?.scheduled || null,
                estimated: flight.arrival?.estimated || null,
                actual: flight.arrival?.actual || null,
                delay: delayMinutes,
                timezone: flight.arrival?.timezone || "",
            },
            isDelayedOver2Hours: delayMinutes >= 120,
        });
    } catch (error: any) {
        if (error.name === "AbortError") {
            return NextResponse.json(
                { error: "Flight lookup timed out — please try again" },
                { status: 504 }
            );
        }
        console.error("Error fetching flight data:", error);
        return NextResponse.json(
            { error: "Failed to validate flight against Aviationstack" },
            { status: 500 }
        );
    }
}
