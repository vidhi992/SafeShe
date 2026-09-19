import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeJourney = await db.journey.findFirst({
      where: { userId: user.id, status: { in: ['ACTIVE', 'ANOMALY_DETECTED'] } },
      include: {
        locations: { orderBy: { timestamp: 'desc' }, take: 10 },
      },
    });

    return NextResponse.json({ activeJourney });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch journey' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startLocationName, startLat, startLng, destinationName, destLat, destLng, expectedDurationMins, safetyScore } = await req.json();

    // Cancel any existing active journey
    await db.journey.updateMany({
      where: { userId: user.id, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    const expectedArrival = new Date(Date.now() + (expectedDurationMins || 20) * 60 * 1000);

    const journey = await db.journey.create({
      data: {
        userId: user.id,
        startLocationName: startLocationName || 'Current Location',
        startLat: startLat || 37.7833,
        startLng: startLng || -122.4167,
        destinationName: destinationName || '742 Evergreen Terrace',
        destLat: destLat || 37.7749,
        destLng: destLng || -122.4194,
        status: 'ACTIVE',
        expectedArrival,
        safetyScore: safetyScore || 'MODERATE',
        locations: {
          create: {
            lat: startLat || 37.7833,
            lng: startLng || -122.4167,
            speed: 12.0,
          },
        },
      },
    });

    return NextResponse.json({ success: true, journey });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start journey' }, { status: 500 });
  }
}
