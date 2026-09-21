import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, hashPassword } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword, phone, emergencyLanguage, notificationPref, role } = await req.json();

    // 1. Server-side validations
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const cleanedEmail = email.trim().toLowerCase();

    // 2. Check for duplicate email
    const existing = await db.user.findUnique({
      where: { email: cleanedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email address already exists. Please sign in instead.' }, { status: 400 });
    }

    // 3. Hash password securely (bcrypt with 10 salt rounds)
    const hashedPassword = await hashPassword(password);
    const assignedRole = role === 'VERIFIED_HELPER' ? 'VERIFIED_HELPER' : 'USER';

    // 4. Create User in DB safely
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: cleanedEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        emergencyLanguage: emergencyLanguage || 'en',
        notificationPref: notificationPref || 'ALL',
        role: assignedRole,
      },
    });

    // 5. Create auxiliary records safely
    try {
      await db.profile.create({
        data: {
          userId: user.id,
          voicePhrases: 'help,emergency,bachao,madad',
        },
      });
    } catch (e) {
      console.warn('Profile creation warning:', e);
    }

    try {
      await db.privacySetting.create({
        data: {
          userId: user.id,
          shareLocationWithHelper: true,
          allowVoiceTrigger: true,
          allowAnonymousReporting: true,
          retentionDays: 365,
        },
      });
    } catch (e) {
      console.warn('PrivacySetting creation warning:', e);
    }

    try {
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to SafeShe',
          message: 'Your account has been created. SafeShe prevention engine is active.',
          type: 'INFO',
        },
      });
    } catch (e) {
      console.warn('Notification creation warning:', e);
    }

    // 6. Create HTTP-only session cookie
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'VERIFIED_HELPER' | 'ADMIN',
      phone: user.phone || undefined,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during account creation. Please try again.' },
      { status: 500 }
    );
  }
}
