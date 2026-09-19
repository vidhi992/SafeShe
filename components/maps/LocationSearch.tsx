'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { searchLocation, GeocodingResult } from '@/lib/maps/geocoding';

export interface LocationSearchResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  address?: GeocodingResult['address'];
}

interface LocationSearchProps {
  onSelectLocation: (location: LocationSearchResult) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  showGPSButton?: boolean;
}

export function LocationSearch({
  onSelectLocation,
  placeholder = 'Search any city, town, locality or address in India (e.g. Vidisha, Kota, Guwahati)...',
  className = '',
  initialValue = '',
  showGPSButton = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced search with 350ms pause requirement
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchLocation(query);
        setResults(res);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(item: GeocodingResult) {
    const locResult: LocationSearchResult = {
      name: item.name,
      displayName: item.displayName,
      lat: item.lat,
      lng: item.lng,
      type: item.type || item.category,
      address: item.address,
    };
    onSelectLocation(locResult);
    setQuery(item.name);
    setIsOpen(false);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-navy-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-navy-900/95 border border-navy-700/90 text-white rounded-xl py-2.5 pl-10 pr-9 text-xs placeholder-navy-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xl transition"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 absolute right-3 text-indigo-400 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-navy-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-navy-900/95 border border-navy-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto backdrop-blur-md">
          {results.map((item) => (
            <button
              key={item.placeId}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-navy-800 flex items-start gap-2.5 transition border-b border-navy-800/60 last:border-0"
            >
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate max-w-[280px] sm:max-w-md flex items-center gap-2">
                  <span>{item.name}</span>
                  {item.type && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      {item.type}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-navy-300 line-clamp-1 mt-0.5">
                  {item.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
