import { NextResponse } from 'next/server';
import { db, ensureDbInitialized } from '@/lib/db';
import { createSession, verifyPassword } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();

    const { email, password } = await req.json();

    if (!email || !password || email.trim() === '' || password === '') {
      return NextResponse.json({ error: 'Please enter both email and password.' }, { status: 400 });
    }

    const cleanedEmail = email.trim().toLowerCase();
    console.log(`[AUTH] Login attempt for: ${cleanedEmail}`);

    const user = await db.user.findUnique({
      where: { email: cleanedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'VERIFIED_HELPER' | 'ADMIN',
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed. Please check credentials or try again.' },
      { status: 500 }
    );
  }
}
