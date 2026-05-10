import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

/**
 * Validates the admin_session cookie set by /api/admin/auth.
 * Returns true if the session is valid and not expired.
 * Falls back to Bearer token for backward compatibility (should be migrated to cookies).
 * Use this in every admin API route instead of checking the raw ADMIN_SECRET.
 */
export function validateAdminSession(req: NextRequest): boolean {
  // Try session cookie first (preferred method)
  const cookie = req.cookies.get('admin_session')?.value;
  if (cookie) {
    const [token, expiryStr] = cookie.split(':');
    if (!token || !expiryStr) return false;

    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    const expected = hashSecret(`${process.env.ADMIN_SECRET}:${expiry}`);
    if (token === expected) return true;
  }

  return false;
}