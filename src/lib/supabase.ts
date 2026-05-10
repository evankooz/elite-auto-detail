import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser client (uses anon key + RLS)
export const supabase = createClient(supabaseUrl, supabaseAnon);

// Server-only admin client (bypasses RLS — only use in API routes)
export const supabaseAdmin = () => createClient(supabaseUrl, supabaseService, {
  auth: { persistSession: false },
});
