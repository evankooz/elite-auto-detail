import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { clientConfig } from '@/config/client.config';
import { generateTimeSlots } from '@/lib/utils';
import { parseISO, isValid } from 'date-fns';

// GET /api/availability?date=YYYY-MM-DD&service=service-id
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const rateLimitError = checkRateLimit(req, RATE_LIMITS.availability);
  if (rateLimitError) return rateLimitError;

  const { searchParams } = new URL(req.url);
  const dateStr   = searchParams.get('date');
  const serviceId = searchParams.get('service');

  if (!dateStr || !serviceId) {
    return NextResponse.json({ success: false, error: 'Missing date or service' }, { status: 400 });
  }

  const date = parseISO(dateStr);
  if (!isValid(date)) {
    return NextResponse.json({ success: false, error: 'Invalid date' }, { status: 400 });
  }

  // Check it's a work day
  const dayOfWeek = date.getDay();
  if (!clientConfig.hours.workDays.includes(dayOfWeek as any)) {
    return NextResponse.json({ success: true, slots: [] });
  }

  // Find service duration
  const service = clientConfig.services.find(s => s.id === serviceId);
  if (!service) {
    return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
  }

  // Get existing bookings for this date
  const db = supabaseAdmin();
  const { data: bookings } = await db
  .from('booking_slots')
  .select('time, duration')
  .eq('date', dateStr);

  const bookedTimes = (bookings ?? []).map(b => b.time as string);

  // Generate open slots
  const slots = generateTimeSlots(date, bookedTimes, service.duration);

  return NextResponse.json({ success: true, slots, date: dateStr });
}
