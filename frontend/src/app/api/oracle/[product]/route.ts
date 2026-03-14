import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


// Oracle data proxy — fetches live external data for each product's oracle source
// Keeps API keys server-side and provides a unified interface for the frontend
// Each fetcher now returns a `riskProbability` or `riskStats` field for premium calculation

function clamp(val: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, val));
}

const ORACLE_CONFIGS: Record<string, { name: string; fetcher: (params: URLSearchParams) => Promise<any> }> = {
    flight: {
        name: 'AviationStack',
        fetcher: async (params) => {
            const flightId = params.get('flightId') || 'EK202';
            const apiKey = process.env.AVIATIONSTACK_API_KEY;
            
            if (!apiKey) return {
                status: 'no_key',
                message: 'AviationStack API key not configured',
                isValid: true,
                isInsurable: true,
                flightStatusLabel: 'Unknown',
                scheduledArrival: null,
                riskStats: { nDelayed: 5, nTotal: 100, probability: 0.05 }
            };

            try {
                // Remove prefix if present (e.g. flights/EK202 -> EK202)
                const flightCode = flightId.replace(/^flights\//, "").toUpperCase();
                
                // Use HTTPS as verified previously
                const res = await fetch(
                    `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightCode}`,
                    { next: { revalidate: 300 } }
                );

                if (!res.ok) {
                    return {
                        status: 'not_found',
                        message: `Flight "${flightCode}" not found (HTTP ${res.status}). Please verify the flight number.`,
                        isValid: false,
                        isInsurable: false,
                        flightStatusLabel: 'Not Found',
                        scheduledArrival: null,
                        autoDurationSeconds: null,
                        riskStats: null,
                        data: null
                    };
                }

                const data = await res.json();
                
                if (data.error) {
                    return {
                        status: 'error',
                        message: `AviationStack Error: ${data.error.message}`,
                        isValid: false,
                        isInsurable: false,
                        flightStatusLabel: 'Error',
                        scheduledArrival: null,
                        autoDurationSeconds: null,
                        riskStats: null,
                        data: null
                    };
                }

                const flights = data.data || [];

                if (flights.length === 0) {
                    return {
                        status: 'not_found',
                        message: `No flights found for "${flightCode}". Please check the flight number and try again.`,
                        isValid: false,
                        isInsurable: false,
                        flightStatusLabel: 'Not Found',
                        scheduledArrival: null,
                        autoDurationSeconds: null,
                        riskStats: null,
                        data: null
                    };
                }

                // Use the most recent flight record
                const latest = flights[0];
                const status = latest.flight_status || 'scheduled';
                
                const arrivalTime = latest.arrival?.scheduled || latest.arrival?.estimated;
                const delayMinutes = latest.arrival?.delay || 0;

                // AviationStack doesn't provide easy historical stats in a single call for free keys.
                // We'll use a realistic baseline or derive from the single record if multiple aren't available.
                const nTotal = 100;
                const nDelayed = status === 'landed' && delayMinutes >= 120 ? 15 : 5; // simplified logic for demo
                const probability = nDelayed / nTotal;

                const isInsurable = status === 'scheduled' || status === 'active';

                let flightStatusLabel = 'Scheduled';
                if (status === 'active') flightStatusLabel = 'En Route (In Air)';
                else if (status === 'landed') flightStatusLabel = 'Arrived / Landed';
                else if (status === 'cancelled') flightStatusLabel = 'Cancelled';
                else if (status === 'diverted') flightStatusLabel = 'Diverted';

                // Compute auto-duration: seconds from now until scheduled arrival + 6h buffer
                let autoDurationSeconds: number | null = null;
                if (arrivalTime) {
                    const arrivalMs = new Date(arrivalTime).getTime();
                    const bufferMs = 6 * 3600 * 1000;
                    const nowMs = Date.now();
                    autoDurationSeconds = Math.max(Math.floor((arrivalMs + bufferMs - nowMs) / 1000), 3600);
                }

                return {
                    status: 'ok',
                    source: 'AviationStack',
                    isValid: true,
                    isInsurable,
                    flightStatusLabel,
                    scheduledArrival: arrivalTime || null,
                    autoDurationSeconds,
                    riskStats: {
                        nDelayed,
                        nTotal,
                        probability: parseFloat(probability.toFixed(4)),
                        sampleSize: flights.length,
                        method: `AviationStack Real-time Feed`
                    },
                    data: {
                        ident: latest.flight?.iata || flightCode,
                        origin: latest.departure?.iata,
                        destination: latest.arrival?.iata,
                        scheduledArrival: arrivalTime,
                        actualArrival: latest.arrival?.actual || latest.arrival?.estimated,
                        delayMinutes,
                        flightStatus: status,
                        triggerThreshold: '≥120 min delay',
                        triggered: delayMinutes >= 120
                    }
                };
            } catch (e: any) {
                return {
                    status: 'error',
                    message: e.message,
                    isValid: true,
                    isInsurable: true,
                    flightStatusLabel: 'Unknown',
                    scheduledArrival: null,
                    riskStats: { nDelayed: 5, nTotal: 100, probability: 0.05 }
                };
            }
        }
    },
    agri: {
        name: 'NOAA Climate Data',
        fetcher: async (params) => {
            const zone = params.get('zone') || 'USC00045721';
            const apiKey = process.env.AG_NOAA_API_KEY;
            if (!apiKey) return {
                status: 'no_key',
                message: 'NOAA API key not configured',
                riskProbability: 0.10
            };

            try {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
                const res = await fetch(
                    `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&stationid=GHCND:${zone}&startdate=${startDate}&enddate=${endDate}&limit=31`,
                    { headers: { token: apiKey }, next: { revalidate: 3600 } }
                );
                if (!res.ok) return { status: 'error', message: `NOAA ${res.status}`, riskProbability: 0.10 };
                const data = await res.json();
                const readings = data.results || [];
                const totalRainfall = readings.reduce((sum: number, r: any) => sum + (r.value || 0), 0) / 10; // tenths of mm

                // Historical baseline: ~75mm for 30 days is considered normal
                const baselineMm = 75;
                const deviation = Math.abs(totalRainfall - baselineMm) / baselineMm;
                // Clamp to 5%-30%: higher deviation = higher drought/flood risk
                const riskProbability = clamp(deviation, 0.05, 0.30);

                return {
                    status: 'ok',
                    source: 'NOAA Climate Data Online',
                    riskProbability: parseFloat(riskProbability.toFixed(4)),
                    riskMethod: `Rainfall deviation from ${baselineMm}mm baseline: ${(deviation * 100).toFixed(1)}%`,
                    data: {
                        station: zone,
                        period: `${startDate} to ${endDate}`,
                        totalRainfallMm: totalRainfall.toFixed(1),
                        baselineMm,
                        deviationPct: `${(deviation * 100).toFixed(1)}%`,
                        readingsCount: readings.length,
                        dailyAvgMm: readings.length > 0 ? (totalRainfall / readings.length).toFixed(1) : '0',
                        indexType: 'Cumulative Rainfall'
                    }
                };
            } catch (e: any) {
                return { status: 'error', message: e.message, riskProbability: 0.10 };
            }
        }
    },
    energy: {
        name: 'OpenWeatherMap',
        fetcher: async (params) => {
            const lat = params.get('lat') || '29.76';
            const lon = params.get('lon') || '-95.37';
            const apiKey = process.env.ENERGY_WEATHER_API_KEY;
            if (!apiKey) return {
                status: 'no_key',
                message: 'OpenWeatherMap API key not configured',
                riskProbability: 0.08
            };

            try {
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
                    { next: { revalidate: 300 } }
                );
                if (!res.ok) return { status: 'error', message: `OWM ${res.status}`, riskProbability: 0.08 };
                const data = await res.json();
                const temp = data.main?.temp || 0;
                const baseTemp = 18;
                const hdd = Math.max(0, baseTemp - temp);
                const cdd = Math.max(0, temp - baseTemp);
                const maxDD = Math.max(hdd, cdd);

                // Risk scales with degree-day deviation: 15DD = 100% threshold
                // Clamp 3%-25%
                const riskProbability = clamp(maxDD / 15, 0.03, 0.25);

                return {
                    status: 'ok',
                    source: 'OpenWeatherMap',
                    riskProbability: parseFloat(riskProbability.toFixed(4)),
                    riskMethod: `Degree-day deviation: ${maxDD.toFixed(1)}DD from ${baseTemp}°C base (${(riskProbability * 100).toFixed(1)}% risk)`,
                    data: {
                        location: data.name || `${lat}, ${lon}`,
                        currentTemp: `${temp.toFixed(1)}°C`,
                        hddToday: hdd.toFixed(1),
                        cddToday: cdd.toFixed(1),
                        baseTemp: `${baseTemp}°C`,
                        maxDegreeDays: maxDD.toFixed(1),
                        humidity: `${data.main?.humidity}%`,
                        conditions: data.weather?.[0]?.description || 'unknown'
                    }
                };
            } catch (e: any) {
                return { status: 'error', message: e.message, riskProbability: 0.08 };
            }
        }
    },
    cat: {
        name: 'USGS Earthquake API',
        fetcher: async (params) => {
            const lat = params.get('lat') || '34.0522';
            const lon = params.get('lon') || '-118.2437';

            try {
                // Fetch seismic events within 500km over the last 90 days for a meaningful sample
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
                const res = await fetch(
                    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&latitude=${lat}&longitude=${lon}&maxradiuskm=500&minmagnitude=2.5&orderby=magnitude&limit=50`,
                    { next: { revalidate: 600 } }
                );
                if (!res.ok) return { status: 'error', message: `USGS ${res.status}`, riskProbability: 0.02 };
                const data = await res.json();
                const eventsFound = data.metadata?.count || 0;
                const events = (data.features || []).map((f: any) => ({
                    magnitude: f.properties.mag,
                    place: f.properties.place,
                    time: new Date(f.properties.time).toISOString(),
                    depth: f.geometry?.coordinates?.[2]
                }));

                // Risk scales with event frequency: each event adds 0.5% risk
                // Clamp 1%-15%: even quiet zones have a baseline floor
                const riskProbability = clamp(eventsFound * 0.005, 0.01, 0.15);

                return {
                    status: 'ok',
                    source: 'USGS Earthquake Hazards',
                    riskProbability: parseFloat(riskProbability.toFixed(4)),
                    riskMethod: `${eventsFound} seismic events (M≥2.5) within 500km over 90 days → ${(riskProbability * 100).toFixed(1)}% risk`,
                    data: {
                        monitorPoint: `${lat}, ${lon}`,
                        radius: '500km',
                        period: `${startDate} to ${endDate}`,
                        eventsFound,
                        recentEvents: events.slice(0, 3)
                    }
                };
            } catch (e: any) {
                return { status: 'error', message: e.message, riskProbability: 0.02 };
            }
        }
    },
    maritime: {
        name: 'Stormglass.io',
        fetcher: async (params) => {
            const lat = params.get('lat') || '33.75';
            const lon = params.get('lon') || '-118.22';
            const apiKey = process.env.MARITIME_STORMGLASS_API_KEY;
            if (!apiKey) return {
                status: 'no_key',
                message: 'Stormglass API key not configured',
                riskProbability: 0.06
            };

            try {
                const now = new Date();
                const start = new Date(now.getTime() - 3 * 3600000).toISOString();
                const end = new Date(now.getTime() + 3 * 3600000).toISOString();
                const res = await fetch(
                    `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=windSpeed,windGust,windDirection&start=${start}&end=${end}&source=noaa`,
                    { headers: { Authorization: apiKey }, next: { revalidate: 600 } }
                );
                if (!res.ok) return { status: 'error', message: `Stormglass ${res.status}`, riskProbability: 0.06 };
                const data = await res.json();
                const hours = data.hours || [];
                let maxWind = 0;
                let maxGust = 0;
                for (const h of hours) {
                    const ws = h.windSpeed?.noaa || h.windSpeed?.sg || 0;
                    const wg = h.windGust?.noaa || h.windGust?.sg || 0;
                    if (ws > maxWind) maxWind = ws;
                    if (wg > maxGust) maxGust = wg;
                }
                const maxWindKnots = maxWind * 1.94384;
                const maxGustKnots = maxGust * 1.94384;

                // Risk = windspeed relative to gale threshold (34 knots)
                // Clamp 3%-20%
                const riskProbability = clamp(maxWindKnots / 34, 0.03, 0.20);

                return {
                    status: 'ok',
                    source: 'Stormglass.io',
                    riskProbability: parseFloat(riskProbability.toFixed(4)),
                    riskMethod: `Max wind ${maxWindKnots.toFixed(1)}kn / 34kn gale threshold → ${(riskProbability * 100).toFixed(1)}% risk`,
                    data: {
                        port: `${lat}, ${lon}`,
                        maxSustainedWind: `${maxWindKnots.toFixed(1)} knots`,
                        maxGust: `${maxGustKnots.toFixed(1)} knots`,
                        observationWindow: '6 hours',
                        readings: hours.length,
                        portClosureThreshold: '≥34 knots (Gale Force)'
                    }
                };
            } catch (e: any) {
                return { status: 'error', message: e.message, riskProbability: 0.06 };
            }
        }
    }
};

export async function GET(
    request: NextRequest,
    { params }: { params: { product: string } }
) {
    const productKey = params.product;
    const config = ORACLE_CONFIGS[productKey];

    if (!config) {
        return NextResponse.json({ status: 'error', message: `Unknown product: ${productKey}` }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const result = await config.fetcher(searchParams);

    return NextResponse.json({
        product: productKey,
        oracle: config.name,
        timestamp: new Date().toISOString(),
        ...result
    });
}
