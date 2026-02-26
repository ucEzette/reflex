import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const flightIata = searchParams.get("flight_iata");

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
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(
            `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightIata}`,
            {
                signal: controller.signal,
                cache: "no-store"
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Aviationstack API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            return NextResponse.json(
                { error: "Flight not found or not active today" },
                { status: 404 }
            );
        }

        // Return the first matching flight (most relevant for today)
        const flight = data.data[0];

        return NextResponse.json({
            airline: flight.airline?.name || "Unknown Airline",
            flightNumber: flight.flight?.iata,
            flightDate: flight.flight_date,
            status: flight.flight_status,
            aircraft: flight.aircraft?.registration,
            departure: {
                airport: flight.departure?.airport,
                iata: flight.departure?.iata,
                terminal: flight.departure?.terminal,
                gate: flight.departure?.gate,
                scheduled: flight.departure?.scheduled,
                timezone: flight.departure?.timezone,
            },
            arrival: {
                airport: flight.arrival?.airport,
                iata: flight.arrival?.iata,
                terminal: flight.arrival?.terminal,
                gate: flight.arrival?.gate,
                scheduled: flight.arrival?.scheduled,
                timezone: flight.arrival?.timezone,
            }
        });
    } catch (error) {
        console.error("Error fetching flight data:", error);
        return NextResponse.json(
            { error: "Failed to validate flight against Aviationstack" },
            { status: 500 }
        );
    }
}
