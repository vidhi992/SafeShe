import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // Verify session ownership
    const existing = await db.emergencyContact.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Contact not found or access denied.' }, { status: 403 });
    }

    const updated = await db.emergencyContact.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        relationship: body.relationship !== undefined ? body.relationship.trim() : undefined,
        phoneNumber: body.phoneNumber !== undefined ? body.phoneNumber.trim() : undefined,
        isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : undefined,
        priority: body.priority !== undefined ? parseInt(body.priority) : undefined,
        updatedAt: new Date(),
      },
    });

    // Synchronize to trustedContact model
    if (existing.phoneNumber) {
      await db.trustedContact.updateMany({
        where: { userId: currentUser.id, phone: existing.phoneNumber },
        data: {
          name: updated.name,
          relationship: updated.relationship,
          phone: updated.phoneNumber,
          priority: updated.priority,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify session ownership
    const existing = await db.emergencyContact.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Contact not found or access denied.' }, { status: 403 });
    }

    await db.emergencyContact.delete({
      where: { id },
    });

    // Synchronize deletion to trustedContact model
    if (existing.phoneNumber) {
      await db.trustedContact.deleteMany({
        where: { userId: currentUser.id, phone: existing.phoneNumber },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
