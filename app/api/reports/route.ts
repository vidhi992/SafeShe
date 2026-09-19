import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';

export async function GET() {
  try {
    const reports = await db.safetyReport.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch safety reports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { category, description, locationName, lat, lng, isAnonymous, imageUrl } = await req.json();

    if (!category || !description || !locationName) {
      return NextResponse.json({ error: 'Category, description, and location are required' }, { status: 400 });
    }

    const report = await db.safetyReport.create({
      data: {
        reporterId: isAnonymous ? null : user?.id || null,
        category,
        description,
        locationName,
        lat: lat || 37.7749,
        lng: lng || -122.4194,
        isAnonymous: Boolean(isAnonymous),
        imageUrl: imageUrl || null,
        status: 'APPROVED', // Auto-approved for demo; admin can moderate in admin panel
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
