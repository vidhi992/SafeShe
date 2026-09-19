/**
 * Central configuration for SafeShe Journey Tracker
 */
export const ANOMALY_TIMEOUT_SECONDS = 120; // 2 minutes = 120 seconds
export const ANOMALY_TIMEOUT_MS = ANOMALY_TIMEOUT_SECONDS * 1000;

export const ROUTE_DEVIATION_THRESHOLD_METERS = 150; // 150 meters away from path

export const JOURNEY_MESSAGES = {
  STATIONARY_ALERT: 'Your journey appears to have been stationary or delayed for 2 minutes.',
  ROUTE_DEVIATION_ALERT: 'Route deviation detected: GPS position has veered off the selected road route.',
  ROUTING_FAILED: 'Unable to calculate a road route. Please check the selected locations and try again.',
  NO_REPORTS_NOTE: 'No recent safety reports found along this route.',
  SAFETY_DISCLAIMER: 'Safety indicators are based on available geographic and incident data. SafeShe does not claim any route is 100% safe.',
};
