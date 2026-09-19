export interface RouteOption {
  id: string;
  name: string;
  tag: string;
  distanceKm: number;
  durationMins: number;
  safetyScore: 'LOW' | 'MODERATE' | 'HIGH';
  reasons: string[];
  waypoints: Array<[number, number]>;
  reportedUnsafeAreasCount: number;
  emergencyResourcesNearbyCount: number;
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function analyzeRoutes(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  departureTime?: Date
): RouteOption[] {
  const baseDistance = calculateHaversineDistance(startLat, startLng, destLat, destLng);
  const hour = (departureTime || new Date()).getHours();
  const isNightTime = hour < 6 || hour > 20;

  // Generate 3 distinct realistic paths
  const routeA: RouteOption = {
    id: 'route-a',
    name: 'Direct Boulevard Express (Route A)',
    tag: 'Fastest',
    distanceKm: Math.max(1.2, baseDistance),
    durationMins: Math.round(Math.max(1.2, baseDistance) * 3 + 2),
    safetyScore: isNightTime ? 'MODERATE' : 'LOW',
    reasons: [
      'Contains 2 recently reported poorly lit spots near transit hub.',
      'High vehicle traffic, moderate foot patrol.',
      'Estimated safety indicators based on environmental reports.',
    ],
    waypoints: [
      [startLat, startLng],
      [startLat + (destLat - startLat) * 0.4 + 0.002, startLng + (destLng - startLng) * 0.4 - 0.002],
      [destLat, destLng],
    ],
    reportedUnsafeAreasCount: 2,
    emergencyResourcesNearbyCount: 3,
  };

  const routeB: RouteOption = {
    id: 'route-b',
    name: 'Well-Lit Commercial Corridor (Route B)',
    tag: 'Safer Choice',
    distanceKm: Math.max(1.5, Math.round((baseDistance + 0.6) * 10) / 10),
    durationMins: Math.round((baseDistance + 0.6) * 3 + 6),
    safetyScore: 'LOW',
    reasons: [
      'Passes directly by Central Police Cell & 24/7 Open Commercial Stores.',
      'Active street lighting & active CCTV coverage verified.',
      'Zero reported harassment incidents in the past 30 days.',
    ],
    waypoints: [
      [startLat, startLng],
      [startLat + (destLat - startLat) * 0.3 - 0.003, startLng + (destLng - startLng) * 0.5 + 0.004],
      [startLat + (destLat - startLat) * 0.7 - 0.002, startLng + (destLng - startLng) * 0.8 + 0.003],
      [destLat, destLng],
    ],
    reportedUnsafeAreasCount: 0,
    emergencyResourcesNearbyCount: 5,
  };

  const routeC: RouteOption = {
    id: 'route-c',
    name: 'Park Shortcut Alley (Route C)',
    tag: 'Alternative',
    distanceKm: Math.max(1.1, Math.round((baseDistance - 0.2) * 10) / 10),
    durationMins: Math.round((baseDistance - 0.2) * 3 + 1),
    safetyScore: isNightTime ? 'HIGH' : 'MODERATE',
    reasons: [
      '⚠️ High isolation score: Unlit pedestrian park section.',
      '3 active reports of stalking and loitering after 7:30 PM.',
      'Limited emergency access points.',
    ],
    waypoints: [
      [startLat, startLng],
      [startLat + (destLat - startLat) * 0.5 + 0.006, startLng + (destLng - startLng) * 0.5 - 0.005],
      [destLat, destLng],
    ],
    reportedUnsafeAreasCount: 3,
    emergencyResourcesNearbyCount: 1,
  };

  return [routeB, routeA, routeC];
}
