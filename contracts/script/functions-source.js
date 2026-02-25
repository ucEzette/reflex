const flightIata = args[0];
const flightDate = args[1]; // Expected format: YYYY-MM-DD
const apiKey = secrets.aviationstackApiKey;

if (!apiKey) {
    throw Error("Missing Aviationstack API Key in DON secrets");
}

console.log(`Checking flight: ${flightIata} on date: ${flightDate}`);

const apiResponse = await Functions.makeHttpRequest({
    url: `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightIata}`
});

if (apiResponse.error) {
    throw Error("Aviationstack API Request Failed");
}

const flights = apiResponse.data.data;
if (!flights || flights.length === 0) {
    throw Error("No flights found for this IATA code");
}

// Filter to find the exact flight on the given date
const targetFlight = flights.find(f => f.flight_date === flightDate);

if (!targetFlight) {
    throw Error("Flight not found on specified date");
}

const delayMinutes = targetFlight.departure.delay || 0;
console.log(`Flight Delay recorded: ${delayMinutes} minutes`);

// Policy Condition: Trigger payout if delay > 120 minutes (2 hours)
const isDelayed = delayMinutes > 120;

// Chainlink requires the response to be encoded as bytes.
// We encode our boolean true/false as a uint256 (1 or 0)
return Functions.encodeUint256(isDelayed ? 1 : 0);
