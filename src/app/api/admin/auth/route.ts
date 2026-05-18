import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { secret } = await req.json();

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    // Same error message for both "wrong password" and "missing"
    // so an attacker can't tell which it was
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }

  // Session lasts 8 hours
  const expiry = Date.now() + 8 * 60 * 60 * 1000;
  const token  = hashSecret(`${process.env.ADMIN_SECRET}:${expiry}`);
  const cookie = `${token}:${expiry}`;

  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_session', cookie, {
    httpOnly: true,   // not readable by JS
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   8 * 60 * 60, // seconds
  });

  return res;
}

export async function DELETE(_req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('admin_session');
  return res;
}