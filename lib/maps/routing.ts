import { calculateDistanceKm } from '@/lib/geo';

export interface RealRouteResult {
  id: string;
  name: string;
  tag: string; // 'Fastest Route' | 'Lower-Risk Route' | 'Alternative Route'
  distanceKm: number;
  durationMins: number;
  geometry: Array<[number, number]>;
  reportedUnsafeCount: number;
  emergencyResourceCount: number;
  riskScore: number;
  riskCategory: 'Lower-Risk' | 'Moderate-Risk' | 'Higher-Risk';
  reasons: string[];
}

interface SafetyReportContext {
  lat: number;
  lng: number;
  category?: string;
}

interface EmergencyResourceContext {
  lat: number;
  lng: number;
}

/**
 * Fetches real road geometry polylines using OpenStreetMap OSRM API.
 * Formats coordinates strictly as longitude,latitude for OSRM URL and converts to [latitude, longitude] for Leaflet.
 */
export async function fetchRealRoute(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  contextData?: {
    unsafeReports?: SafetyReportContext[];
    emergencyResources?: EmergencyResourceContext[];
  }
): Promise<RealRouteResult[]> {
  // 1. OSRM expects coordinates in {lon},{lat};{lon},{lat} format
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to calculate a road route. Please check the selected locations and try again.');
  }

  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('Unable to calculate a road route between these locations.');
  }

  const reports = contextData?.unsafeReports || [];
  const resources = contextData?.emergencyResources || [];

  // Parse OSRM routes
  const parsedRoutes: RealRouteResult[] = data.routes.map((r: any, idx: number) => {
    // OSRM returns coordinates as [lon, lat], convert to Leaflet [lat, lon]
    const geometry: Array<[number, number]> = r.geometry.coordinates.map(
      (coords: [number, number]) => [coords[1], coords[0]]
    );

    const distanceKm = Math.round((r.distance / 1000) * 10) / 10;
    const durationMins = Math.round(r.duration / 60);

    // Calculate deterministic risk score based on route geometry proximity to reports & resources
    // Weights:
    // + 2.5 per unsafe report within 400 meters of any route point
    // - 1.5 per emergency resource within 600 meters of any route point
    let unsafeNearRoute = 0;
    let resourcesNearRoute = 0;

    // Check sample points along the geometry for efficiency
    const samplePoints = geometry.filter((_, i) => i % 5 === 0 || i === geometry.length - 1);

    reports.forEach((rep) => {
      const isNear = samplePoints.some(
        (pt) => calculateDistanceKm(pt[0], pt[1], rep.lat, rep.lng) <= 0.4
      );
      if (isNear) unsafeNearRoute++;
    });

    resources.forEach((resItem) => {
      const isNear = samplePoints.some(
        (pt) => calculateDistanceKm(pt[0], pt[1], resItem.lat, resItem.lng) <= 0.6
      );
      if (isNear) resourcesNearRoute++;
    });

    const riskScore = Math.max(0, unsafeNearRoute * 2.5 - resourcesNearRoute * 1.5 + (idx === 0 ? 0.5 : 0));

    let riskCategory: 'Lower-Risk' | 'Moderate-Risk' | 'Higher-Risk' = 'Lower-Risk';
    if (riskScore > 4) riskCategory = 'Higher-Risk';
    else if (riskScore > 1.5) riskCategory = 'Moderate-Risk';

    const reasons: string[] = [];
    if (unsafeNearRoute > 0) {
      reasons.push(`${unsafeNearRoute} reported safety concern${unsafeNearRoute > 1 ? 's' : ''} nearby`);
    } else {
      reasons.push('No recent safety reports found along this route section');
    }

    if (resourcesNearRoute > 0) {
      reasons.push(`${resourcesNearRoute} verified emergency resource${resourcesNearRoute > 1 ? 's' : ''} nearby`);
    }

    reasons.push('Safety indicators are based on available geographic and incident data.');

    return {
      id: `osrm-route-${idx}`,
      name: idx === 0 ? 'Primary Arterial Route' : `Alternative Route ${idx}`,
      tag: idx === 0 ? 'Fastest Route' : 'Alternative',
      distanceKm,
      durationMins,
      geometry,
      reportedUnsafeCount: unsafeNearRoute,
      emergencyResourceCount: resourcesNearRoute,
      riskScore,
      riskCategory,
      reasons,
    };
  });

  // Sort routes to identify the Lower-Risk Route vs Fastest Route
  if (parsedRoutes.length > 1) {
    // Find route with lowest riskScore
    let minRiskIdx = 0;
    for (let i = 1; i < parsedRoutes.length; i++) {
      if (parsedRoutes[i].riskScore < parsedRoutes[minRiskIdx].riskScore) {
        minRiskIdx = i;
      }
    }

    // Tag the routes appropriately
    parsedRoutes.forEach((rt, idx) => {
      if (idx === 0 && minRiskIdx === 0) {
        rt.tag = 'Fastest & Lower-Risk Route';
      } else if (idx === 0) {
        rt.tag = 'Fastest Route';
      } else if (idx === minRiskIdx) {
        rt.tag = 'Lower-Risk Route';
      } else {
        rt.tag = `Alternative ${idx}`;
      }
    });
  } else if (parsedRoutes.length === 1) {
    parsedRoutes[0].tag = 'Only Available Route';
  }

  return parsedRoutes;
}
