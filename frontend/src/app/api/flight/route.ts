import { NextResponse } from "next/server";

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
        const response = await fetch(
            `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightIata}`
        );

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
            departure: {
                airport: flight.departure?.airport,
                iata: flight.departure?.iata,
                scheduled: flight.departure?.scheduled,
                timezone: flight.departure?.timezone,
            },
            arrival: {
                airport: flight.arrival?.airport,
                iata: flight.arrival?.iata,
                scheduled: flight.arrival?.scheduled,
                timezone: flight.arrival?.timezone,
            },
            status: flight.flight_status,
        });
    } catch (error) {
        console.error("Error fetching flight data:", error);
        return NextResponse.json(
            { error: "Failed to validate flight against Aviationstack" },
            { status: 500 }
        );
    }
}
