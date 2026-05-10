import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter using IP + endpoint key.
 * Tracks requests per IP address to prevent abuse.
 * 
 * ⚠️  IMPORTANT: This in-memory store does NOT persist across Vercel serverless instances.
 * For production on Vercel, replace with @vercel/kv (Redis) or similar.
 * Multiple container instances will each have separate state, allowing users to bypass limits
 * by making requests that hit different containers.
 * 
 * For production at scale, replace with Redis-based limiter or Vercel KV.
 * This implementation is suitable for single-server deployments or development only.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store: key = `${ip}:${endpoint}`
const limiterStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of limiterStore.entries()) {
      if (entry.resetAt < now) {
        limiterStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  keyPrefix?: string;  // Optional prefix for storage key
}

/**
 * Default rate limit configs for different endpoints
 */
export const RATE_LIMITS = {
  // Public booking endpoint - strict limit
  booking: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 10,  // 10 bookings per hour per IP
    keyPrefix: 'booking',
  },
  // Public availability endpoint - moderate limit
  availability: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 30,  // 30 requests per minute per IP
    keyPrefix: 'availability',
  },
  // Admin endpoints - strict limit
  admin: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 100,  // 100 requests per minute (high because they're authenticated)
    keyPrefix: 'admin',
  },
};

/**
 * Get the client IP from the request
 */
function getClientIP(req: NextRequest): string {
  // Check common headers for IP (behind reverse proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const ip = req.headers.get('x-real-ip');
  if (ip) return ip;
  
  // Fallback - should rarely happen
  return 'unknown';
}

/**
 * Check if a request should be rate limited.
 * Returns null if allowed, or a NextResponse with 429 if rate limited.
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
): NextResponse | null {
  const ip = getClientIP(req);
  const key = `${config.keyPrefix || 'api'}:${ip}`;
  const now = Date.now();

  let entry = limiterStore.get(key);

  // Entry expired or doesn't exist
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    limiterStore.set(key, entry);
    return null;
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.maxRequests) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      },
    );
  }

  return null;
}
