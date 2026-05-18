'use client';
import { useState } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, XCircle, Loader2, Pencil, X } from 'lucide-react';
import { cn, formatTimeDisplay } from '@/lib/utils';
import { clientConfig } from '@/config/client.config';
import type { Booking, BookingStatus } from '@/types';

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  completed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

// ─── Reschedule Modal ─────────────────────────────────────────────────────────

function RescheduleModal({
  booking,
  onClose,
  onSaved,
}: {
  booking: Booking;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date,    setDate]    = useState(booking.date.substring(0, 10));
  const [time,    setTime]    = useState(booking.time.substring(0, 5));
  const [slots,   setSlots]   = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const { workDays, maxAdvanceDays } = clientConfig.hours;

  // Build selectable dates
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i <= maxAdvanceDays; i++) {
    const d = addDays(today, i);
    if (workDays.includes(d.getDay() as any)) dates.push(d);
  }

  const fetchSlots = async (selectedDate: string) => {
    setLoading(true);
    setTime('');
    try {
      const res  = await fetch(`/api/availability?date=${selectedDate}&service=${booking.service_id}`);
      const json = await res.json();
      // Keep the current booked time selectable even if it's now "taken"
      const currentTime = booking.time.substring(0, 5);
      const merged = Array.from(new Set([...(json.slots ?? []), currentTime])).sort();
      setSlots(merged);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    fetchSlots(d);
  };

  const handleSave = async () => {
    if (!date || !time) { setError('Please select both a date and time.'); return; }
    setSaving(true);
    setError('');
    try {
      // No Authorization header — session cookie is sent automatically
      const res  = await fetch(`/api/bookings/${booking.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ date, time }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to reschedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card-dark w-full max-w-lg p-6 relative"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 id="modal-title" className="font-display text-xl text-white font-bold">
              Reschedule Appointment
            </h2>
            <p className="text-white/40 text-sm mt-0.5">
              {booking.customer_name} — {booking.service_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current appointment */}
        <div className="bg-white/5 rounded-lg px-4 py-3 mb-5 text-sm">
          <p className="text-white/40 text-xs mb-1">Current appointment</p>
          <p className="text-white font-medium">
            {format(parseISO(booking.date.substring(0, 10)), 'EEEE, MMMM d, yyyy')} at{' '}
            {formatTimeDisplay(booking.time.substring(0, 5))}
          </p>
        </div>

        {/* Date picker */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
            <Calendar size={13} /> New Date
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((d) => {
              const iso        = format(d, 'yyyy-MM-dd');
              const isSelected = iso === date;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleDateChange(iso)}
                  className={cn(
                    'flex flex-col items-center min-w-[64px] py-2.5 px-3 rounded-xl border text-sm transition-all shrink-0',
                    isSelected
                      ? 'border-brand-400 bg-brand-400/15 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/80',
                  )}
                >
                  <span className={cn('text-xs mb-0.5', isSelected ? 'text-brand-400' : 'text-white/30')}>
                    {format(d, 'EEE')}
                  </span>
                  <span className="font-bold">{format(d, 'd')}</span>
                  <span className={cn('text-xs mt-0.5', isSelected ? 'text-white/60' : 'text-white/20')}>
                    {format(d, 'MMM')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time picker */}
        {date && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
              <Clock size={13} /> New Time
            </label>
            {loading ? (
              <div className="flex items-center gap-2 text-white/30 text-sm py-2">
                <Loader2 size={14} className="animate-spin" /> Checking availability…
              </div>
            ) : slots.length === 0 ? (
              <p className="text-white/30 text-sm">No available slots for this date.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={cn(
                      'py-2 px-2 rounded-lg border text-xs font-medium transition-all',
                      time === t
                        ? 'border-brand-400 bg-brand-400/15 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/25',
                    )}
                  >
                    {formatTimeDisplay(t)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !date || !time}
            className={cn(
              'btn-primary flex-1 justify-center py-3 text-sm',
              (saving || !date || !time) && 'opacity-40 cursor-not-allowed hover:transform-none hover:shadow-none',
            )}
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Confirm Reschedule'}
          </button>
          <button onClick={onClose} className="btn-outline py-3 px-5 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [bookings,     setBookings]     = useState<Booking[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [filter,       setFilter]       = useState<'all' | BookingStatus>('all');
  const [authed,       setAuthed]       = useState(false);
  const [password,     setPassword]     = useState(''); // cleared immediately after login
  const [error,        setError]        = useState('');
  const [rescheduling, setRescheduling] = useState<Booking | null>(null);

  // Fetches bookings — does NOT manage loading state so callers can compose it.
  const fetchBookings = async () => {
    try {
      // Cookie is sent automatically; no Authorization header needed.
      const res  = await fetch('/api/bookings');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setBookings(json.data);
    } catch (e: any) {
      setError(e.message);
      if (e.message === 'Unauthorized') setAuthed(false);
    }
  };

  // Exchanges the password for a session cookie, then loads bookings.
  // A single loading flag covers both steps so the spinner never flickers off mid-fetch.
  const login = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ secret: password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPassword(''); // clear from memory as soon as the cookie is set
      setAuthed(true);
      await fetchBookings(); // awaited so finally runs after data arrives
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Used by the Refresh button — owns its own loading bookend.
  const handleRefresh = async () => {
    setLoading(true);
    await fetchBookings();
    setLoading(false);
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    // Cookie sent automatically; no Authorization header needed.
    await fetch(`/api/bookings/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    await handleRefresh();
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  // ── Login screen ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-dark p-8 w-full max-w-sm">
          <h1 className="font-display text-2xl text-white mb-6">Admin Login</h1>
          <input
            type="password"
            className="input-dark mb-4"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={login} disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Access Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <>
      {rescheduling && (
        <RescheduleModal
          booking={rescheduling}
          onClose={() => setRescheduling(null)}
          onSaved={handleRefresh}
        />
      )}

      <div className="pb-20">
        <div className="container-site pt-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl text-white">Bookings Dashboard</h1>
              <p className="text-white/40 text-sm mt-1">{bookings.length} total bookings</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-outline text-sm py-2 px-4"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Refresh'}
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-all',
                  filter === f
                    ? 'bg-brand-400/15 border-brand-400/40 text-brand-400'
                    : 'border-white/10 text-white/40 hover:text-white/70',
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({bookings.filter(b => b.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Booking list */}
          {loading ? (
            <div className="flex items-center gap-2 text-white/30 py-12 justify-center">
              <Loader2 size={20} className="animate-spin" />
              Loading bookings…
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-white/30 text-center py-12">No bookings found.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((b) => (
                <div key={b.id} className="card-dark p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-semibold text-white text-lg">{b.service_name}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', STATUS_COLORS[b.status])}>
                          {b.status}
                        </span>
                        <span className="text-brand-400 font-bold">${b.price}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <span className="flex items-center gap-2 text-white/50">
                          <Calendar size={13} className="text-brand-400" />
                          {format(parseISO(b.date.substring(0, 10)), 'EEEE, MMM d, yyyy')} at{' '}
                          {formatTimeDisplay(b.time.substring(0, 5))}
                        </span>
                        <span className="flex items-center gap-2 text-white/50">
                          <User size={13} className="text-brand-400" />
                          {b.customer_name}
                        </span>
                        <span className="flex items-center gap-2 text-white/50">
                          <Phone size={13} className="text-brand-400" />
                          {b.customer_phone}
                        </span>
                        <span className="flex items-center gap-2 text-white/50">
                          <Mail size={13} className="text-brand-400" />
                          {b.customer_email}
                        </span>
                        <span className="flex items-center gap-2 text-white/50 sm:col-span-2">
                          <MapPin size={13} className="text-brand-400 shrink-0" />
                          {b.customer_address}
                        </span>
                      </div>
                      {b.notes && (
                        <p className="mt-2 text-white/40 text-sm italic">Notes: {b.notes}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {b.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => setRescheduling(b)}
                            className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-500 transition-colors"
                          >
                            <Pencil size={14} /> Reschedule
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, 'completed')}
                            className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors"
                          >
                            <CheckCircle size={14} /> Mark Complete
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, 'cancelled')}
                            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        </>
                      )}
                      <p className="text-white/20 text-xs mt-1">#{b.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}