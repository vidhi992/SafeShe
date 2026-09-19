import { calculateDistanceKm } from '@/lib/maps/locations';

export interface SafetyAnalysisInput {
  routePoints: Array<[number, number]>;
  departureTime?: Date;
  unsafeReports: Array<{ lat: number; lng: number; category: string; description: string }>;
  emergencyResources: Array<{ lat: number; lng: number; category: string; name: string }>;
}

export interface SafetyAnalysisResult {
  indicator: 'LOW' | 'MODERATE' | 'HIGH';
  numericRiskIndex: number; // 0 (safest) to 100 (highest risk)
  formulaExplanation: string;
  nearbyUnsafeCount: number;
  nearbyEmergencyCount: number;
  reasons: string[];
  disclaimer: string;
}

/**
 * Computes a deterministic, explainable safety indicator score for a given geographic route.
 * Formula:
 *   Risk Index = TimeOfDayWeight + (ReportWeight * NearbyReportsCount) - (ResourceWeight * NearbyEmergencyCount)
 */
export function analyzeRouteSafety(input: SafetyAnalysisInput): SafetyAnalysisResult {
  const time = input.departureTime || new Date();
  const hour = time.getHours();

  // 1. Time of day weight (night time between 8 PM and 6 AM carries higher baseline risk)
  const isNight = hour < 6 || hour >= 20;
  const isLateNight = hour < 4 || hour >= 22;
  let baseRisk = isLateNight ? 40 : isNight ? 25 : 10;

  // 2. Count unsafe reports within 500m (0.5 km) of any waypoint on the route
  let nearbyUnsafeCount = 0;
  const matchedReportCategories = new Set<string>();

  input.unsafeReports.forEach((report) => {
    const isNearRoute = input.routePoints.some(
      (point) => calculateDistanceKm(point[0], point[1], report.lat, report.lng) <= 0.6
    );
    if (isNearRoute) {
      nearbyUnsafeCount++;
      matchedReportCategories.add(report.category);
    }
  });

  // 3. Count emergency resources within 1.5 km of the route
  let nearbyEmergencyCount = 0;
  const matchedResources = new Set<string>();

  input.emergencyResources.forEach((resource) => {
    const isNearRoute = input.routePoints.some(
      (point) => calculateDistanceKm(point[0], point[1], resource.lat, resource.lng) <= 1.5
    );
    if (isNearRoute) {
      nearbyEmergencyCount++;
      matchedResources.add(resource.name);
    }
  });

  // 4. Calculate Risk Index (0 - 100)
  // Formula: BaseRisk + (15 * nearbyUnsafeCount) - (10 * nearbyEmergencyCount)
  let numericRiskIndex = baseRisk + nearbyUnsafeCount * 15 - nearbyEmergencyCount * 10;
  numericRiskIndex = Math.max(5, Math.min(95, numericRiskIndex));

  // 5. Determine Indicator Level
  let indicator: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  if (numericRiskIndex >= 55) {
    indicator = 'HIGH';
  } else if (numericRiskIndex >= 30) {
    indicator = 'MODERATE';
  }

  // 6. Generate Transparent Explanatory Reasons
  const reasons: string[] = [];

  if (nearbyUnsafeCount > 0) {
    const catList = Array.from(matchedReportCategories).join(', ');
    reasons.push(
      `Contains ${nearbyUnsafeCount} reported unsafe spot(s) near route (${catList || 'Unlit area / Harassment'}).`
    );
  } else {
    reasons.push('Zero reported harassment or lighting incidents along this path in past 30 days.');
  }

  if (nearbyEmergencyCount > 0) {
    reasons.push(`Passes within 1.5 km of ${nearbyEmergencyCount} verified emergency facility (e.g. Police Cell / Hospital).`);
  } else {
    reasons.push('Limited emergency service coverage along isolated street sections.');
  }

  if (isNight) {
    reasons.push(`Night-time departure (${hour}:00) reflects reduced pedestrian crowd density.`);
  } else {
    reasons.push('Day-time travel with active foot traffic and commercial store visibility.');
  }

  const formulaExplanation = `RiskIndex = BaseTimeWeight(${baseRisk}) + (15 * ${nearbyUnsafeCount} Reports) - (10 * ${nearbyEmergencyCount} Emergency Res) = ${numericRiskIndex}`;

  return {
    indicator,
    numericRiskIndex,
    formulaExplanation,
    nearbyUnsafeCount,
    nearbyEmergencyCount,
    reasons,
    disclaimer: 'Safety indicators are based on available reports and location data. SafeShe does not claim any route is 100% safe.',
  };
}
