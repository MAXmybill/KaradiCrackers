import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

const loginSchema = z.object({
  adminId: z.string().min(1, 'Admin ID is required'),
  password: z.string().min(1, 'Password is required'),
});

// Simple in-memory rate limiting map for login attempts: ip -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'default-ip';
    const now = Date.now();

    const record = rateLimitMap.get(ip);
    if (record) {
      if (now < record.expiresAt) {
        if (record.count >= 5) {
          return NextResponse.json(
            { success: false, error: 'Too many failed login attempts. Please try again after 5 minutes.' },
            { status: 429 }
          );
        }
      } else {
        rateLimitMap.delete(ip);
      }
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid credentials input' },
        { status: 400 }
      );
    }

    const { adminId, password } = parsed.data;
    const validAdminId = process.env.ADMIN_ID || 'karadicrackers';
    const validPassword = process.env.ADMIN_PASSWORD || 'password123456';

    if (adminId !== validAdminId || password !== validPassword) {
      const current = rateLimitMap.get(ip) || { count: 0, expiresAt: now + 5 * 60 * 1000 };
      current.count += 1;
      rateLimitMap.set(ip, current);

      return NextResponse.json(
        { success: false, error: 'Invalid Admin ID or Password. Please try again.' },
        { status: 401 }
      );
    }

    // Success - reset attempts
    rateLimitMap.delete(ip);

    const token = await createSessionToken(adminId);
    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server login error' },
      { status: 500 }
    );
  }
}
