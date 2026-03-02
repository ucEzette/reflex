// Chainlink Functions: Cumulative Rainfall Accumulator
// Connects to a NOAA/Weather API securely off-chain to aggregate rainfall data 
// for crop insurance (`AgricultureIndex.sol`).

const geographicZone = args[0]; // e.g. "US-CORN-BELT-A1"
const startTimestamp = parseInt(args[1]);
const endTimestamp = parseInt(args[2]);

if (!geographicZone || isNaN(startTimestamp) || isNaN(endTimestamp)) {
    throw Error("Missing or invalid temporal bounds / zones");
}

// Ensure the weather API key is held securely in the DON vault
// This prevents exposing credential secrets directly onto the public Avalanche blockchain
const apiKey = secrets.noaaApiKey;
if (!apiKey) {
    throw Error("Missing NOAA API key in DON secrets");
}

// Simulate querying an external aggregate climate API endpoint
const url = `https://api.climate-data.org/v1/rainfall?zone=${geographicZone}&start=${startTimestamp}&end=${endTimestamp}`;

const climateRequest = Functions.makeHttpRequest({
    url: url,
    method: "GET",
    headers: {
        "Authorization": `Bearer ${apiKey}`
    }
});

const climateResponse = await climateRequest;

if (climateResponse.error) {
    console.error(climateResponse.error);
    throw Error("Failed to fetch climate aggregation");
}

// We assume the payload returns { "totalRainfallMillimeters": 145.2 }
const data = climateResponse.data;
const accumulatedRainfall = data.totalRainfallMillimeters;

if (typeof accumulatedRainfall !== 'number') {
    throw Error("Invalid API payload parsing");
}

console.log(`Zone ${geographicZone} reported ${accumulatedRainfall}mm total rain.`);

// Scale floating point mm into integers for Solidity compatibility (e.g. 145.2 => 1452)
return Functions.encodeUint256(Math.round(accumulatedRainfall * 10));
