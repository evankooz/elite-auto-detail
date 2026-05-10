import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendBookingConfirmation } from '@/lib/notifications';
import { validateAdminSession } from '@/lib/adminAuth';
import { checkCSRF, sanitizeText, sanitizeName } from '@/lib/security';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { clientConfig } from '@/config/client.config';
import { z } from 'zod';
import type { Booking, ApiResponse } from '@/types';

// ─── Validation ──────────────────────────────────────────────────────────────

const createBookingSchema = z.object({
  service_id:       z.string().min(1),
  date:             z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:             z.string().regex(/^\d{2}:\d{2}$/),
  customer_name:    z.string().min(2),
  customer_email:   z.string().email(),
  customer_phone:   z.string().min(10),
  customer_address: z.string().min(5),
  notes:            z.string().optional(),
});

// ─── POST /api/bookings — create a booking ────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Booking>>> {
  // Rate limiting
  const rateLimitError = checkRateLimit(req, RATE_LIMITS.booking);
  if (rateLimitError) return rateLimitError as any;

  // CSRF protection
  const csrfError = checkCSRF(req);
  if (csrfError) return csrfError as any;

  try {
    let body;
    try {
      body = await req.json();
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
      }
      throw err;
    }
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid booking data' }, { status: 400 });
    }

    const { service_id, date, time, customer_name, customer_email, customer_phone, customer_address, notes } = parsed.data;

    // Find service
    const service = clientConfig.services.find(s => s.id === service_id);
    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    // Check slot is still available (race condition protection)
    const db = supabaseAdmin();
    const { data: conflicts } = await db
      .from('bookings')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .in('status', ['pending', 'confirmed']);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This time slot was just booked. Please choose another.' },
        { status: 409 },
      );
    }

    // Create booking with sanitized inputs
    const { data: booking, error } = await db
      .from('bookings')
      .insert({
        service_id,
        service_name:     service.name,
        date,
        time,
        duration:         service.duration,
        price:            service.price,
        customer_name:    sanitizeName(customer_name),
        customer_email,
        customer_phone,
        customer_address: sanitizeText(customer_address),
        notes:            notes ? sanitizeText(notes) : null,
        status:           'confirmed',
      })
      .select()
      .single();

    if (error || !booking) {
      console.error('[Booking Error]', error);
      return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
    }

    // Send notifications (non-blocking — failure won't break booking)
    sendBookingConfirmation(booking as Booking).catch(err => {
      console.error('[Notification Error]', err);
    });

    return NextResponse.json({ success: true, data: booking as Booking }, { status: 201 });

  } catch (err) {
    console.error('[Booking POST Error]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// ─── GET /api/bookings — list bookings (admin) ────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Validate admin session (centralized auth)
  if (!validateAdminSession(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const date   = searchParams.get('date');
  const limit  = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

  const db = supabaseAdmin();
  let query = db.from('bookings').select('*', { count: 'exact' }).order('date', { ascending: true }).order('time', { ascending: true });

  if (status) query = query.eq('status', status);
  if (date)   query = query.eq('date', date);

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data, pagination: { total: count, limit, offset } });
}
