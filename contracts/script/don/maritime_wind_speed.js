// Chainlink Functions: Maritime Wind Speed Checker
// Fetches sustained wind speed at a port's GPS coordinates from Stormglass.io
// to determine if conditions exceed the port-closure threshold.
// Used by: MaritimeSolutions.sol executeClaim()

const portLat = args[0]; // Latitude of the target port (e.g. "33.75")
const portLon = args[1]; // Longitude of the target port (e.g. "-118.22" for Long Beach)
const checkTimestamp = args[2]; // Unix timestamp to check (optional, defaults to now)

if (!portLat || !portLon) {
    throw Error("Missing port GPS coordinates");
}

const apiKey = secrets.stormglassApiKey;
if (!apiKey) {
    throw Error("Missing Stormglass API key in DON secrets");
}

// Determine the time window to check (6-hour window around the target time)
const now = checkTimestamp ? parseInt(checkTimestamp) : Math.floor(Date.now() / 1000);
const startDate = new Date((now - 10800) * 1000).toISOString(); // 3 hours before
const endDate = new Date((now + 10800) * 1000).toISOString(); // 3 hours after

const url = `https://api.stormglass.io/v2/weather/point?lat=${portLat}&lng=${portLon}&params=windSpeed,windGust&start=${startDate}&end=${endDate}&source=noaa`;

console.log(`Fetching wind data for port at (${portLat}, ${portLon})`);

const weatherRequest = Functions.makeHttpRequest({
    url: url,
    method: "GET",
    headers: {
        "Authorization": apiKey
    }
});

const weatherResponse = await weatherRequest;

if (weatherResponse.error) {
    console.error(weatherResponse.error);
    throw Error("Stormglass API request failed");
}

const hours = weatherResponse.data.hours;
if (!hours || hours.length === 0) {
    throw Error("No weather data returned for this location/time");
}

// Find the maximum sustained wind speed across the observation window
let maxWindSpeedMs = 0;
for (const hour of hours) {
    const windSpeed = hour.windSpeed?.noaa || hour.windSpeed?.sg || 0;
    const windGust = hour.windGust?.noaa || hour.windGust?.sg || 0;

    // Use the higher of sustained wind or gust
    const effectiveWind = Math.max(windSpeed, windGust);
    if (effectiveWind > maxWindSpeedMs) {
        maxWindSpeedMs = effectiveWind;
    }
}

// Convert m/s to knots (1 m/s = 1.94384 knots)
const maxWindKnots = maxWindSpeedMs * 1.94384;

console.log(`Max sustained wind at port: ${maxWindKnots.toFixed(1)} knots (${maxWindSpeedMs.toFixed(1)} m/s)`);

// Return wind speed in knots as integer for the smart contract
return Functions.encodeUint256(Math.round(maxWindKnots));
