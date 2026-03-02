// Chainlink Functions: FlightAware AeroAPI Delay Checker
// Fetches live flight status from FlightAware AeroAPI v3 to determine
// if a flight's arrival delay exceeds 120 minutes for binary payout trigger.
// Used by: TravelSolutions.sol executeClaim()

const flightId = args[0]; // FlightAware fa_flight_id or ICAO ident (e.g. "EK202")
const flightDate = args[1]; // Expected format: YYYY-MM-DD

if (!flightId || !flightDate) {
    throw Error("Missing flight ID or date arguments");
}

const apiKey = secrets.flightAwareApiKey;
if (!apiKey) {
    throw Error("Missing FlightAware API key in DON secrets");
}

console.log(`Checking flight: ${flightId} on date: ${flightDate}`);

// AeroAPI v3 endpoint — fetches flights by ident within a date range
const url = `https://aeroapi.flightaware.com/aeroapi/flights/${flightId}?start=${flightDate}T00:00:00Z&end=${flightDate}T23:59:59Z`;

const flightRequest = Functions.makeHttpRequest({
    url: url,
    method: "GET",
    headers: {
        "x-apikey": apiKey
    }
});

const flightResponse = await flightRequest;

if (flightResponse.error) {
    console.error(flightResponse.error);
    throw Error("FlightAware AeroAPI request failed");
}

const flights = flightResponse.data.flights;
if (!flights || flights.length === 0) {
    throw Error("No flights found for this ident on the specified date");
}

// Use the first matching flight
const flight = flights[0];

// Calculate arrival delay in minutes
let delayMinutes = 0;
if (flight.actual_in && flight.scheduled_in) {
    const actualArrival = new Date(flight.actual_in).getTime();
    const scheduledArrival = new Date(flight.scheduled_in).getTime();
    delayMinutes = Math.max(0, (actualArrival - scheduledArrival) / 60000);
} else if (flight.arrival_delay !== undefined) {
    delayMinutes = flight.arrival_delay / 60; // API returns seconds
}

console.log(`Flight ${flightId} delay: ${delayMinutes} minutes`);

// Binary trigger: payout if delay >= 120 minutes (2 hours)
const isDelayed = delayMinutes >= 120;

return Functions.encodeUint256(isDelayed ? 1 : 0);
