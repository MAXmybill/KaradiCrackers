import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.SESSION_SECRET || 'karadi_crackers_diwali_default_session_secret_1234567890';
const encodedKey = new TextEncoder().encode(SECRET_KEY);
const SESSION_COOKIE_NAME = 'kc_admin_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    let isValid = false;

    if (token) {
      try {
        await jwtVerify(token, encodedKey, { algorithms: ['HS256'] });
        isValid = true;
      } catch (e) {
        isValid = false;
      }
    }

    if (!isValid) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin API routes (except /api/admin/login and /api/admin/logout)
  if (
    pathname.startsWith('/api/admin') &&
    pathname !== '/api/admin/login' &&
    pathname !== '/api/admin/logout'
  ) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    let isValid = false;

    if (token) {
      try {
        await jwtVerify(token, encodedKey, { algorithms: ['HS256'] });
        isValid = true;
      } catch (e) {
        isValid = false;
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
