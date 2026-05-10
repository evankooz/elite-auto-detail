import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendBookingReminder } from '@/lib/notifications';
import { format, addDays } from 'date-fns';
import type { Booking } from '@/types';

/**
 * GET /api/reminders
 *
 * Called daily by Vercel Cron (see vercel.json).
 * Sends 24-hour reminder SMS + email for tomorrow's bookings.
 * Protected by CRON_SECRET header set by Vercel.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Verify this is a legitimate Vercel cron call
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[Reminders] CRON_SECRET not configured');
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const db = supabaseAdmin();
  const { data: bookings, error } = await db
    .from('bookings')
    .select('*')
    .eq('date', tomorrow)
    .eq('status', 'confirmed');

  if (error) {
    console.error('[Reminders Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (bookings as Booking[]).map(async (booking) => {
      // Check we haven't already sent a reminder for this booking
      const { data: alreadySent } = await db
        .from('reminders_log')
        .select('id')
        .eq('booking_id', booking.id)
        .eq('type', 'reminder_24h')
        .single();

      if (alreadySent) return { id: booking.id, skipped: true };

      await sendBookingReminder(booking);

      // Log it
      await db.from('reminders_log').insert({
        booking_id: booking.id,
        type:       'reminder_24h',
        sent_at:    new Date().toISOString(),
      });

      return { id: booking.id, sent: true };
    }),
  );

  const sent    = results.filter(r => r.status === 'fulfilled').length;
  const failed  = results.filter(r => r.status === 'rejected').length;

  console.log(`[Reminders] ${sent} sent, ${failed} failed for ${tomorrow}`);
  return NextResponse.json({ success: true, date: tomorrow, sent, failed });
}
