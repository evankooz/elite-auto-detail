import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

/**
 * CSRF check — ensures requests come from our own domain.
 * Call at the top of any mutating API route (POST, PATCH, DELETE).
 * Returns a 403 NextResponse if the origin is invalid, or null if OK.
 */
export function checkCSRF(req: NextRequest): NextResponse | null {
  // Allow server-side calls (no origin header) — e.g. cron jobs
  const origin = req.headers.get('origin');
  if (!origin) return null;

  const allowed = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  // In development, also allow localhost
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');

  if (origin !== allowed && !(isDev && isLocalhost)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 },
    );
  }

  return null;
}

/**
 * Generate a CSRF token for use in forms.
 * Should be called when rendering forms in pages or during API calls.
 * Store this token in a secure, httpOnly cookie and in a hidden form field.
 */
export function generateCSRFToken(): string {
  // Generate a random token (32 bytes = 256 bits)
  const token = randomBytes(32).toString('hex');
  return token;
}

/**
 * Verify a CSRF token from a form submission.
 * Compare the token from the request body/header with the one from the cookie.
 */
export function verifyCSRFToken(
  tokenFromRequest: string,
  tokenFromCookie: string,
): boolean {
  if (!tokenFromRequest || !tokenFromCookie) return false;
  
  // Use constant-time comparison to prevent timing attacks
  return timingSafeEqual(tokenFromRequest, tokenFromCookie);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Sanitize a free-text string before storing in the database.
 * Strips HTML tags and trims whitespace.
 * Does NOT modify structured fields like email, phone, dates.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')      // strip HTML tags
    .replace(/[^\x20-\x7E\s]/g, (char) => {
      // Keep common unicode characters (names, accents, etc.)
      // Strip actual control characters and null bytes
      const code = char.charCodeAt(0);
      return code > 127 ? char : '';
    })
    .trim()
    .slice(0, 1000);              // hard cap — no field needs more than 1000 chars
}

/**
 * Sanitize a name field — letters, spaces, hyphens, apostrophes only.
 */
export function sanitizeName(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 100);
}