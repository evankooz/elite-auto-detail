/**
 * Environment variable validation and utilities
 * Ensures all required secrets are present and valid at startup
 */

/**
 * Validates that all required environment variables are set and have acceptable values.
 * Call this in your middleware or app initialization.
 * Throws an error with detailed message if validation fails.
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Required public variables
  const publicVars = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  // Required private variables (server-side only)
  const privateVars = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    OWNER_EMAIL: process.env.OWNER_EMAIL,
  };

  // Notification services (optional but recommended)
  const notificationVars = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    OWNER_PHONE: process.env.OWNER_PHONE,
    OWNER_EMAIL: process.env.OWNER_EMAIL,
  };

  // Check public variables
  Object.entries(publicVars).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Missing required public environment variable: ${key}`);
    }
  });

  // Check private variables (only on server)
  if (typeof window === 'undefined') {
    Object.entries(privateVars).forEach(([key, value]) => {
      if (!value) {
        errors.push(`Missing required private environment variable: ${key}`);
      }
    });

    // Validate secret lengths (should be at least 32 chars for security)
    const { ADMIN_SECRET, CRON_SECRET } = privateVars;
    if (ADMIN_SECRET && ADMIN_SECRET.length < 32) {
      errors.push(
        `ADMIN_SECRET is too short (${ADMIN_SECRET.length} chars). ` +
        `Use at least 32 characters. Generate with: openssl rand -base64 32`
      );
    }
    if (CRON_SECRET && CRON_SECRET.length < 32) {
      errors.push(
        `CRON_SECRET is too short (${CRON_SECRET.length} chars). ` +
        `Use at least 32 characters. Generate with: openssl rand -base64 32`
      );
    }

    // Check email format
    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    if (OWNER_EMAIL && !isValidEmail(OWNER_EMAIL)) {
      errors.push(`OWNER_EMAIL is not a valid email address: ${OWNER_EMAIL}`);
    }

    // Warn about missing notification services
    const notificationMissing = Object.entries(notificationVars)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (notificationMissing.length > 0) {
      console.warn(
        '[Env] Optional notification services not configured: ' +
        notificationMissing.join(', ') +
        '. Bookings will still work, but SMS/email notifications will be skipped.'
      );
    }
  }

  // Throw error with all validation issues
  if (errors.length > 0) {
    throw new Error(
      'Environment validation failed:\n' +
      errors.map(e => `  • ${e}`).join('\n')
    );
  }
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Gets a required environment variable and throws if missing
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable not set: ${key}`);
  }
  return value;
}

/**
 * Gets an optional environment variable
 */
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}
