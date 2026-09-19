import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = await db.emergencyResource.update({
      where: { id },
      data: {
        ...body,
        lat: body.lat ? parseFloat(body.lat) : undefined,
        lng: body.lng ? parseFloat(body.lng) : undefined,
        lastVerifiedAt: body.verified ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, resource: updated });
  } catch (error) {
    console.error('Update resource error:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await db.emergencyResource.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Delete resource error:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
