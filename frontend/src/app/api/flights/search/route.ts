import { NextResponse } from "next/server";
import { searchFlight } from "@/services/flightAware";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter is required (flight number or fa_flight_id)" },
            { status: 400 }
        );
    }

    try {
        const flightData = await searchFlight(query);
        return NextResponse.json(flightData);
    } catch (error: any) {
        if (error.message === "Flight not found" || error.message === "No active flights found for this query") {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error.message.includes("Payment Required")) {
            return NextResponse.json({ error: error.message }, { status: 402 });
        }

        console.error("Flight search error:", error);
        return NextResponse.json(
            { error: "Failed to fetch flight data", details: error.message },
            { status: 500 }
        );
    }
}
