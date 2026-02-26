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
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage === "Flight not found" || errorMessage === "No active flights found for this query") {
            return NextResponse.json({ error: errorMessage }, { status: 404 });
        }
        if (errorMessage.includes("Payment Required")) {
            return NextResponse.json({ error: errorMessage }, { status: 402 });
        }

        console.error("Flight search error:", error);
        return NextResponse.json(
            { error: "Failed to fetch flight data", details: errorMessage },
            { status: 500 }
        );
    }
}
