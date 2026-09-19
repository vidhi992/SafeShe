import { NextResponse } from 'next/server';
import { searchLocation } from '@/lib/maps/geocoding';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, locations: [] });
    }

    const results = await searchLocation(q.trim());

    const structuredLocations = results.map((item) => ({
      name: item.name,
      displayName: item.displayName,
      latitude: item.lat,
      longitude: item.lng,
      type: item.type || item.category || 'location',
      address: item.address
        ? {
            road: item.address.road,
            suburb: item.address.suburb,
            city: item.address.city || item.address.town || item.address.village,
            district: item.address.county || item.address.state_district,
            state: item.address.state,
            country: item.address.country || 'India',
            postcode: item.address.postcode,
          }
        : undefined,
      source: 'OpenStreetMap Nominatim (India)',
    }));

    return NextResponse.json({
      success: true,
      query: q,
      locations: structuredLocations,
      count: structuredLocations.length,
    });
  } catch (error) {
    console.error('Location search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
