import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';
import { NotificationService } from '@/lib/services/notification-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let contacts = await db.trustedContact.findMany({
      where: { userId: user.id },
      orderBy: { priority: 'asc' },
    });

    if (contacts.length === 0) {
      const emergency = await db.emergencyContact.findMany({
        where: { userId: user.id },
        orderBy: { priority: 'asc' },
      });
      contacts = emergency.map((e) => ({
        id: e.id,
        userId: e.userId,
        name: e.name,
        phone: e.phoneNumber,
        email: `${e.name.toLowerCase().replace(/\s+/g, '')}@safeshe.user`,
        relationship: e.relationship,
        priority: e.priority,
        isVerified: e.isVerified,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })) as any;
    }

    return NextResponse.json({ contacts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trusted contacts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, email, relationship, priority } = await req.json();

    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'Name, phone, and email are required' }, { status: 400 });
    }

    const contact = await db.trustedContact.create({
      data: {
        userId: user.id,
        name,
        phone,
        email,
        relationship: relationship || 'Family',
        priority: priority || 1,
        isVerified: true,
      },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add trusted contact' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, testNotification } = await req.json();

    if (testNotification) {
      const contact = await db.trustedContact.findUnique({ where: { id } });
      if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

      const res = await NotificationService.send({
        userId: user.id,
        title: 'SafeShe Test Alert',
        message: `Hello ${contact.name}, this is a test notification from ${user.name}'s SafeShe account.`,
        type: 'INFO',
        recipientPhone: contact.phone,
        recipientEmail: contact.email,
      });

      return NextResponse.json({ success: true, notificationResult: res });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });

    await db.trustedContact.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
