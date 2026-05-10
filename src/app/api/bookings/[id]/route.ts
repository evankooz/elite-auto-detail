import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendRescheduleNotification } from '@/lib/notifications';
import { validateAdminSession } from '@/lib/adminAuth';
import { checkCSRF } from '@/lib/security';
import type { Booking } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  // CSRF protection
  const csrfError = checkCSRF(req);
  if (csrfError) return csrfError;

  // Validate admin session (centralized auth)
  if (!validateAdminSession(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    const isReschedule = body.date !== undefined || body.time !== undefined;

    // Handle status update
    if (body.status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }
      updates.status = body.status;
    }

    // Handle reschedule
    if (isReschedule) {
      if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
        return NextResponse.json({ success: false, error: 'Invalid date format' }, { status: 400 });
      }
      if (body.time && !/^\d{2}:\d{2}(:\d{2})?$/.test(body.time)) {
        return NextResponse.json({ success: false, error: 'Invalid time format' }, { status: 400 });
      }

      // Check if new slot is available (prevent double-booking on reschedule)
      if (body.date && body.time) {
        const db = supabaseAdmin();
        const normalizedTime = body.time.length === 5 ? `${body.time}:00` : body.time;
        const { data: conflicts } = await db
          .from('bookings')
          .select('id')
          .eq('date', body.date)
          .eq('time', normalizedTime)
          .eq('status', 'confirmed')
          .neq('id', id);

        if (conflicts && conflicts.length > 0) {
          return NextResponse.json(
            { success: false, error: 'New time slot is not available.' },
            { status: 409 },
          );
        }
      }

      if (body.date) updates.date = body.date;
      if (body.time) updates.time = body.time.length === 5 ? `${body.time}:00` : body.time;
    }

    const db = supabaseAdmin();
    const { data, error } = await db
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Send reschedule notification — only when date/time changed, not for status updates
    if (isReschedule && data) {
      sendRescheduleNotification(data as Booking).catch(err => {
        console.error('[Reschedule Notification Error]', err);
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[Booking PATCH Error]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}