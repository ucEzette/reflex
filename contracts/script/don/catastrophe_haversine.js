// Chainlink Functions: Haversine Distance Calculator
// Calculates the precise distance between a policyholder's geographic bounding box
// and the epicenter of a catastrophic event (e.g. Earthquake, Hurricane).

const userLat = parseFloat(args[0]);
const userLon = parseFloat(args[1]);
const radiusMeters = parseFloat(args[2]) || 50000; // Default 50km radius

if (isNaN(userLat) || isNaN(userLon)) {
    throw Error("Missing or invalid GPS coordinates");
}

// 1. Fetch latest M5.0+ earthquakes from USGS within the last 30 days
const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&minmagnitude=5.0`;

const usgsRequest = Functions.makeHttpRequest({
    url: url,
    method: "GET"
});

const usgsResponse = await usgsRequest;

if (usgsResponse.error) {
    console.error(usgsResponse.error);
    throw Error("Failed to fetch USGS earthquake data");
}

const features = usgsResponse.data.features;
if (!features || features.length === 0) {
    console.log("No major seismic events detected in the window.");
    return Functions.encodeUint256(0); // No event
}

// 2. Haversine Calculation helpers
const R = 6371000; // Earth's radius in meters
const toRadians = (degrees) => degrees * (Math.PI / 180);

let minDistance = Infinity;

// 3. Find the closest event to the user's location
for (const feature of features) {
    const [eventLon, eventLat] = feature.geometry.coordinates;
    const dLat = toRadians(eventLat - userLat);
    const dLon = toRadians(eventLon - userLon);
    const lat1 = toRadians(userLat);
    const lat2 = toRadians(eventLat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = R * c;

    if (distanceMeters < minDistance) {
        minDistance = distanceMeters;
    }
}

console.log(`Closest seismic event: ${minDistance.toFixed(2)} meters from target.`);

// Return the closest distance as a strict integer (meters)
return Functions.encodeUint256(Math.round(minDistance));
