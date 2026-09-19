'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category?: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  reportCount?: number;
  lastReported?: string;
  type: 'UNSAFE_REPORT' | 'EMERGENCY_RESOURCE' | 'USER_LOCATION' | 'HELPER' | 'SEARCH_PIN' | 'ORIGIN' | 'DESTINATION';
}

export interface MapPolyline {
  id: string;
  color: string;
  waypoints: Array<[number, number]>;
  selected?: boolean;
}

interface LeafletMapInnerProps {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  polylines: MapPolyline[];
  showHeatmap?: boolean;
  showEmergencyResources?: boolean;
  showSafetyReports?: boolean;
  onSelectMarker?: (marker: MapMarker) => void;
}

export default function LeafletMapInner({
  center,
  zoom,
  markers,
  polylines,
  showHeatmap = true,
  showEmergencyResources = true,
  showSafetyReports = true,
  onSelectMarker,
}: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
      });

      // Standard OpenStreetMap Raster Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    const map = mapInstanceRef.current;

    // Clear previous dynamic layers (markers, lines, circles)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    // 1. Draw Real Road Polylines
    polylines.forEach((poly) => {
      if (poly.waypoints && poly.waypoints.length > 0) {
        const isSelected = poly.selected !== false;
        const line = L.polyline(poly.waypoints, {
          color: poly.color || '#6366f1',
          weight: isSelected ? 6 : 4,
          opacity: isSelected ? 0.9 : 0.4,
          lineJoin: 'round',
        }).addTo(map);

        // Extend bounds to cover route geometry
        poly.waypoints.forEach((pt) => {
          if (pt && pt.length === 2 && !isNaN(pt[0]) && !isNaN(pt[1])) {
            bounds.extend(pt);
          }
        });
      }
    });

    // 2. Draw Safety Heatmap Circles from database reports
    if (showHeatmap) {
      markers
        .filter((m) => m.type === 'UNSAFE_REPORT')
        .forEach((report) => {
          L.circle([report.lat, report.lng], {
            color: '#f43f5e',
            fillColor: '#f43f5e',
            fillOpacity: 0.25,
            radius: 350,
          }).addTo(map);
        });
    }

    // Custom Marker Icon Factory
    const createCustomIcon = (type: MapMarker['type'], category?: string) => {
      let bgClass = 'bg-indigo-600 border-2 border-white shadow-indigo-600/50';
      let symbol = '📍';

      if (type === 'ORIGIN') {
        bgClass = 'bg-emerald-600 border-2 border-white animate-pulse shadow-emerald-500/80';
        symbol = '🟢';
      } else if (type === 'DESTINATION') {
        bgClass = 'bg-rose-600 border-2 border-white shadow-rose-600/80';
        symbol = '🔴';
      } else if (type === 'USER_LOCATION') {
        bgClass = 'bg-emerald-600 border-2 border-white animate-pulse shadow-emerald-500/80';
        symbol = '🟢';
      } else if (type === 'SEARCH_PIN') {
        bgClass = 'bg-rose-600 border-2 border-white shadow-rose-600/80';
        symbol = '🔴';
      } else if (type === 'UNSAFE_REPORT') {
        bgClass = 'bg-rose-600 border-2 border-white shadow-rose-600/60';
        symbol = '⚠️';
      } else if (type === 'EMERGENCY_RESOURCE') {
        if (category === 'Police') {
          bgClass = 'bg-blue-800 border-2 border-blue-300 shadow-blue-800/60';
          symbol = '🚓';
        } else {
          bgClass = 'bg-emerald-600 border-2 border-emerald-300 shadow-emerald-600/60';
          symbol = '🏥';
        }
      } else if (type === 'HELPER') {
        bgClass = 'bg-amber-500 border-2 border-white shadow-amber-500/60';
        symbol = '🛡️';
      }

      return L.divIcon({
        className: 'custom-leaflet-marker-wrapper',
        html: `<div class="w-9 h-9 rounded-full ${bgClass} flex items-center justify-center text-sm shadow-xl transform -translate-x-1/2 -translate-y-1/2">${symbol}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
    };

    // 3. Draw Markers & Popups
    markers.forEach((m) => {
      if (!showEmergencyResources && m.type === 'EMERGENCY_RESOURCE') return;
      if (!showSafetyReports && m.type === 'UNSAFE_REPORT') return;

      if (!isNaN(m.lat) && !isNaN(m.lng)) {
        bounds.extend([m.lat, m.lng]);
      }

      const icon = createCustomIcon(m.type, m.category);
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

      // Rich HTML Popup
      let popupHtml = `<div class="p-3 text-navy-950 font-sans max-w-xs">`;

      if (m.type === 'ORIGIN') {
        popupHtml += `
          <div class="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
            <span>🟢 Origin: ${m.title}</span>
          </div>
          ${m.address ? `<p class="text-xs text-gray-600 mt-1">📍 ${m.address}</p>` : ''}
        `;
      } else if (m.type === 'DESTINATION') {
        popupHtml += `
          <div class="font-bold text-sm text-rose-900 flex items-center gap-1.5">
            <span>🔴 Destination: ${m.title}</span>
          </div>
          ${m.address ? `<p class="text-xs text-gray-600 mt-1">📍 ${m.address}</p>` : ''}
        `;
      } else if (m.category === 'Police') {
        popupHtml += `
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-sm text-blue-900">🚓 ${m.title}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">Police</span>
          </div>
          ${m.address ? `<p class="text-xs text-gray-600 mb-1">📍 ${m.address}</p>` : ''}
          ${m.phone ? `<p class="text-xs text-gray-700 font-semibold">📞 ${m.phone}</p>` : ''}
          <div class="mt-2 pt-2 border-t flex items-center justify-between">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" class="text-xs font-bold text-indigo-600 hover:underline">Get Directions ➔</a>
          </div>
        `;
      } else if (m.category === 'Hospital') {
        popupHtml += `
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-sm text-emerald-900">🏥 ${m.title}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">Hospital</span>
          </div>
          ${m.address ? `<p class="text-xs text-gray-600 mb-1">📍 ${m.address}</p>` : ''}
          ${m.phone ? `<p class="text-xs text-gray-700 font-semibold">📞 Emergency: ${m.phone}</p>` : ''}
          <div class="mt-2 pt-2 border-t flex items-center justify-between">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" class="text-xs font-bold text-emerald-700 hover:underline">Get Emergency Directions ➔</a>
          </div>
        `;
      } else {
        popupHtml += `
          <div class="font-bold text-sm text-gray-900">${m.title}</div>
          ${m.description ? `<p class="text-xs text-gray-600 mt-1">${m.description}</p>` : ''}
        `;
      }

      popupHtml += `</div>`;
      marker.bindPopup(popupHtml);

      if (onSelectMarker) {
        marker.on('click', () => onSelectMarker(m));
      }
    });

    // Automatically fit bounds if we have valid route polylines or multiple markers!
    if (bounds.isValid() && (polylines.length > 0 || markers.length > 1)) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [center, zoom, markers, polylines, showHeatmap, showEmergencyResources, showSafetyReports]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-0" />;
}
