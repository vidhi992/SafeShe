import { NextResponse } from 'next/server';
import { db, ensureDbInitialized } from '@/lib/db';
import { createSession } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();
    const { role } = await req.json();

    let user = await db.user.findFirst({
      where: { role },
    });

    if (!user) {
      // Fallback to first user in database
      user = await db.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: 'No user found. Please run seed script.' }, { status: 404 });
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'VERIFIED_HELPER' | 'ADMIN',
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to switch role' }, { status: 500 });
  }
}
