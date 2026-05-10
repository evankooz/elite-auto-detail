import twilio from 'twilio';
import { Resend } from 'resend';
import { format, parseISO } from 'date-fns';
import { clientConfig } from '@/config/client.config';
import type { Booking } from '@/types';

// ─── Clients ─────────────────────────────────────────────────────────────────

const getTwilio = () => twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

const getResend = () => new Resend(process.env.RESEND_API_KEY!);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(date: string, time: string): string {
  const normalizedTime = time.substring(0, 5);
  const dt = parseISO(`${date}T${normalizedTime}:00`);
  return format(dt, "EEEE, MMMM d 'at' h:mm a");
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
}

// ─── SMS ─────────────────────────────────────────────────────────────────────

async function sendSMS(to: string, body: string) {
  const client = getTwilio();
  try {
    await client.messages.create({
      from: clientConfig.notifications.fromPhone,
      to:   toE164(to),
      body,
    });
  } catch (err) {
    console.error('[SMS Error]', err);
    // Don't throw — notification failure shouldn't break booking
  }
}

// ─── Email HTML template ─────────────────────────────────────────────────────

function emailWrapper(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body{margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden}
    .header{background:#0A0A0B;padding:32px;text-align:center}
    .header h1{color:#2E8B57;font-size:22px;margin:0;font-weight:600;letter-spacing:.5px}
    .header p{color:#888;font-size:13px;margin:4px 0 0}
    .body{padding:32px}
    .body p{color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px}
    .detail-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0}
    .detail-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5e7eb;font-size:14px}
    .detail-row:last-child{border-bottom:none}
    .detail-label{color:#6b7280;font-weight:500}
    .detail-value{color:#111827;font-weight:500}
    .cta{text-align:center;margin:28px 0 0}
    .cta a{background:#2E8B57;color:#0A0A0B;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;display:inline-block}
    .footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center}
    .footer p{color:#9ca3af;font-size:12px;margin:0}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>${clientConfig.businessName}</h1>
      <p>${clientConfig.tagline}</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>${clientConfig.businessName} · ${clientConfig.phone} · ${clientConfig.email}</p>
      <p style="margin-top:4px">${clientConfig.serviceArea}</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const resend = getResend();
  try {
    // Resend automatically sets Content-Type: text/html when html parameter is provided
    await resend.emails.send({
      from:    `${clientConfig.notifications.fromName} <${clientConfig.notifications.fromEmail}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[Email Error]', err);
  }
}

// ─── Notification templates ───────────────────────────────────────────────────

export async function sendBookingConfirmation(booking: Booking) {
  const dateStr = formatDateTime(booking.date, booking.time);
  const { businessName, phone } = clientConfig;

  // ── Customer SMS ──
  await sendSMS(
    booking.customer_phone,
    `✅ Booking Confirmed!\n\n${businessName}\nService: ${booking.service_name}\nWhen: ${dateStr}\nAddress: ${booking.customer_address}\n\nQuestions? Call us: ${phone}`
  );

  // ── Customer Email ──
  await sendEmail(
    booking.customer_email,
    `Booking Confirmed – ${booking.service_name}`,
    emailWrapper('Booking Confirmed', `
      <p>Hi ${booking.customer_name},</p>
      <p>Your appointment is confirmed! We'll arrive at your location ready to deliver a showroom-quality result.</p>
      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.service_name}</span></div>
        <div class="detail-row"><span class="detail-label">Date & Time</span><span class="detail-value">${dateStr}</span></div>
        <div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${booking.customer_address}</span></div>
        <div class="detail-row"><span class="detail-label">Price</span><span class="detail-value">$${booking.price}</span></div>
        <div class="detail-row"><span class="detail-label">Confirmation #</span><span class="detail-value">${booking.id.slice(0, 8).toUpperCase()}</span></div>
      </div>
      <p>Need to reschedule? Contact us at <strong>${phone}</strong> at least 24 hours in advance.</p>
    `)
  );

  // ── Owner SMS ──
  await sendSMS(
    clientConfig.notifications.ownerPhone,
    `📅 NEW BOOKING!\nService: ${booking.service_name}\nCustomer: ${booking.customer_name}\nPhone: ${booking.customer_phone}\nWhen: ${dateStr}\nAddress: ${booking.customer_address}\nRef: ${booking.id.slice(0, 8).toUpperCase()}`
  );

  // ── Owner Email ──
  await sendEmail(
    clientConfig.notifications.ownerEmail,
    `New Booking: ${booking.service_name} – ${booking.customer_name}`,
    emailWrapper('New Booking Received', `
      <p>You have a new booking!</p>
      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.service_name}</span></div>
        <div class="detail-row"><span class="detail-label">Date & Time</span><span class="detail-value">${dateStr}</span></div>
        <div class="detail-row"><span class="detail-label">Customer</span><span class="detail-value">${booking.customer_name}</span></div>
        <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${booking.customer_phone}</span></div>
        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${booking.customer_email}</span></div>
        <div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${booking.customer_address}</span></div>
        <div class="detail-row"><span class="detail-label">Price</span><span class="detail-value">$${booking.price}</span></div>
        ${booking.notes ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">${booking.notes}</span></div>` : ''}
        <div class="detail-row"><span class="detail-label">Booking ID</span><span class="detail-value">${booking.id}</span></div>
      </div>
      <div class="cta"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">View in Admin Dashboard</a></div>
    `)
  );
}

export async function sendBookingReminder(booking: Booking) {
  const dateStr = formatDateTime(booking.date, booking.time);
  const { businessName, phone } = clientConfig;

  // ── Customer SMS reminder ──
  await sendSMS(
    booking.customer_phone,
    `⏰ Reminder: Your ${booking.service_name} appointment with ${businessName} is TOMORROW!\n\nWhen: ${dateStr}\nAddress: ${booking.customer_address}\n\nNeed to reschedule? Call: ${phone}`
  );

  // ── Customer Email reminder ──
  await sendEmail(
    booking.customer_email,
    `Reminder: Your appointment is tomorrow!`,
    emailWrapper('Appointment Tomorrow', `
      <p>Hi ${booking.customer_name},</p>
      <p>Just a friendly reminder that your appointment is <strong>tomorrow</strong>. We're excited to serve you!</p>
      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.service_name}</span></div>
        <div class="detail-row"><span class="detail-label">Date & Time</span><span class="detail-value">${dateStr}</span></div>
        <div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${booking.customer_address}</span></div>
      </div>
      <p><strong>Please ensure:</strong></p>
      <ul style="color:#374151;font-size:15px;line-height:2">
        <li>Access to the vehicle/area</li>
        <li>Water source available (for auto services)</li>
        <li>Clear the area of personal items</li>
      </ul>
      <p>To reschedule, call us at <strong>${phone}</strong>.</p>
    `)
  );
}

export async function sendRescheduleNotification(booking: Booking) {
  const dateStr = formatDateTime(booking.date, booking.time);
  const { businessName, phone } = clientConfig;

  // ── Customer SMS ──
  await sendSMS(
    booking.customer_phone,
    `📅 Appointment Rescheduled\n\n${businessName}\nService: ${booking.service_name}\nNew time: ${dateStr}\nAddress: ${booking.customer_address}\n\nQuestions? Call us: ${phone}`
  );

  // ── Customer Email ──
  await sendEmail(
    booking.customer_email,
    `Your appointment has been rescheduled`,
    emailWrapper('Appointment Rescheduled', `
      <p>Hi ${booking.customer_name},</p>
      <p>Your appointment has been rescheduled. Here are your updated details:</p>
      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.service_name}</span></div>
        <div class="detail-row"><span class="detail-label">New Date & Time</span><span class="detail-value">${dateStr}</span></div>
        <div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${booking.customer_address}</span></div>
        <div class="detail-row"><span class="detail-label">Confirmation #</span><span class="detail-value">${booking.id.slice(0, 8).toUpperCase()}</span></div>
      </div>
      <p>If you did not request this change or need to make further adjustments, please contact us at <strong>${phone}</strong>.</p>
    `)
  );
}