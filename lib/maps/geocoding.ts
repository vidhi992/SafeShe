export interface GeocodingResult {
  placeId: string;
  displayName: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  type?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

// Simple in-memory cache to prevent redundant requests
const searchCache = new Map<string, GeocodingResult[]>();

/**
 * Searches real geographic locations across India using OpenStreetMap Nominatim API with countrycodes=in.
 */
export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = query.trim().toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    // Enforce countrycodes=in to prioritize India locations
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&addressdetails=1&limit=10&countrycodes=in`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SafeShe-WomenSafetyPlatform/1.0 (contact@safeshe.org)',
        'Accept-Language': 'en-IN,en-US,en;q=0.9',
      },
    });

    if (!res.ok) throw new Error('Geocoding request failed');

    const data = await res.json();

    const mapped: GeocodingResult[] = data.map((item: any) => ({
      placeId: item.place_id ? String(item.place_id) : Math.random().toString(),
      displayName: item.display_name,
      name: item.name || item.display_name.split(',')[0],
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      category: item.category,
      type: item.type,
      address: item.address,
    }));

    if (mapped.length > 0) {
      searchCache.set(cacheKey, mapped);
      return mapped;
    }
  } catch (error) {
    console.error('Nominatim search error:', error);
  }

  // If online request returns 0 results or fails, query nationwide fallback dataset
  const fallbacks = getFallbackSearchResults(query);
  if (fallbacks.length > 0) {
    searchCache.set(cacheKey, fallbacks);
  }
  return fallbacks;
}

/**
 * Performs reverse geocoding to convert lat/lng to real address string.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SafeShe-WomenSafetyPlatform/1.0 (contact@safeshe.org)',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });

    if (!res.ok) throw new Error('Reverse geocoding failed');
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
  } catch (error) {
    return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
  }
}

/**
 * Nationwide fallback dataset covering cities, towns, districts, and localities across India
 */
function getFallbackSearchResults(query: string): GeocodingResult[] {
  const q = query.toLowerCase().trim();
  const knownPlaces: GeocodingResult[] = [
    // --- MADHYA PRADESH ---
    {
      placeId: 'vidisha-center',
      displayName: 'Vidisha, Madhya Pradesh, India',
      name: 'Vidisha',
      lat: 23.5236,
      lng: 77.8122,
      type: 'city',
      address: { city: 'Vidisha', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'haripura-vidisha',
      displayName: 'Haripura, Vidisha, Madhya Pradesh, India',
      name: 'Haripura, Vidisha',
      lat: 23.5310,
      lng: 77.8210,
      type: 'locality',
      address: { suburb: 'Haripura', city: 'Vidisha', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'basoda-vidisha',
      displayName: 'Ganj Basoda, Vidisha District, Madhya Pradesh, India',
      name: 'Ganj Basoda',
      lat: 23.8510,
      lng: 77.9350,
      type: 'town',
      address: { town: 'Ganj Basoda', county: 'Vidisha', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'sironj-vidisha',
      displayName: 'Sironj, Vidisha District, Madhya Pradesh, India',
      name: 'Sironj',
      lat: 24.1040,
      lng: 77.6980,
      type: 'town',
      address: { town: 'Sironj', county: 'Vidisha', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'bhopal-center',
      displayName: 'Bhopal, Madhya Pradesh, India',
      name: 'Bhopal',
      lat: 23.2599,
      lng: 77.4126,
      type: 'city',
      address: { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'mp-nagar-bhopal',
      displayName: 'MP Nagar Zone-1, Bhopal, Madhya Pradesh 462011, India',
      name: 'MP Nagar, Bhopal',
      lat: 23.2355,
      lng: 77.4285,
      type: 'locality',
      address: { suburb: 'MP Nagar', city: 'Bhopal', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'arera-colony-bhopal',
      displayName: 'Arera Colony, Bhopal, Madhya Pradesh 462016, India',
      name: 'Arera Colony, Bhopal',
      lat: 23.2120,
      lng: 77.4330,
      type: 'locality',
      address: { suburb: 'Arera Colony', city: 'Bhopal', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'manit-bhopal',
      displayName: 'MANIT Bhopal, Link Road No 3, Bhopal, MP, India',
      name: 'MANIT Bhopal',
      lat: 23.2163,
      lng: 77.4068,
      type: 'amenity',
      address: { suburb: 'MANIT Campus', city: 'Bhopal', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'indore-center',
      displayName: 'Indore, Madhya Pradesh, India',
      name: 'Indore',
      lat: 22.7196,
      lng: 75.8577,
      type: 'city',
      address: { city: 'Indore', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'vijay-nagar-indore',
      displayName: 'Vijay Nagar, Indore, Madhya Pradesh 452010, India',
      name: 'Vijay Nagar, Indore',
      lat: 22.7533,
      lng: 75.8937,
      type: 'locality',
      address: { suburb: 'Vijay Nagar', city: 'Indore', state: 'Madhya Pradesh', country: 'India' },
    },
    {
      placeId: 'ujjain-center',
      displayName: 'Ujjain, Madhya Pradesh, India',
      name: 'Ujjain',
      lat: 23.1765,
      lng: 75.7885,
      type: 'city',
      address: { city: 'Ujjain', state: 'Madhya Pradesh', country: 'India' },
    },

    // --- DELHI & NCR ---
    {
      placeId: 'delhi-center',
      displayName: 'New Delhi, Delhi, India',
      name: 'Delhi',
      lat: 28.6139,
      lng: 77.2090,
      type: 'city',
      address: { city: 'New Delhi', state: 'Delhi', country: 'India' },
    },
    {
      placeId: 'connaught-place-delhi',
      displayName: 'Connaught Place, New Delhi, Delhi 110001, India',
      name: 'Connaught Place, New Delhi',
      lat: 28.6315,
      lng: 77.2167,
      type: 'locality',
      address: { suburb: 'Connaught Place', city: 'New Delhi', state: 'Delhi', country: 'India' },
    },

    // --- MAHARASHTRA ---
    {
      placeId: 'mumbai-center',
      displayName: 'Mumbai, Maharashtra, India',
      name: 'Mumbai',
      lat: 19.0760,
      lng: 72.8777,
      type: 'city',
      address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    },
    {
      placeId: 'andheri-mumbai',
      displayName: 'Andheri East, Mumbai, Maharashtra 400069, India',
      name: 'Andheri, Mumbai',
      lat: 19.1136,
      lng: 72.8697,
      type: 'locality',
      address: { suburb: 'Andheri', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    },
    {
      placeId: 'pune-center',
      displayName: 'Pune, Maharashtra, India',
      name: 'Pune',
      lat: 18.5204,
      lng: 73.8567,
      type: 'city',
      address: { city: 'Pune', state: 'Maharashtra', country: 'India' },
    },

    // --- KARNATAKA ---
    {
      placeId: 'bengaluru-center',
      displayName: 'Bengaluru, Karnataka, India',
      name: 'Bengaluru',
      lat: 12.9716,
      lng: 77.5946,
      type: 'city',
      address: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    },
    {
      placeId: 'koramangala-bengaluru',
      displayName: 'Koramangala, Bengaluru, Karnataka 560034, India',
      name: 'Koramangala, Bengaluru',
      lat: 12.9352,
      lng: 77.6245,
      type: 'locality',
      address: { suburb: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    },

    // --- RAJASTHAN ---
    {
      placeId: 'jaipur-center',
      displayName: 'Jaipur, Rajasthan, India',
      name: 'Jaipur',
      lat: 26.9124,
      lng: 75.7873,
      type: 'city',
      address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
    },
    {
      placeId: 'kota-center',
      displayName: 'Kota, Rajasthan, India',
      name: 'Kota',
      lat: 25.2138,
      lng: 75.8648,
      type: 'city',
      address: { city: 'Kota', state: 'Rajasthan', country: 'India' },
    },

    // --- UTTAR PRADESH ---
    {
      placeId: 'lucknow-center',
      displayName: 'Lucknow, Uttar Pradesh, India',
      name: 'Lucknow',
      lat: 26.8467,
      lng: 80.9462,
      type: 'city',
      address: { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
    },

    // --- WEST BENGAL ---
    {
      placeId: 'kolkata-center',
      displayName: 'Kolkata, West Bengal, India',
      name: 'Kolkata',
      lat: 22.5726,
      lng: 88.3639,
      type: 'city',
      address: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
    },

    // --- TELANGANA & TAMIL NADU ---
    {
      placeId: 'hyderabad-center',
      displayName: 'Hyderabad, Telangana, India',
      name: 'Hyderabad',
      lat: 17.3850,
      lng: 78.4867,
      type: 'city',
      address: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
    },
    {
      placeId: 'chennai-center',
      displayName: 'Chennai, Tamil Nadu, India',
      name: 'Chennai',
      lat: 13.0827,
      lng: 80.2707,
      type: 'city',
      address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    },

    // --- ASSAM & JAMMU & KASHMIR ---
    {
      placeId: 'guwahati-center',
      displayName: 'Guwahati, Assam, India',
      name: 'Guwahati',
      lat: 26.1445,
      lng: 91.7362,
      type: 'city',
      address: { city: 'Guwahati', state: 'Assam', country: 'India' },
    },
    {
      placeId: 'srinagar-center',
      displayName: 'Srinagar, Jammu and Kashmir, India',
      name: 'Srinagar',
      lat: 34.0837,
      lng: 74.7973,
      type: 'city',
      address: { city: 'Srinagar', state: 'Jammu and Kashmir', country: 'India' },
    },
  ];

  return knownPlaces.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      (p.address?.city && p.address.city.toLowerCase().includes(q)) ||
      (p.address?.state && p.address.state.toLowerCase().includes(q))
  );
}
