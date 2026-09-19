export interface RealLocationPoint {
  id: string;
  name: string;
  category: 'Police' | 'Hospital' | 'Women Support' | 'Legal' | 'Landmark';
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  is24x7: boolean;
  source: string;
}

export const DEFAULT_MAP_CENTER: [number, number] = [23.2599, 77.4126]; // Bhopal, MP, India
export const DEFAULT_MAP_ZOOM = 13;

export const BHOPAL_EMERGENCY_RESOURCES: RealLocationPoint[] = [
  {
    id: 'bhopal-police-cr',
    name: 'Bhopal Police Control Room & Women Cell',
    category: 'Police',
    address: 'Jahangirabad, Opposite Old Bus Stand, Bhopal, MP 462008',
    city: 'Bhopal',
    lat: 23.2570,
    lng: 77.4012,
    phone: '0755-2443800',
    is24x7: true,
    source: 'MP Police Official Public Records (OpenStreetMap)',
  },
  {
    id: 'tt-nagar-ps',
    name: 'TT Nagar Police Station',
    category: 'Police',
    address: 'Apex Bank Square, TT Nagar, New Market, Bhopal, MP 462003',
    city: 'Bhopal',
    lat: 23.2325,
    lng: 77.4015,
    phone: '0755-2677100',
    is24x7: true,
    source: 'MP Police Official Public Records (OpenStreetMap)',
  },
  {
    id: 'mp-nagar-ps',
    name: 'MP Nagar Police Station',
    category: 'Police',
    address: 'Zone-I, Maharana Pratap Nagar, Bhopal, MP 462011',
    city: 'Bhopal',
    lat: 23.2333,
    lng: 77.4333,
    phone: '0755-2677200',
    is24x7: true,
    source: 'MP Police Official Public Records (OpenStreetMap)',
  },
  {
    id: 'aiims-bhopal-hosp',
    name: 'AIIMS Bhopal (All India Institute of Medical Sciences)',
    category: 'Hospital',
    address: 'Saket Nagar, Bhopal, MP 462020',
    city: 'Bhopal',
    lat: 23.2081,
    lng: 77.4610,
    phone: '0755-2900010',
    is24x7: true,
    source: 'Ministry of Health & Family Welfare Public Directory (OpenStreetMap)',
  },
  {
    id: 'hamidia-hosp',
    name: 'Hamidia Hospital & Trauma Center',
    category: 'Hospital',
    address: 'Royal Market, Near Taj-ul-Masajid, Bhopal, MP 462001',
    city: 'Bhopal',
    lat: 23.2575,
    lng: 77.3940,
    phone: '0755-2540500',
    is24x7: true,
    source: 'Government of MP Health Department (OpenStreetMap)',
  },
  {
    id: 'jp-hosp',
    name: 'JP Hospital (District Civil Hospital)',
    category: 'Hospital',
    address: '125/2, Tulsi Nagar, 12 No. Bus Stop, Bhopal, MP 462003',
    city: 'Bhopal',
    lat: 23.2310,
    lng: 77.4050,
    phone: '0755-2553018',
    is24x7: true,
    source: 'District Administration Bhopal (OpenStreetMap)',
  },
];

/**
 * Calculates straight line distance in KM between two geographic coordinates.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
