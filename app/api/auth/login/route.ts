import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, verifyPassword } from '@/lib/services/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || email.trim() === '' || password === '') {
      return NextResponse.json({ error: 'Please enter both email and password.' }, { status: 400 });
    }

    // Phase 4: Email normalization
    const cleanedEmail = email.trim().toLowerCase();

    // Phase 9: Development Auth Debug Logging (Server-side only)
    console.log(`[AUTH] Login attempt for: ${cleanedEmail}`);

    const user = await db.user.findUnique({
      where: { email: cleanedEmail },
    });

    console.log(`[AUTH] User found: ${!!user}`);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Phase 4 & 5: Verify hashed password using bcrypt.compare
    const isValid = await verifyPassword(password, user.password);
    console.log(`[AUTH] Password match: ${isValid}`);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Issue JWT cookie named safeshe_token
    const token = await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'VERIFIED_HELPER' | 'ADMIN',
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined,
    });

    console.log(`[AUTH] JWT created: ${!!token}`);
    console.log(`[AUTH] Cookie safeshe_token set: true`);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Authentication failed. Please try again.' }, { status: 500 });
  }
}
