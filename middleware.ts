import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'safeshe-fallback-secret-2026';
const COOKIE_NAME = 'safeshe_token';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/journey',
  '/evidence',
  '/incidents',
  '/trusted-contacts',
  '/privacy',
  '/admin',
  '/helpers',
  '/emergency',
  '/report',
];

const AUTH_ROUTES = ['/signin', '/login', '/signup', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let isAuthenticated = false;
  let userRole = 'USER';

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (payload && payload.id) {
        isAuthenticated = true;
        userRole = (payload.role as string) || 'USER';
      }
    } catch (err) {
      isAuthenticated = false;
    }
  }

  // 1. If user is trying to access a protected route without authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 2. Role-based check for /admin
  if (pathname.startsWith('/admin') && isAuthenticated && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 3. Role-based check for /helpers
  if (pathname.startsWith('/helpers') && isAuthenticated && userRole !== 'VERIFIED_HELPER' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 4. If user is already authenticated and visits signin/signup/login/register, redirect to dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/journey/:path*',
    '/evidence/:path*',
    '/incidents/:path*',
    '/trusted-contacts/:path*',
    '/privacy/:path*',
    '/admin/:path*',
    '/helpers/:path*',
    '/emergency/:path*',
    '/report/:path*',
    '/signin',
    '/login',
    '/signup',
    '/register',
  ],
};
