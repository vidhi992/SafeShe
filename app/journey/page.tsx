'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { MapContainer, MapPolyline, MapMarker } from '@/components/map/map-container';
import { LocationSearch, LocationSearchResult } from '@/components/maps/LocationSearch';
import { fetchRealRoute, RealRouteResult } from '@/lib/maps/routing';
import { reverseGeocode } from '@/lib/maps/geocoding';
import { ANOMALY_TIMEOUT_SECONDS, JOURNEY_MESSAGES } from '@/lib/config/journey';
import {
  Shield,
  Clock,
  AlertTriangle,
  Navigation,
  CheckCircle2,
  Play,
  Square,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Info,
  Layers,
  ChevronRight,
  Sparkles,
  Check,
  PhoneCall,
} from 'lucide-react';
import Link from 'next/link';

export type JourneyState =
  | 'IDLE'
  | 'ROUTE_SELECTED'
  | 'JOURNEY_ACTIVE'
  | 'STATIONARY_WARNING'
  | 'ROUTE_DEVIATION_WARNING'
  | 'EMERGENCY'
  | 'JOURNEY_COMPLETED';

export default function SafeJourneyTrackerPage() {
  const [journeyState, setJourneyState] = useState<JourneyState>('IDLE');

  // Location & Coordinate State
  const [startLoc, setStartLoc] = useState<string>('');
  const [destLoc, setDestLoc] = useState<string>('');
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  const [isLocatingOrigin, setIsLocatingOrigin] = useState(false);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Available OSRM Real Road Routes
  const [availableRoutes, setAvailableRoutes] = useState<RealRouteResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Database context data for deterministic risk analysis
  const [unsafeReports, setUnsafeReports] = useState<any[]>([]);
  const [emergencyResources, setEmergencyResources] = useState<any[]>([]);

  // Elapsed Journey Time (seconds)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 2-MINUTE (120 seconds) Anomaly Countdown Timer
  const [anomalyCountdown, setAnomalyCountdown] = useState<number>(ANOMALY_TIMEOUT_SECONDS);
  const [isAnomalyCountdownActive, setIsAnomalyCountdownActive] = useState<boolean>(false);

  // 15-second Unconfirmed Safety Modal Escalation Countdown Timer
  const [unconfirmedSecs, setUnconfirmedSecs] = useState<number>(15);

  // Tracking current position
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);

  // Modal alert
  const [showSafetyCheckModal, setShowSafetyCheckModal] = useState(false);

  // Fetch Database Reports & Emergency Resources for deterministic risk analysis
  useEffect(() => {
    async function loadContextData() {
      try {
        const repRes = await fetch('/api/reports');
        const repData = await repRes.json();
        if (repData.reports) setUnsafeReports(repData.reports);

        const resRes = await fetch('/api/resources');
        const resData = await resRes.json();
        if (resData.resources) setEmergencyResources(resData.resources);
      } catch (e) {
        console.error('Failed to load safety context data:', e);
      }
    }
    loadContextData();
  }, []);

  // Auto-detect browser GPS for origin on initial mount
  useEffect(() => {
    handleUseCurrentLocationAsOrigin();
  }, []);

  // Reverse Geocode GPS for Origin
  function handleUseCurrentLocationAsOrigin() {
    if (!navigator.geolocation) return;
    setIsLocatingOrigin(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setStartCoords([lat, lng]);

        try {
          const resolvedName = await reverseGeocode(lat, lng);
          setStartLoc(resolvedName.split(',')[0] || 'Current GPS Position');
        } catch (e) {
          setStartLoc('Current GPS Position');
        } finally {
          setIsLocatingOrigin(false);
        }
      },
      (err) => {
        setIsLocatingOrigin(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  }

  // Fetch Real Road Geometry via OSRM whenever startCoords or destCoords change
  useEffect(() => {
    if (!startCoords || !destCoords) {
      setAvailableRoutes([]);
      setSelectedRouteId(null);
      setRoutingError(null);
      if (journeyState === 'ROUTE_SELECTED') setJourneyState('IDLE');
      return;
    }

    async function calculateRoutes() {
      setRoutingLoading(true);
      setRoutingError(null);
      try {
        const routes = await fetchRealRoute(
          startCoords![0],
          startCoords![1],
          destCoords![0],
          destCoords![1],
          { unsafeReports, emergencyResources }
        );

        if (routes.length > 0) {
          setAvailableRoutes(routes);
          setSelectedRouteId(routes[0].id);
          setCurrentPosition(startCoords);
          setJourneyState('ROUTE_SELECTED');
        }
      } catch (err: any) {
        console.error('OSRM Route Calculation Error:', err);
        setAvailableRoutes([]);
        setSelectedRouteId(null);
        setRoutingError(err.message || JOURNEY_MESSAGES.ROUTING_FAILED);
      } finally {
        setRoutingLoading(false);
      }
    }

    calculateRoutes();
  }, [startCoords, destCoords, unsafeReports, emergencyResources]);

  // Selected Route object
  const activeRoute = availableRoutes.find((r) => r.id === selectedRouteId) || availableRoutes[0];

  // Journey Elapsed Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (journeyState === 'JOURNEY_ACTIVE' || journeyState === 'STATIONARY_WARNING' || journeyState === 'ROUTE_DEVIATION_WARNING') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;

          // Move user smoothly along actual OSRM road geometry points
          if (activeRoute && activeRoute.geometry.length > 0) {
            const stepIndex = Math.min(
              Math.floor((next / (activeRoute.durationMins * 60 || 60)) * activeRoute.geometry.length),
              activeRoute.geometry.length - 1
            );
            setCurrentPosition(activeRoute.geometry[stepIndex]);
          }

          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [journeyState, activeRoute]);

  // 2-MINUTE (120 seconds) Stationary Delay Anomaly Countdown Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnomalyCountdownActive && anomalyCountdown > 0) {
      timer = setInterval(() => {
        setAnomalyCountdown((prev) => {
          if (prev <= 1) {
            // Reached 00:00 (2 mins of no movement) -> Trigger Safety Check Modal!
            setIsAnomalyCountdownActive(false);
            setShowSafetyCheckModal(true);
            setJourneyState('STATIONARY_WARNING');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAnomalyCountdownActive, anomalyCountdown]);

  // 15-Second Automatic Unconfirmed Escalation Countdown when Modal is Open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showSafetyCheckModal) {
      setUnconfirmedSecs(15);
      interval = setInterval(() => {
        setUnconfirmedSecs((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // AUTOMATICALLY DISPATCH EMERGENCY CALLS if user is unresponsive / no movement!
            handleNeedHelp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSafetyCheckModal]);

  // Handle Journey Launch — AUTOMATICALLY ENABLES 2-MINUTE STATIONARY MONITORING
  function handleStartJourney() {
    if (!startCoords || !destCoords || !activeRoute) {
      setRoutingError('Please select both Origin and Destination from search results before launching.');
      return;
    }

    setJourneyState('JOURNEY_ACTIVE');
    setElapsedSeconds(0);
    setAnomalyCountdown(ANOMALY_TIMEOUT_SECONDS);
    setIsAnomalyCountdownActive(true); // Automatically active during journey!
    setShowSafetyCheckModal(false);
  }

  // Handle Journey Completion
  function handleEndJourney() {
    setJourneyState('JOURNEY_COMPLETED');
    setIsAnomalyCountdownActive(false);
    setShowSafetyCheckModal(false);
  }

  // Reset 2-Minute Timer on "I'm Safe"
  function handleImSafe() {
    setShowSafetyCheckModal(false);
    setAnomalyCountdown(ANOMALY_TIMEOUT_SECONDS);
    setIsAnomalyCountdownActive(true); // Resume stationary monitoring
    setJourneyState('JOURNEY_ACTIVE');
  }

  // Handle Emergency Assistance Dispatch (Automatic or Manual)
  async function handleNeedHelp() {
    setShowSafetyCheckModal(false);
    setJourneyState('EMERGENCY');

    const currLat = currentPosition ? currentPosition[0] : startCoords ? startCoords[0] : 20.5937;
    const currLng = currentPosition ? currentPosition[1] : startCoords ? startCoords[1] : 78.9629;

    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STATIONARY_NO_MOVEMENT_TIMEOUT',
          lat: currLat,
          lng: currLng,
          locationName: `Near ${destLoc || 'Journey Path'}`,
          triggerNote: '2-Minute stationary delay timer expired without user confirmation. Initiated emergency guardian calls.',
        }),
      });
      window.location.href = '/emergency';
    } catch (e) {
      console.error('Emergency dispatch error:', e);
      window.location.href = '/emergency';
    }
  }

  // Trigger 2-Minute Delay Timer Simulation
  function handleSimulateDelayTimeout() {
    setAnomalyCountdown(ANOMALY_TIMEOUT_SECONDS);
    setIsAnomalyCountdownActive(true);
    setJourneyState('STATIONARY_WARNING');
  }

  // Fast Expiry Modal Trigger for Testing
  function handleSimulateInstantExpiry() {
    setAnomalyCountdown(0);
    setIsAnomalyCountdownActive(false);
    setShowSafetyCheckModal(true);
    setJourneyState('STATIONARY_WARNING');
  }

  // Trigger Route Deviation Simulation
  function handleSimulateRouteDeviation() {
    setJourneyState('ROUTE_DEVIATION_WARNING');
  }

  // Format MM:SS for 2-minute countdown
  const countdownMinutes = Math.floor(anomalyCountdown / 60);
  const countdownSecs = anomalyCountdown % 60;
  const countdownFormatted = `${countdownMinutes.toString().padStart(2, '0')}:${countdownSecs.toString().padStart(2, '0')}`;

  // Format elapsed trip time
  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;
  const tripTimeFormatted = `${elapsedMins.toString().padStart(2, '0')}:${elapsedSecs.toString().padStart(2, '0')}`;

  // Map Markers
  const mapMarkers: MapMarker[] = [];
  if (startCoords) {
    mapMarkers.push({
      id: 'origin-marker',
      lat: startCoords[0],
      lng: startCoords[1],
      title: `Origin: ${startLoc}`,
      address: startLoc,
      type: 'ORIGIN',
    });
  }

  if (destCoords) {
    mapMarkers.push({
      id: 'destination-marker',
      lat: destCoords[0],
      lng: destCoords[1],
      title: `Destination: ${destLoc}`,
      address: destLoc,
      type: 'DESTINATION',
    });
  }

  if (currentPosition && journeyState === 'JOURNEY_ACTIVE') {
    mapMarkers.push({
      id: 'current-pos-marker',
      lat: currentPosition[0],
      lng: currentPosition[1],
      title: 'Current Live Position',
      type: 'USER_LOCATION',
    });
  }

  // Map Polylines
  const mapPolylines: MapPolyline[] = availableRoutes.map((rt) => ({
    id: rt.id,
    color:
      rt.id === selectedRouteId
        ? journeyState === 'ROUTE_DEVIATION_WARNING'
          ? '#f43f5e'
          : '#6366f1'
        : '#94a3b8',
    waypoints: rt.geometry,
    selected: rt.id === selectedRouteId,
  }));

  const mapCenter: [number, number] = currentPosition
    ? currentPosition
    : startCoords
    ? startCoords
    : [20.5937, 78.9629];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8 font-sans">
      <DemoBanner />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Pan-India Safe Journey Tracker
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">Safe Journey Tracker</h1>
            <p className="text-xs sm:text-sm text-navy-300 mt-0.5">
              Real OSRM road routes across India with 2-minute stationary delay & automatic guardian phone calling.
            </p>
          </div>

          {/* Development Demo Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-navy-400 font-semibold">Demo Controls:</span>
            <button
              onClick={handleSimulateDelayTimeout}
              disabled={journeyState !== 'JOURNEY_ACTIVE'}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-40 transition"
              title="Start 2-minute countdown timer"
            >
              ⏱️ Start 2-Min Timer
            </button>
            <button
              onClick={handleSimulateInstantExpiry}
              disabled={journeyState !== 'JOURNEY_ACTIVE'}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-500/30 disabled:opacity-40 transition"
              title="Trigger 2-minute alert modal immediately"
            >
              🚨 Instant 2-Min Alert
            </button>
            <button
              onClick={handleSimulateRouteDeviation}
              disabled={journeyState !== 'JOURNEY_ACTIVE'}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-500/30 disabled:opacity-40 transition"
            >
              ⚠️ Route Deviation
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Origin & Destination Selection Card */}
            <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-2xl shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4.5 h-4.5 text-indigo-400" /> Origin & Destination
                </h3>
                <button
                  onClick={handleUseCurrentLocationAsOrigin}
                  disabled={isLocatingOrigin}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  {isLocatingOrigin ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  Use My GPS
                </button>
              </div>

              {/* Error Notice */}
              {routingError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">Routing Error</span>
                    <span>{routingError}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* 🟢 Origin Search */}
                <div>
                  <label className="block font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <span>🟢</span> Origin (Starting Location)
                  </label>
                  <LocationSearch
                    placeholder="Search origin in India (e.g., Vidisha, Bhopal, MP Nagar)..."
                    initialValue={startLoc}
                    onSelectLocation={(loc: LocationSearchResult) => {
                      setStartLoc(loc.name);
                      setStartCoords([loc.lat, loc.lng]);
                    }}
                  />
                  {startCoords && (
                    <div className="text-[10px] text-navy-400 mt-1 pl-1">
                      Lat: {startCoords[0].toFixed(4)}, Lng: {startCoords[1].toFixed(4)}
                    </div>
                  )}
                </div>

                {/* 🔴 Destination Search */}
                <div>
                  <label className="block font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                    <span>🔴</span> Destination (Target Location)
                  </label>
                  <LocationSearch
                    placeholder="Search destination in India (e.g., Haripura, Kota, Sironj)..."
                    initialValue={destLoc}
                    onSelectLocation={(loc: LocationSearchResult) => {
                      setDestLoc(loc.name);
                      setDestCoords([loc.lat, loc.lng]);
                    }}
                  />
                  {destCoords && (
                    <div className="text-[10px] text-navy-400 mt-1 pl-1">
                      Lat: {destCoords[0].toFixed(4)}, Lng: {destCoords[1].toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ROUTE OPTIONS SECTION */}
            {routingLoading ? (
              <div className="p-8 text-center bg-navy-900/60 border border-navy-800 rounded-2xl text-navy-300 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                <div className="text-xs font-semibold">Calculating real OSRM road routes & safety indicators...</div>
              </div>
            ) : availableRoutes.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider text-navy-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" /> Available Route Options ({availableRoutes.length})
                  </h3>
                  <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Real Road Geometry
                  </span>
                </div>

                <div className="space-y-3">
                  {availableRoutes.map((route) => {
                    const isSelected = route.id === selectedRouteId;
                    const isLowerRisk = route.tag.includes('Lower-Risk');

                    return (
                      <div
                        key={route.id}
                        onClick={() => setSelectedRouteId(route.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition shadow-md ${
                          isSelected
                            ? 'bg-navy-800 border-indigo-500 ring-1 ring-indigo-500/50'
                            : 'bg-navy-900/60 border-navy-800 hover:bg-navy-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{route.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                isLowerRisk
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              }`}
                            >
                              {route.tag}
                            </span>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-navy-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>

                        {/* Distance & Travel Time */}
                        <div className="flex items-center gap-4 text-xs text-navy-200 mt-2 font-semibold">
                          <span>Distance: <strong className="text-white">{route.distanceKm} km</strong></span>
                          <span>Est Duration: <strong className="text-white">{route.durationMins} min</strong></span>
                        </div>

                        {/* Explainable Risk Indicators */}
                        <div className="mt-3 pt-2.5 border-t border-navy-700/60 space-y-1">
                          <div className="text-[11px] font-bold text-navy-300">Safety Risk Indicators:</div>
                          {route.reasons.map((r, idx) => (
                            <div key={idx} className="text-[11px] text-navy-300 flex items-start gap-1.5 leading-tight">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Disclaimer */}
                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-[10px] text-navy-400 leading-normal">
                  ℹ️ {JOURNEY_MESSAGES.SAFETY_DISCLAIMER}
                </div>

                {/* Launch Button */}
                {journeyState !== 'JOURNEY_ACTIVE' ? (
                  <button
                    onClick={handleStartJourney}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" /> Launch Live Journey Tracking
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        JOURNEY ACTIVE
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        Elapsed: {tripTimeFormatted}
                      </span>
                    </div>

                    {isAnomalyCountdownActive && (
                      <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between">
                        <span>Stationary Delay Monitor:</span>
                        <span className="font-mono text-sm">{countdownFormatted}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleEndJourney}
                        className="flex-1 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" /> End Journey
                      </button>

                      <Link
                        href="/emergency"
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-4 h-4" /> SOS
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

          </div>

          {/* Right Column: Leaflet Map Canvas displaying real route polylines (7 Cols) */}
          <div className="lg:col-span-7 h-[560px]">
            <div className="h-full w-full bg-navy-900/90 p-2 rounded-2xl border border-navy-800 shadow-2xl overflow-hidden relative">
              <MapContainer
                center={mapCenter}
                zoom={startCoords && destCoords ? 12 : 6}
                markers={mapMarkers}
                polylines={mapPolylines}
              />
            </div>
          </div>

        </div>

        {/* 2-MINUTE STATIONARY NO-MOVEMENT SAFETY ALERT MODAL */}
        {showSafetyCheckModal && (
          <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-navy-900 border-2 border-rose-500 max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl text-center space-y-6 animate-in fade-in zoom-in">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border-2 border-rose-500/40">
                <AlertTriangle className="w-8 h-8 animate-bounce text-rose-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">"Are you okay?"</h3>
                <p className="text-xs text-navy-200 leading-relaxed">
                  No movement detected for <strong className="text-amber-400">2 minutes</strong>.
                </p>
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold animate-pulse">
                  🚨 Auto-initiating emergency guardian calls in <span className="text-white text-base font-black">{unconfirmedSecs}s</span> if unconfirmed!
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleImSafe}
                  className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> I'M SAFE
                </button>

                <button
                  onClick={handleNeedHelp}
                  className="py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 sos-active-pulse"
                >
                  <PhoneCall className="w-5 h-5" /> CALL GUARDIANS NOW
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <MobileNav />
    </div>
  );
}
