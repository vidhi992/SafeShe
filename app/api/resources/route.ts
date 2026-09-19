import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistanceKm } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;

    // 1. Always fetch Verified National Helplines (112, 181, 1098, 139, 1091)
    const nationalHelplines = await db.emergencyResource.findMany({
      where: {
        category: 'NATIONAL_EMERGENCY',
      },
      orderBy: { name: 'asc' },
    });

    // 2. Build filter conditions for location-based resources
    const whereCondition: any = {
      category: {
        not: 'NATIONAL_EMERGENCY',
      },
    };

    if (state && state !== 'All') {
      whereCondition.state = state;
    }

    if (district && district !== 'All') {
      whereCondition.OR = [
        { district: { contains: district } },
        { city: { contains: district } },
      ];
    }

    if (category && category !== 'ALL') {
      whereCondition.category = category;
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      whereCondition.OR = [
        { name: { contains: q } },
        { city: { contains: q } },
        { district: { contains: q } },
        { address: { contains: q } },
        { state: { contains: q } },
        { services: { contains: q } },
      ];
    }

    const rawResources = await db.emergencyResource.findMany({
      where: whereCondition,
    });

    // 3. Compute Haversine distance if user coordinates provided
    let processed = rawResources.map((res) => {
      let distanceKm: number | null = null;
      if (userLat !== null && userLng !== null && res.lat && res.lng) {
        distanceKm = calculateDistanceKm(userLat, userLng, res.lat, res.lng);
      }
      return {
        ...res,
        distanceKm,
      };
    });

    // 4. Sort by distance if user location is available, otherwise by state and name
    if (userLat !== null && userLng !== null) {
      processed.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });
    } else {
      processed.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({
      success: true,
      nationalHelplines,
      resources: processed,
      totalCount: processed.length,
      filteredBy: {
        state: state || 'Pan-India',
        district: district || 'All',
        category: category || 'ALL',
        userLocationProvided: userLat !== null && userLng !== null,
      },
    });
  } catch (error) {
    console.error('Failed to fetch emergency resources:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Pan-India emergency resources' },
      { status: 500 }
    );
  }
}
