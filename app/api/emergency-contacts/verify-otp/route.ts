import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId, otpCode } = await req.json();

    if (!contactId || !otpCode) {
      return NextResponse.json({ error: 'Contact ID and OTP code are required.' }, { status: 400 });
    }

    // Verify contact belongs to authenticated user
    const contact = await db.emergencyContact.findUnique({
      where: { id: contactId },
    });

    if (!contact || contact.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Contact not found or access denied.' }, { status: 404 });
    }

    // Verify OTP code
    if (contact.otpCode !== otpCode.trim()) {
      return NextResponse.json({ error: 'Invalid verification OTP code. Please try again.' }, { status: 400 });
    }

    // Mark as verified
    const updated = await db.emergencyContact.update({
      where: { id: contactId },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully.',
      contact: updated,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'OTP verification failed' }, { status: 500 });
  }
}
