import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    // Allow reading admin resources if logged in or admin
    const resources = await db.emergencyResource.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ success: true, resources });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin resources' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      state,
      district,
      city,
      address,
      lat,
      lng,
      phone,
      website,
      description,
      services,
      availability,
      source,
      verified,
    } = body;

    if (!name || !category || !state) {
      return NextResponse.json({ error: 'Name, category, and state are required' }, { status: 400 });
    }

    const newResource = await db.emergencyResource.create({
      data: {
        name,
        category,
        state,
        district: district || city || state,
        city: city || district || state,
        address: address || 'Official Address',
        lat: parseFloat(lat) || 20.5937,
        lng: parseFloat(lng) || 78.9629,
        phone: phone || null,
        website: website || null,
        description: description || null,
        services: services || null,
        availability: availability || 'Standard Operating Hours',
        source: source || 'Official Government Directory',
        verified: verified !== undefined ? Boolean(verified) : true,
        lastVerifiedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, resource: newResource }, { status: 201 });
  } catch (error) {
    console.error('Create resource error:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
