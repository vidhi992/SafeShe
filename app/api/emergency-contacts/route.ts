import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

/**
 * Normalizes a phone number to E.164 international format (+91XXXXXXXXXX)
 */
function formatE164(phoneStr: string): string {
  const digitsOnly = phoneStr.replace(/\D/g, '');

  if (phoneStr.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  // Default to India +91 format if 10 digits
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }

  return `+${digitsOnly}`;
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Derived strictly from JWT session
    const contacts = await db.emergencyContact.findMany({
      where: { userId: currentUser.id },
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json({ success: true, contacts });
  } catch (error) {
    console.error('Fetch emergency contacts error:', error);
    return NextResponse.json({ error: 'Failed to fetch emergency contacts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, relationship, phoneNumber, priority } = await req.json();

    if (!name || !phoneNumber || !relationship) {
      return NextResponse.json(
        { error: 'Name, relationship, and phone number are required.' },
        { status: 400 }
      );
    }

    const normalizedPhone = formatE164(phoneNumber.trim());

    if (normalizedPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number in E.164 international format (e.g. +91 98765 43210).' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const newContact = await db.emergencyContact.create({
      data: {
        userId: currentUser.id,
        name: name.trim(),
        relationship: relationship.trim(),
        phoneNumber: normalizedPhone,
        isVerified: false,
        isEnabled: true,
        priority: priority ? parseInt(priority) : 1,
        otpCode,
        otpExpiresAt,
      },
    });

    // Synchronize with TrustedContact model
    await db.trustedContact.create({
      data: {
        userId: currentUser.id,
        name: name.trim(),
        phone: normalizedPhone,
        email: `${name.trim().toLowerCase().replace(/\s+/g, '')}@safeshe.user`,
        relationship: relationship.trim(),
        priority: priority ? parseInt(priority) : 1,
        isVerified: false,
      },
    }).catch((e) => console.warn('Sync to trustedContact skipped:', e));

    return NextResponse.json(
      {
        success: true,
        contact: newContact,
        demoOtpNote: `[DEMO MODE] Verification OTP code generated: ${otpCode}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add emergency contact error:', error);
    return NextResponse.json({ error: 'Failed to add emergency contact' }, { status: 500 });
  }
}
