import { NextRequest, NextResponse } from 'next/server';

// Oracle data proxy — fetches live external data for each product's oracle source
// Keeps API keys server-side and provides a unified interface for the frontend

const ORACLE_CONFIGS: Record<string, { name: string; fetcher: (params: URLSearchParams) => Promise<any> }> = {
    flight: {
        name: 'FlightAware AeroAPI',
        fetcher: async (params) => {
            const flightId = params.get('flightId') || 'EK202';
            const apiKey = process.env.FLIGHTAWARE_API_KEY;
            if (!apiKey) return { status: 'no_key', message: 'FlightAware API key not configured' };

            try {
                const res = await fetch(
                    `https://aeroapi.flightaware.com/aeroapi/flights/${flightId}`,
                    { headers: { 'x-apikey': apiKey }, next: { revalidate: 60 } }
                );
                if (!res.ok) return { status: 'error', message: `AeroAPI ${res.status}` };
                const data = await res.json();
                const flight = data.flights?.[0];
                if (!flight) return { status: 'no_data', message: 'No flights found' };

                const delay = flight.arrival_delay ? Math.round(flight.arrival_delay / 60) : 0;
                return {
                    status: 'ok',
                    source: 'FlightAware AeroAPI v3',
                    data: {
                        ident: flight.ident,
                        origin: flight.origin?.code_iata,
                        destination: flight.destination?.code_iata,
                        scheduledArrival: flight.scheduled_in,
                        actualArrival: flight.actual_in || flight.estimated_in,
                        delayMinutes: delay,
                        flightStatus: flight.status,
                        triggerThreshold: '≥120 min delay',
                        triggered: delay >= 120
                    }
                };
            } catch (e: any) {
                return { status: 'error', message: e.message };
            }
        }
    },
    agri: {
        name: 'NOAA Climate Data',
        fetcher: async (params) => {
            const zone = params.get('zone') || 'USC00045721';
            const apiKey = process.env.AG_NOAA_API_KEY;
            if (!apiKey) return { status: 'no_key', message: 'NOAA API key not configured' };

            try {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
                const res = await fetch(
                    `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&stationid=GHCND:${zone}&startdate=${startDate}&enddate=${endDate}&limit=31`,
                    { headers: { token: apiKey }, next: { revalidate: 3600 } }
                );
                if (!res.ok) return { status: 'error', message: `NOAA ${res.status}` };
                const data = await res.json();
                const readings = data.results || [];
                const totalRainfall = readings.reduce((sum: number, r: any) => sum + (r.value || 0), 0) / 10; // NOAA reports in tenths of mm

                return {
                    status: 'ok',
                    source: 'NOAA Climate Data Online',
                    data: {
                        station: zone,
                        period: `${startDate} to ${endDate}`,
                        totalRainfallMm: totalRainfall.toFixed(1),
                        readingsCount: readings.length,
                        dailyAvgMm: readings.length > 0 ? (totalRainfall / readings.length).toFixed(1) : '0',
                        indexType: 'Cumulative Rainfall'
                    }
                };
            } catch (e: any) {
                return { status: 'error', message: e.message };
            }
        }
    },
    energy: {
        name: 'OpenWeatherMap',
        fetcher: async (params) => {
            const lat = params.get('lat') || '29.76';
            const lon = params.get('lon') || '-95.37';
            const apiKey = process.env.ENERGY_WEATHER_API_KEY;
            if (!apiKey) return { status: 'no_key', message: 'OpenWeatherMap API key not configured' };

            try {
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
                    { next: { revalidate: 300 } }
                );
                if (!res.ok) return { status: 'error', message: `OWM ${res.status}` };
                const data = await res.json();
                const temp = data.main?.temp || 0;
                const baseTemp = 18;
                const hdd = Math.max(0, baseTemp - temp);
                const cdd = Math.max(0, temp - baseTemp);

                return {
                    status: 'ok',
                    source: 'OpenWeatherMap',
                    data: {
                        location: data.name || `${lat}, ${lon}`,
                        currentTemp: `${temp.toFixed(1)}°C`,
                        hddToday: hdd.toFixed(1),
                        cddToday: cdd.toFixed(1),
                        baseTemp: `${baseTemp}°C`,
                        humidity: `${data.main?.humidity}%`,
                        conditions: data.weather?.[0]?.description || 'unknown'
                    }
                };
            } catch (e: any) {
                return { status: 'error', message: e.message };
            }
        }
    },
    cat: {
        name: 'USGS Earthquake API',
        fetcher: async (params) => {
            const lat = params.get('lat') || '34.0522';
            const lon = params.get('lon') || '-118.2437';

            try {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
                const res = await fetch(
                    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&latitude=${lat}&longitude=${lon}&maxradiuskm=500&minmagnitude=2.5&orderby=magnitude&limit=5`,
                    { next: { revalidate: 600 } }
                );
                if (!res.ok) return { status: 'error', message: `USGS ${res.status}` };
                const data = await res.json();
                const events = (data.features || []).map((f: any) => ({
                    magnitude: f.properties.mag,
                    place: f.properties.place,
                    time: new Date(f.properties.time).toISOString(),
                    depth: f.geometry?.coordinates?.[2]
                }));

                return {
                    status: 'ok',
                    source: 'USGS Earthquake Hazards (No API key required)',
                    data: {
                        monitorPoint: `${lat}, ${lon}`,
                        radius: '500km',
                        period: `${startDate} to ${endDate}`,
                        eventsFound: data.metadata?.count || 0,
                        recentEvents: events.slice(0, 3)
                    }
                };
            } catch (e: any) {
                return { status: 'error', message: e.message };
            }
        }
    },
    maritime: {
        name: 'Stormglass.io',
        fetcher: async (params) => {
            const lat = params.get('lat') || '33.75';
            const lon = params.get('lon') || '-118.22';
            const apiKey = process.env.MARITIME_STORMGLASS_API_KEY;
            if (!apiKey) return { status: 'no_key', message: 'Stormglass API key not configured' };

            try {
                const now = new Date();
                const start = new Date(now.getTime() - 3 * 3600000).toISOString();
                const end = new Date(now.getTime() + 3 * 3600000).toISOString();
                const res = await fetch(
                    `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=windSpeed,windGust,windDirection&start=${start}&end=${end}&source=noaa`,
                    { headers: { Authorization: apiKey }, next: { revalidate: 600 } }
                );
                if (!res.ok) return { status: 'error', message: `Stormglass ${res.status}` };
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

                return {
                    status: 'ok',
                    source: 'Stormglass.io',
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
                return { status: 'error', message: e.message };
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
