import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.SESSION_SECRET || 'karadi_crackers_diwali_default_session_secret_1234567890';
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export const SESSION_COOKIE_NAME = 'kc_admin_session';

export interface SessionPayload {
  adminId: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export async function createSessionToken(adminId: string): Promise<string> {
  return await new SignJWT({ adminId, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}
