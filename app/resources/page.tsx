'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { DemoBanner } from '@/components/demo-banner';
import { MapContainer, MapMarker } from '@/components/map/map-container';
import { INDIA_STATES_AND_UTS, StateRegion } from '@/lib/maps/india-regions';
import { formatDistance } from '@/lib/geo';
import {
  PhoneCall,
  Shield,
  Hospital,
  Building2,
  Navigation,
  Search,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Compass,
  ChevronRight,
  Filter,
  ShieldAlert,
  HeartHandshake,
  Settings,
} from 'lucide-react';

interface ResourceItem {
  id: string;
  name: string;
  category: string;
  state: string;
  district: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  website: string | null;
  description: string | null;
  services: string | null;
  availability: string | null;
  source: string | null;
  verified: boolean;
  lastVerifiedAt: string | null;
  distanceKm?: number | null;
}

export default function PanIndiaEmergencyResourceCenter() {
  // Location state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    displayName: string;
    state?: string;
    district?: string;
  } | null>(null);

  const [locationStatus, setLocationStatus] = useState<string>(
    'Detecting location or select location manually...'
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isChangeLocationOpen, setIsChangeLocationOpen] = useState<boolean>(false);

  // Filters & Search
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data state
  const [nationalHelplines, setNationalHelplines] = useState<ResourceItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial load: Fetch resources & request location
  useEffect(() => {
    fetchResources('All', 'All', 'ALL', '', null, null);
    requestBrowserLocation();
  }, []);

  // Request GPS Geolocation from browser
  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Locating current GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let displayName = `${lat.toFixed(3)}° N, ${lng.toFixed(3)}° E`;
        let detectedState = 'All';
        let detectedDistrict = 'All';

        // Try reverse geocoding via Nominatim
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            const address = revData.address;
            const city =
              address.city || address.town || address.village || address.suburb || address.county;
            const state = address.state;
            if (city && state) {
              displayName = `${city}, ${state}`;
            } else if (state) {
              displayName = state;
            }

            // Match state from INDIA_STATES_AND_UTS
            if (state) {
              const matchedState = INDIA_STATES_AND_UTS.find(
                (s) => state.toLowerCase().includes(s.state.toLowerCase()) || s.state.toLowerCase().includes(state.toLowerCase())
              );
              if (matchedState) {
                detectedState = matchedState.state;
                setSelectedState(matchedState.state);
              }
            }
          }
        } catch (e) {
          console.log('Reverse geocode note:', e);
        }

        setUserLocation({
          lat,
          lng,
          displayName,
          state: detectedState,
          district: detectedDistrict,
        });

        setIsLocating(false);
        setLocationStatus('');

        // Fetch location-aware resources sorted by Haversine distance
        fetchResources(detectedState, detectedDistrict, selectedCategory, searchQuery, lat, lng);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('Location access denied or unavailable. Choose a state or search for a city below.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Main API fetch function
  const fetchResources = async (
    st: string,
    dist: string,
    cat: string,
    q: string,
    lat: number | null,
    lng: number | null
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (st && st !== 'All') params.set('state', st);
      if (dist && dist !== 'All') params.set('district', dist);
      if (cat && cat !== 'ALL') params.set('category', cat);
      if (q && q.trim()) params.set('search', q.trim());
      if (lat !== null) params.set('lat', String(lat));
      if (lng !== null) params.set('lng', String(lng));

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setNationalHelplines(data.nationalHelplines || []);
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Failed to fetch emergency resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever manual state, district, category or search query changes
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedDistrict('All');
    let lat: number | null = userLocation ? userLocation.lat : null;
    let lng: number | null = userLocation ? userLocation.lng : null;

    if (stateName !== 'All') {
      const stObj = INDIA_STATES_AND_UTS.find((s) => s.state === stateName);
      if (stObj && !userLocation) {
        lat = stObj.lat;
        lng = stObj.lng;
      }
    }
    fetchResources(stateName, 'All', selectedCategory, searchQuery, lat, lng);
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    const lat: number | null = userLocation ? userLocation.lat : null;
    const lng: number | null = userLocation ? userLocation.lng : null;
    fetchResources(selectedState, districtName, selectedCategory, searchQuery, lat, lng);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const lat: number | null = userLocation ? userLocation.lat : null;
    const lng: number | null = userLocation ? userLocation.lng : null;
    fetchResources(selectedState, selectedDistrict, cat, searchQuery, lat, lng);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat: number | null = userLocation ? userLocation.lat : null;
    const lng: number | null = userLocation ? userLocation.lng : null;
    fetchResources(selectedState, selectedDistrict, selectedCategory, searchQuery, lat, lng);
  };

  // Map markers generator
  const mapMarkers: MapMarker[] = useMemo(() => {
    const markersList: MapMarker[] = [];

    // Add User Location marker if available
    if (userLocation) {
      markersList.push({
        id: 'user-current-pos',
        lat: userLocation.lat,
        lng: userLocation.lng,
        title: `Your Location: ${userLocation.displayName}`,
        description: 'Verified GPS Coordinates',
        type: 'USER_LOCATION',
      });
    }

    // Add resource markers
    resources.forEach((r) => {
      let markerType: MapMarker['type'] = 'EMERGENCY_RESOURCE';
      let categoryTag = 'Hospital';
      if (r.category === 'POLICE') categoryTag = 'Police';
      if (r.category === 'ONE_STOP_CENTRE') categoryTag = 'One Stop Centre';

      markersList.push({
        id: r.id,
        lat: r.lat,
        lng: r.lng,
        title: r.name,
        category: categoryTag,
        address: `${r.address} (${r.city})`,
        phone: r.phone || undefined,
        description: r.services || r.description || undefined,
        type: markerType,
      });
    });

    return markersList;
  }, [userLocation, resources]);

  // Center coordinates for the Leaflet Map
  const mapCenter: [number, number] = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    if (selectedState !== 'All') {
      const stObj = INDIA_STATES_AND_UTS.find((s) => s.state === selectedState);
      if (stObj) return [stObj.lat, stObj.lng];
    }
    return [20.5937, 78.9629]; // Central India coordinates
  }, [userLocation, selectedState]);

  const mapZoom = userLocation ? 13 : selectedState !== 'All' ? 10 : 5;

  // Available districts for the selected state
  const availableDistricts = useMemo(() => {
    if (selectedState === 'All') return [];
    const stObj = INDIA_STATES_AND_UTS.find((s) => s.state === selectedState);
    return stObj ? stObj.districts : [];
  }, [selectedState]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col pb-24 md:pb-8 font-sans">
      <DemoBanner />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-8">
        
        {/* 1. Header & Location Bar */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wide">
                <Globe className="w-3.5 h-3.5 text-rose-400" />
                🇮🇳 Pan-India Emergency Directory
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Emergency Resource Center
              </h1>
              <p className="text-xs sm:text-sm text-navy-300 mt-0.5">
                Verified nationwide 24/7 helplines, police cells, Sakhi One Stop Centres, and trauma hospitals.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/resources"
                className="px-3.5 py-2 rounded-xl bg-navy-800/80 hover:bg-navy-700 border border-navy-700 text-xs text-navy-300 hover:text-white font-medium flex items-center gap-1.5 transition"
              >
                <Settings className="w-3.5 h-3.5" />
                Admin Portal
              </Link>
            </div>
          </div>

          {/* Current Location Badge & Change Location Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-navy-800/80">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-navy-400 block font-medium">Using Location:</span>
                <span className="font-bold text-white text-sm">
                  {userLocation ? (
                    `📍 ${userLocation.displayName}`
                  ) : (
                    <span className="text-amber-400 font-semibold">
                      Location access not enabled. Select state or city below.
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={requestBrowserLocation}
                disabled={isLocating}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isLocating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                {isLocating ? 'Detecting GPS...' : 'Use My GPS Location'}
              </button>

              <button
                onClick={() => setIsChangeLocationOpen(!isChangeLocationOpen)}
                className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs text-navy-200 font-semibold flex items-center gap-1.5 transition"
              >
                <Compass className="w-3.5 h-3.5 text-navy-400" />
                {isChangeLocationOpen ? 'Close Selectors' : 'Change Location'}
              </button>
            </div>
          </div>

          {/* Fallback Warning Notice if location detection failed */}
          {locationStatus && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{locationStatus}</span>
            </div>
          )}

          {/* Location Selectors Drawer */}
          {isChangeLocationOpen && (
            <div className="pt-4 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-navy-300 mb-1">Select State / UT (36 Regions)</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-rose-500"
                >
                  <option value="All">🇮🇳 All States & Union Territories</option>
                  {INDIA_STATES_AND_UTS.map((reg) => (
                    <option key={reg.state} value={reg.state}>
                      {reg.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-300 mb-1">Select District / City</label>
                <select
                  value={selectedDistrict}
                  disabled={selectedState === 'All'}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-rose-500 disabled:opacity-50"
                >
                  <option value="All">All Districts in {selectedState}</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-300 mb-1">Search City or Place</label>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Jaipur / AIIMS / Indore..."
                    className="w-full pl-8 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                  <Search className="w-3.5 h-3.5 text-navy-400 absolute left-2.5 top-2.5" />
                </form>
              </div>
            </div>
          )}
        </div>

        {/* 2. 🇮🇳 NATIONAL EMERGENCY SUPPORT HELPLINES (Pinned Banner) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              🇮🇳 Pinned National Emergency Support
            </h2>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              Available 24/7 Pan-India
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 112 ERSS */}
            <div className="bg-gradient-to-br from-rose-950/80 to-navy-900 border border-rose-500/40 p-4 rounded-2xl shadow-lg space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold text-[10px]">
                    NATIONAL EMERGENCY
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 24/7 Verified
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">112</h3>
                <p className="text-xs font-semibold text-rose-200">
                  Unified Emergency Response Support System (ERSS)
                </p>
                <p className="text-[11px] text-navy-300 mt-1">
                  Single helpline for Police, Fire, Ambulance & Women dispatch across India.
                </p>
              </div>
              <div className="pt-2 border-t border-rose-900/50 flex items-center justify-between">
                <a
                  href="tel:112"
                  className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> CALL 112
                </a>
              </div>
            </div>

            {/* 181 Women Helpline */}
            <div className="bg-gradient-to-br from-pink-950/80 to-navy-900 border border-pink-500/40 p-4 rounded-2xl shadow-lg space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-extrabold text-[10px]">
                    WOMEN HELPLINE
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 24/7 Verified
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">181</h3>
                <p className="text-xs font-semibold text-pink-200">Women Helpline (Mission Shakti)</p>
                <p className="text-[11px] text-navy-300 mt-1">
                  Toll-free 24/7 support, Sakhi OSC transfer, legal aid & crisis referral.
                </p>
              </div>
              <div className="pt-2 border-t border-pink-900/50 flex items-center justify-between">
                <a
                  href="tel:181"
                  className="w-full py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> CALL 181
                </a>
              </div>
            </div>

            {/* 1098 Childline */}
            <div className="bg-navy-900/90 border border-navy-700 p-4 rounded-2xl shadow-lg space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px]">
                    CHILD HELPLINE
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 24/7 Verified
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">1098</h3>
                <p className="text-xs font-semibold text-indigo-200">Childline India Emergency</p>
                <p className="text-[11px] text-navy-300 mt-1">
                  Emergency rescue & protection services for children in distress.
                </p>
              </div>
              <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
                <a
                  href="tel:1098"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> CALL 1098
                </a>
              </div>
            </div>

            {/* 139 Railway Protection */}
            <div className="bg-navy-900/90 border border-navy-700 p-4 rounded-2xl shadow-lg space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">
                    RAILWAY HELPLINE
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 24/7 Verified
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">139</h3>
                <p className="text-xs font-semibold text-amber-200">Indian Railways Security</p>
                <p className="text-[11px] text-navy-300 mt-1">
                  Unified Railway Protection Force (RPF) & onboard passenger assistance.
                </p>
              </div>
              <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
                <a
                  href="tel:139"
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> CALL 139
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE MAP SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-400" />
              Interactive Resource Location Map
            </h2>
            <span className="text-xs text-navy-300">
              Showing markers for {selectedState === 'All' ? 'Pan-India' : selectedState}
            </span>
          </div>

          <div className="h-[380px] rounded-2xl overflow-hidden border border-navy-800 shadow-2xl">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              markers={mapMarkers}
              showHeatmap={false}
              showSearch={false}
            />
          </div>
        </div>

        {/* 4. CATEGORY FILTER PILLS & SEARCH */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'All Resources', icon: Building2 },
                { id: 'POLICE', label: 'Police Stations', icon: Shield },
                { id: 'HOSPITAL', label: 'Hospitals', icon: Hospital },
                { id: 'ONE_STOP_CENTRE', label: 'One Stop Centres (OSC)', icon: HeartHandshake },
                { id: 'TRAUMA_CENTER', label: 'Trauma Centres', icon: Hospital },
                { id: 'LEGAL_SUPPORT', label: 'Legal Aid', icon: Building2 },
                { id: 'WOMEN_SUPPORT', label: 'Women Support', icon: ShieldAlert },
              ].map((c) => {
                const IconComp = c.icon;
                const isActive = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleCategoryChange(c.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                      isActive
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950'
                        : 'bg-navy-900 hover:bg-navy-800 text-navy-300 border-navy-800'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    {c.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location, hospital, police..."
                className="w-full pl-9 pr-4 py-2 bg-navy-900 border border-navy-700 rounded-xl text-xs text-white placeholder-navy-400 focus:outline-none focus:border-rose-500"
              />
              <Search className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-navy-300 px-1">
            <div>
              Found <span className="font-bold text-white">{resources.length}</span> verified emergency resources in{' '}
              <span className="text-rose-400 font-semibold">{selectedState}</span>
            </div>
            {userLocation && (
              <div className="text-emerald-400 font-medium flex items-center gap-1">
                <Navigation className="w-3 h-3" /> Sorted by nearest distance
              </div>
            )}
          </div>
        </div>

        {/* 5. LOCATION-AWARE RESOURCE CARDS GRID */}
        {loading ? (
          <div className="py-16 text-center text-navy-300">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-500" />
            Fetching verified Pan-India emergency resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="py-16 text-center bg-navy-900/60 border border-navy-800 rounded-2xl p-8 space-y-3">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No resources found for this search filter</h3>
            <p className="text-xs text-navy-300 max-w-md mx-auto">
              Try selecting a different state, changing category filters, or search for another city.
            </p>
            <button
              onClick={() => {
                setSelectedState('All');
                setSelectedDistrict('All');
                setSelectedCategory('ALL');
                setSearchQuery('');
                fetchResources('All', 'All', 'ALL', '', userLocation?.lat || null, userLocation?.lng || null);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
            >
              Reset Filters to All India
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => {
              const categoryBadge =
                res.category === 'POLICE'
                  ? { label: 'Police Resource', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
                  : res.category === 'ONE_STOP_CENTRE'
                  ? { label: 'Sakhi One Stop Centre', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' }
                  : res.category === 'TRAUMA_CENTER'
                  ? { label: 'Trauma Centre', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
                  : res.category === 'HOSPITAL'
                  ? { label: 'Government Hospital', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
                  : { label: res.category.replace('_', ' '), color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };

              return (
                <div
                  key={res.id}
                  className="bg-navy-900/80 border border-navy-800 hover:border-navy-700 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-lg transition hover:shadow-xl group"
                >
                  <div className="space-y-2">
                    {/* Category pill & verified status */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${categoryBadge.color}`}>
                        {categoryBadge.label}
                      </span>
                      {res.verified ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-navy-400">
                          Source: {res.source || 'Public Portal'}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-white text-base group-hover:text-rose-300 transition line-clamp-1">
                      {res.name}
                    </h3>

                    {/* Location & Distance */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-navy-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-medium text-slate-200">{res.city}, {res.state}</span>
                        {res.distanceKm !== undefined && res.distanceKm !== null && (
                          <span className="ml-auto font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            📍 {formatDistance(res.distanceKm)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-navy-400 line-clamp-2 pl-5">{res.address}</p>
                    </div>

                    {/* Services / Description */}
                    {res.services && (
                      <div className="text-[11px] text-navy-300 bg-navy-950/70 p-2.5 rounded-xl border border-navy-800/80">
                        <span className="font-semibold text-white">Services: </span>
                        {res.services}
                      </div>
                    )}

                    {/* Availability */}
                    <div className="text-[11px] text-navy-400 flex items-center gap-1">
                      <span className="font-medium text-navy-300">Availability:</span>
                      <span className={res.availability?.includes('24/7') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                        {res.availability || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Call & Directions */}
                  <div className="pt-3 border-t border-navy-800 flex items-center justify-between gap-2">
                    {res.phone ? (
                      <a
                        href={`tel:${res.phone}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call {res.phone}
                      </a>
                    ) : (
                      <span className="text-[11px] text-navy-400 italic">No direct phone listed</span>
                    )}

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}${
                        userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''
                      }`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-indigo-300 hover:text-white font-bold text-xs border border-navy-700 transition flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                      Directions
                    </a>
                  </div>

                  {/* Source Attribution */}
                  {res.source && (
                    <div className="text-[10px] text-navy-400 text-right pt-1 border-t border-navy-950">
                      Source: {res.source}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>

      <MobileNav />
    </div>
  );
}
