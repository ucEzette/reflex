// Chainlink Functions: Cumulative Rainfall Accumulator
// Connects to a NOAA/Weather API securely off-chain to aggregate rainfall data 
// for crop insurance (`AgricultureIndex.sol`).

const geographicZone = args[0];
const lat = parseFloat(args[1]);
const lon = parseFloat(args[2]);

if (!geographicZone || isNaN(lat) || isNaN(lon)) {
    throw Error("Missing or invalid GPS/Zone bounds");
}

const noaaKey = secrets.noaaApiKey;
const owmKey = secrets.openWeatherApiKey;

if (!noaaKey || !owmKey) {
    throw Error("Missing API keys for weather consensus");
}

// 1. Fetch from NOAA (Simulated endpoint for this zone)
const noaaUrl = `https://api.weather.gov/rainfall?zone=${geographicZone}`;
const noaaRequest = Functions.makeHttpRequest({
    url: noaaUrl,
    headers: { "Authorization": `Bearer ${noaaKey}` }
});

// 2. Fetch from OpenWeatherMap (Real API structure)
const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${owmKey}`;
const owmRequest = Functions.makeHttpRequest({
    url: owmUrl
});

// 3. Execute both requests in parallel
const [noaaRes, owmRes] = await Promise.all([noaaRequest, owmRequest]);

let noaaVal = 0;
let owmVal = 0;

if (!noaaRes.error) {
    noaaVal = noaaRes.data.total_rainfall_mm || 0;
}

if (!owmRes.error) {
    // OWM might return rain for 1h or 3h
    owmVal = (owmRes.data.rain && owmRes.data.rain['1h']) || 0;
}

// 4. Implement Consensus: Median/Average
const consensusRainfall = (noaaVal + owmVal) / (noaaVal > 0 && owmVal > 0 ? 2 : 1);

console.log(`NOAA: ${noaaVal}mm, OWM: ${owmVal}mm. Consensus: ${consensusRainfall}mm`);

// Scale for Solidity (10x)
return Functions.encodeUint256(Math.round(consensusRainfall * 10));
