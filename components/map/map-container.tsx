'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { LocationSearch } from '@/components/maps/LocationSearch';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/maps/locations';
import { MapPin, Navigation, Layers, RefreshCw, Maximize2, Shield, AlertTriangle, Check, RotateCcw } from 'lucide-react';

const DynamicLeafletMap = dynamic(() => import('./leaflet-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] rounded-2xl bg-navy-900/80 border border-navy-800 flex items-center justify-center text-navy-300">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold">Loading Real OpenStreetMap Data...</span>
      </div>
    </div>
  ),
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category?: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  type: 'UNSAFE_REPORT' | 'EMERGENCY_RESOURCE' | 'USER_LOCATION' | 'HELPER' | 'SEARCH_PIN' | 'ORIGIN' | 'DESTINATION';
}

export interface MapPolyline {
  id: string;
  color: string;
  waypoints: Array<[number, number]>;
}

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  polylines?: MapPolyline[];
  showHeatmap?: boolean;
  showSearch?: boolean;
}

export function MapContainer({
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  markers = [],
  polylines = [],
  showHeatmap: initialHeatmap = true,
  showSearch = true,
}: MapContainerProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);
  const [currentMarkers, setCurrentMarkers] = useState<MapMarker[]>(markers);
  const [showHeatmap, setShowHeatmap] = useState(initialHeatmap);
  const [showEmergencyResources, setShowEmergencyResources] = useState(true);
  const [showSafetyReports, setShowSafetyReports] = useState(true);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [mapError, setMapError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Geolocation Handler
  function handleGetUserLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('Location access is disabled in browser.');
      return;
    }

    setLocationStatus('Locating current GPS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setMapCenter([userLat, userLng]);
        setMapZoom(15);
        setLocationStatus(null);

        // Add or update User Location marker
        const userMarker: MapMarker = {
          id: 'user-live-pos',
          lat: userLat,
          lng: userLng,
          title: 'Your Current Position',
          description: 'Verified GPS Location',
          type: 'USER_LOCATION',
        };

        setCurrentMarkers((prev) => [
          userMarker,
          ...prev.filter((m) => m.id !== 'user-live-pos'),
        ]);
      },
      (err) => {
        setLocationStatus('Location access is disabled. Search for a location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Location Search Handler
  function handleSelectSearchLocation(loc: { name: string; lat: number; lng: number; displayName: string }) {
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(15);

    const searchMarker: MapMarker = {
      id: `search-pin-${Date.now()}`,
      lat: loc.lat,
      lng: loc.lng,
      title: loc.name,
      address: loc.displayName,
      type: 'SEARCH_PIN',
    };

    setCurrentMarkers((prev) => [searchMarker, ...prev.filter((m) => m.type !== 'SEARCH_PIN')]);
  }

  function handleResetView() {
    setMapCenter(DEFAULT_MAP_CENTER);
    setMapZoom(DEFAULT_MAP_ZOOM);
    setLocationStatus(null);
  }

  return (
    <div
      className={`w-full relative rounded-2xl overflow-hidden border border-navy-700/80 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0 h-screen' : 'h-full min-h-[420px]'
      }`}
    >
      {/* Search & Location Bar */}
      {showSearch && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-80 z-20 space-y-1.5">
          <LocationSearch onSelectLocation={handleSelectSearchLocation} />
          {locationStatus && (
            <div className="p-2 rounded-xl bg-navy-950/90 border border-amber-500/40 text-[11px] text-amber-300 font-medium shadow-lg backdrop-blur-md">
              {locationStatus}
            </div>
          )}
        </div>
      )}

      {/* Floating Control Toolbar */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleGetUserLocation}
          title="Get My Location"
          className="w-9 h-9 rounded-xl bg-navy-900/90 hover:bg-navy-800 border border-navy-700 text-white flex items-center justify-center shadow-lg transition backdrop-blur-md"
        >
          <Navigation className="w-4 h-4 text-indigo-400" />
        </button>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          title="Toggle Safety Heatmap"
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-lg transition backdrop-blur-md ${
            showHeatmap
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-navy-900/90 border-navy-700 text-navy-400'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetView}
          title="Reset Map View to Bhopal"
          className="w-9 h-9 rounded-xl bg-navy-900/90 hover:bg-navy-800 border border-navy-700 text-white flex items-center justify-center shadow-lg transition backdrop-blur-md"
        >
          <RotateCcw className="w-4 h-4 text-indigo-300" />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title="Toggle Fullscreen"
          className="w-9 h-9 rounded-xl bg-navy-900/90 hover:bg-navy-800 border border-navy-700 text-white flex items-center justify-center shadow-lg transition backdrop-blur-md"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Filter Pills */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setShowEmergencyResources(!showEmergencyResources)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition backdrop-blur-md flex items-center gap-1 ${
            showEmergencyResources
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-navy-900/80 border-navy-700 text-navy-400'
          }`}
        >
          <span>🚓 Police & Hospitals</span>
        </button>

        <button
          onClick={() => setShowSafetyReports(!showSafetyReports)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition backdrop-blur-md flex items-center gap-1 ${
            showSafetyReports
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-navy-900/80 border-navy-700 text-navy-400'
          }`}
        >
          <span>⚠️ Safety Reports</span>
        </button>
      </div>

      {/* OpenStreetMap Attribution Footer */}
      <div className="absolute bottom-1 right-3 z-10 text-[9px] text-navy-300 bg-navy-950/80 px-2 py-0.5 rounded border border-navy-800 pointer-events-none">
        © OpenStreetMap contributors
      </div>

      {/* Map Error Fallback Container */}
      {mapError ? (
        <div className="w-full h-full min-h-[380px] bg-navy-950 flex flex-col items-center justify-center p-6 text-center space-y-3 border border-navy-800">
          <AlertTriangle className="w-10 h-10 text-rose-400" />
          <h4 className="text-base font-bold text-white">Map couldn't be loaded</h4>
          <p className="text-xs text-navy-300 max-w-sm">
            Please check your internet connection or network configuration.
          </p>
          <button
            onClick={() => setMapError(false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
          >
            Retry Loading Map
          </button>
        </div>
      ) : (
        <DynamicLeafletMap
          center={mapCenter}
          zoom={mapZoom}
          markers={currentMarkers.length > 0 ? currentMarkers : markers}
          polylines={polylines}
          showHeatmap={showHeatmap}
          showEmergencyResources={showEmergencyResources}
          showSafetyReports={showSafetyReports}
        />
      )}
    </div>
  );
}
