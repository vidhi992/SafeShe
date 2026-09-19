import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'safeshe-fallback-secret-2026';
const COOKIE_NAME = 'safeshe_token';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'VERIFIED_HELPER' | 'ADMIN';
  phone?: string;
  avatarUrl?: string;
}

export async function createSession(user: UserSession): Promise<string> {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return token;
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (!plain || !hashed) return false;
  return await bcrypt.compare(plain, hashed);
}

export async function hashPassword(plain: string): Promise<string> {
  // Phase 3: Secure 12 salt rounds
  return await bcrypt.hash(plain, 12);
}

export async function requireRole(allowedRoles: Array<'USER' | 'VERIFIED_HELPER' | 'ADMIN'>) {
  const user = await getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error('Unauthorized access');
  }
  return user;
}
