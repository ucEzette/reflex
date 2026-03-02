// Chainlink Functions: Heating/Cooling Degree Days Calculator
// Fetches daily temperature data from OpenWeatherMap and computes cumulative
// Degree Days (HDD or CDD) for energy insurance settlement.
// Used by: EnergySolutions.sol executeClaim()

const targetLat = args[0]; // Latitude of target grid (e.g. "29.76")
const targetLon = args[1]; // Longitude of target grid (e.g. "-95.37" for Houston/ERCOT)
const startTimestamp = parseInt(args[2]); // Policy start (unix)
const endTimestamp = parseInt(args[3]); // Policy end (unix)
const baseTemp = parseInt(args[4]); // Base temperature in Celsius * 10 (e.g. 180 = 18.0°C)
const mode = args[5]; // "HDD" or "CDD"

if (!targetLat || !targetLon || isNaN(startTimestamp) || isNaN(endTimestamp)) {
    throw Error("Missing or invalid arguments");
}

const apiKey = secrets.openWeatherApiKey;
if (!apiKey) {
    throw Error("Missing OpenWeatherMap API key in DON secrets");
}

// Calculate the number of days in the policy period
const daySeconds = 86400;
const days = Math.ceil((endTimestamp - startTimestamp) / daySeconds);

if (days <= 0 || days > 365) {
    throw Error("Invalid policy period (must be 1-365 days)");
}

// Fetch historical daily temperatures using OpenWeatherMap One Call API
// We sample one reading per day at noon UTC for consistency
let cumulativeDegreeDays = 0;
const baseTempC = baseTemp / 10; // Convert from scaled integer

for (let i = 0; i < days; i++) {
    const dayTimestamp = startTimestamp + (i * daySeconds) + (daySeconds / 2); // noon

    const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${targetLat}&lon=${targetLon}&dt=${dayTimestamp}&units=metric&appid=${apiKey}`;

    const weatherRequest = Functions.makeHttpRequest({
        url: url,
        method: "GET"
    });

    const weatherResponse = await weatherRequest;

    if (weatherResponse.error) {
        console.error(`Day ${i} fetch failed, skipping`);
        continue;
    }

    // Extract average temperature for the day
    const data = weatherResponse.data;
    let avgTemp;

    if (data.data && data.data.length > 0) {
        avgTemp = data.data[0].temp;
    } else if (data.current) {
        avgTemp = data.current.temp;
    } else {
        continue;
    }

    // Compute degree days based on mode
    if (mode === "HDD") {
        // Heating Degree Days: how much colder than base
        const hdd = Math.max(0, baseTempC - avgTemp);
        cumulativeDegreeDays += hdd;
    } else {
        // Cooling Degree Days: how much warmer than base
        const cdd = Math.max(0, avgTemp - baseTempC);
        cumulativeDegreeDays += cdd;
    }
}

console.log(`${mode} for (${targetLat}, ${targetLon}): ${cumulativeDegreeDays.toFixed(1)} degree-days over ${days} days`);

// Scale to integer (multiply by 10 for 1 decimal precision)
return Functions.encodeUint256(Math.round(cumulativeDegreeDays * 10));
