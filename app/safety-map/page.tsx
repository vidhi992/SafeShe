'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { MapContainer, MapMarker, MapPolyline } from '@/components/map/map-container';
import { LocationSearch, LocationSearchResult } from '@/components/maps/LocationSearch';
import { fetchRealRoute, RealRouteResult } from '@/lib/maps/routing';
import { analyzeRouteSafety, SafetyAnalysisResult } from '@/services/safety/safetyAnalysis';
import { Navigation, ShieldAlert, Sparkles, MapPin, Clock, AlertTriangle, ShieldCheck, Layers, ChevronRight, Search, Globe } from 'lucide-react';
import Link from 'next/link';

export default function SafetyMapPage() {
  const [startLocation, setStartLocation] = useState('Select Starting Origin');
  const [destination, setDestination] = useState('Select Destination Location');
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Real Database Records loaded from API
  const [unsafeReports, setUnsafeReports] = useState<any[]>([]);
  const [emergencyResources, setEmergencyResources] = useState<any[]>([]);
  const [routes, setRoutes] = useState<RealRouteResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('osrm-route-0');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  useEffect(() => {
    if (startCoords && destCoords) {
      handleCalculateRoutes();
    }
  }, [startCoords, destCoords]);

  async function fetchDatabaseData() {
    try {
      const repRes = await fetch('/api/reports');
      const repData = await repRes.json();
      if (repData.reports) setUnsafeReports(repData.reports);

      const resRes = await fetch('/api/resources');
      const resData = await resRes.json();
      if (resData.resources) setEmergencyResources(resData.resources);
    } catch (e) {
      console.error('Error fetching database markers:', e);
    }
  }

  async function handleCalculateRoutes() {
    if (!startCoords || !destCoords) return;
    setAnalyzing(true);
    try {
      const realRoutes = await fetchRealRoute(startCoords[0], startCoords[1], destCoords[0], destCoords[1]);
      setRoutes(realRoutes);
      if (realRoutes.length > 0) {
        setSelectedRouteId(realRoutes[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  }

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Run Safety Analysis engine on selected route
  const safetyAnalysis: SafetyAnalysisResult | null = selectedRoute
    ? analyzeRouteSafety({
        routePoints: selectedRoute.geometry,
        departureTime: new Date(),
        unsafeReports,
        emergencyResources,
      })
    : null;

  // Prepare Real Map Markers
  const mapMarkers: MapMarker[] = [];
  if (startCoords) {
    mapMarkers.push({
      id: 'start-point',
      lat: startCoords[0],
      lng: startCoords[1],
      title: `Start: ${startLocation}`,
      type: 'USER_LOCATION',
    });
  }
  if (destCoords) {
    mapMarkers.push({
      id: 'dest-point',
      lat: destCoords[0],
      lng: destCoords[1],
      title: `Destination: ${destination}`,
      type: 'SEARCH_PIN',
    });
  }

  unsafeReports.forEach((r) => {
    mapMarkers.push({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      title: r.category,
      description: r.description,
      address: r.locationName,
      type: 'UNSAFE_REPORT',
    });
  });

  emergencyResources.forEach((res) => {
    mapMarkers.push({
      id: res.id,
      lat: res.lat,
      lng: res.lng,
      title: res.name,
      category: res.category,
      address: res.address,
      phone: res.phone,
      type: 'EMERGENCY_RESOURCE',
    });
  });

  // Map Road Polylines
  const mapPolylines: MapPolyline[] = routes.map((r) => ({
    id: r.id,
    color: r.id === selectedRouteId ? '#6366f1' : '#94a3b8',
    waypoints: r.geometry,
  }));

  const mapCenter: [number, number] = startCoords
    ? startCoords
    : destCoords
    ? destCoords
    : [20.5937, 78.9629]; // Central India

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8 font-sans">
      <DemoBanner />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wide mb-2">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Pan-India Real Road Routing & AI Safety Engine
            </div>
            <h1 className="text-3xl font-extrabold text-white">AI Safety Risk Map</h1>
            <p className="text-xs sm:text-sm text-navy-300 mt-1">
              Calculate street geometry routes for any city, town, or district in India.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                showHeatmap
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-navy-800 border-navy-700 text-navy-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              {showHeatmap ? 'Safety Heatmap Layer ON' : 'Show Safety Heatmap'}
            </button>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase tracking-wider">Safety Indicators:</span> Calculated from spatial proximity to verified emergency services and safety reports across India.
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Origin & Destination Real Search */}
            <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-indigo-400" /> Route Search Across India
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-navy-200 mb-1">Starting Origin</label>
                  <LocationSearch
                    placeholder="Search origin (e.g., Vidisha, Haripura, MP Nagar Bhopal)..."
                    onSelectLocation={(loc: LocationSearchResult) => {
                      setStartLocation(loc.name);
                      setStartCoords([loc.lat, loc.lng]);
                    }}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-200 mb-1">Destination</label>
                  <LocationSearch
                    placeholder="Search destination (e.g., Kota, Sironj, AIIMS Delhi)..."
                    onSelectLocation={(loc: LocationSearchResult) => {
                      setDestination(loc.name);
                      setDestCoords([loc.lat, loc.lng]);
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCalculateRoutes}
                  disabled={analyzing || !startCoords || !destCoords}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {analyzing ? 'Routing Real Roads...' : 'Calculate Real Street Route'}
                </button>
              </div>
            </div>

            {/* Analyzed Route Cards */}
            {routes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-navy-300">
                  Analyzed Real Road Routes ({routes.length})
                </h3>

                {routes.map((route) => {
                  const isSelected = route.id === selectedRouteId;
                  const score = safetyAnalysis ? safetyAnalysis.indicator : route.riskCategory;
                  let badgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                  if (score === 'Moderate-Risk' || score === 'MODERATE') badgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                  if (score === 'Higher-Risk' || score === 'HIGH') badgeBg = 'bg-rose-500/20 text-rose-400 border-rose-500/30';

                  return (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`p-5 rounded-2xl cursor-pointer transition border ${
                        isSelected
                          ? 'bg-navy-800 border-indigo-500 shadow-xl'
                          : 'bg-navy-900/60 border-navy-800 hover:bg-navy-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{route.name}</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                            {route.tag}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase ${badgeBg}`}>
                          Risk: {score}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-navy-300 mb-3">
                        <span>Distance: <strong className="text-white">{route.distanceKm} km</strong></span>
                        <span>Est Time: <strong className="text-white">{route.durationMins} mins</strong></span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-navy-700/60">
                        {(safetyAnalysis ? safetyAnalysis.reasons : route.reasons).map((reason, idx) => (
                          <div key={idx} className="text-[11px] text-navy-300 flex items-start gap-1.5 leading-tight">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Launch Journey Button */}
            {selectedRoute && (
              <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Selected: {selectedRoute.name}</div>
                  <div className="text-[10px] text-indigo-300">Ready for live GPS journey monitoring</div>
                </div>
                <Link
                  href="/journey"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                >
                  Start Journey <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

          </div>

          {/* Right Column: OpenStreetMap Canvas (7 Cols) */}
          <div className="lg:col-span-7 h-[600px] lg:h-auto min-h-[520px]">
            <div className="h-full w-full bg-navy-900/90 p-2 rounded-2xl border border-navy-800 shadow-2xl">
              <MapContainer
                center={mapCenter}
                zoom={startCoords && destCoords ? 12 : 6}
                markers={mapMarkers}
                polylines={mapPolylines}
                showHeatmap={showHeatmap}
              />
            </div>
          </div>

        </div>

      </main>

      <MobileNav />
    </div>
  );
}
