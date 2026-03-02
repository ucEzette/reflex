// Chainlink Functions: Haversine Distance Calculator
// Calculates the precise distance between a policyholder's geographic bounding box
// and the epicenter of a catastrophic event (e.g. Earthquake, Hurricane).

const userLat = parseFloat(args[0]);
const userLon = parseFloat(args[1]);
const eventLat = parseFloat(args[2]);
const eventLon = parseFloat(args[3]);

if (isNaN(userLat) || isNaN(userLon) || isNaN(eventLat) || isNaN(eventLon)) {
    throw Error("Missing or invalid GPS coordinates");
}

// Earth's radius in meters
const R = 6371000;

// Convert degrees to radians
const toRadians = (degrees) => degrees * (Math.PI / 180);

const dLat = toRadians(eventLat - userLat);
const dLon = toRadians(eventLon - userLon);

const lat1 = toRadians(userLat);
const lat2 = toRadians(eventLat);

// Haversine formula
const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const distanceMeters = R * c;

console.log(`Calculated Haversine Distance: ${distanceMeters.toFixed(2)} meters`);

// Return the distance as a strict integer (meters) for the smart contract payload
return Functions.encodeUint256(Math.round(distanceMeters));
