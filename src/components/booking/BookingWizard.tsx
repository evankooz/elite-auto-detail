'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, parseISO, isWeekend } from 'date-fns';
import { Check, ChevronRight, ChevronLeft, Calendar, Clock, User, Loader2 } from 'lucide-react';
import { clientConfig } from '@/config/client.config';
import { cn, formatTimeDisplay } from '@/lib/utils';
import type { BookingFormData } from '@/types';

// ─── Validation schemas ───────────────────────────────────────────────────────

const step3Schema = z.object({
  customer_name:    z.string().min(2, 'Name must be at least 2 characters'),
  customer_email:   z.string().email('Enter a valid email address'),
  customer_phone:   z.string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Enter digits only')
    .refine((val) => (val.match(/\d/g) ?? []).length >= 10, 'Phone must contain at least 10 digits'),
  customer_address: z.string().min(5, 'Enter your full service address'),
  notes:            z.string().optional(),
});

type Step3Data = z.infer<typeof step3Schema>;

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Service',  icon: Check },
  { n: 2, label: 'Schedule', icon: Calendar },
  { n: 3, label: 'Details',  icon: User },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-10 gap-0">
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex items-center">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
            current > step.n  ? 'bg-brand-400 border-brand-400 text-dark-900' :
            current === step.n ? 'border-brand-400 text-brand-400 bg-brand-400/10' :
                                 'border-white/15 text-white/30',
          )}>
            {current > step.n ? <Check size={14} /> : step.n}
          </div>
          <span className={cn(
            'ml-2 text-sm font-medium hidden sm:block',
            current === step.n ? 'text-white' : 'text-white/30',
          )}>{step.label}</span>
          {i < STEPS.length - 1 && (
            <div className={cn(
              'w-12 sm:w-20 h-px mx-3',
              current > step.n + 1 ? 'bg-brand-400' : 'bg-white/10',
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Service selection ────────────────────────────────────────────────

function Step1({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-white mb-2">Choose a Service</h2>
      <p className="text-white/50 mb-8">All services include a satisfaction guarantee.</p>
      <div className="grid gap-4">
        {clientConfig.services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={cn(
              'w-full text-left p-5 rounded-xl border transition-all',
              value === s.id
                ? 'border-brand-400 bg-brand-400/10'
                : 'border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="text-3xl mt-0.5">{s.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{s.name}</span>
                    {s.popular && (
                      <span className="text-xs bg-brand-400 text-dark-900 px-2 py-0.5 rounded-full font-bold">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/50 mb-2">{s.description}</p>
                  <p className="text-xs text-white/30">~{Math.round(s.duration / 60)} hours · {s.includes.length} inclusions</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-brand-400 font-bold font-display text-lg">{s.priceLabel}</div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-2 ml-auto',
                  value === s.id ? 'border-brand-400 bg-brand-400' : 'border-white/20',
                )}>
                  {value === s.id && <Check size={10} className="text-dark-900" />}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Date & time selection ───────────────────────────────────────────

function Step2({
  serviceId,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: {
  serviceId:    string;
  selectedDate: string;
  selectedTime: string;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
}) {
  const [slots,   setSlots]   = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const service = clientConfig.services.find(s => s.id === serviceId)!;
  const { maxAdvanceDays, workDays } = clientConfig.hours;

  // Build available dates
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= maxAdvanceDays; i++) {
    const d = addDays(today, i);
    const dayOfWeek = d.getDay();
    if (workDays.includes(dayOfWeek as any)) dates.push(d);
  }

  // Fetch available time slots when date changes
  useEffect(() => {
    if (!selectedDate) { setSlots([]); return; }
    setLoading(true);
    fetch(`/api/availability?date=${selectedDate}&service=${serviceId}`)
      .then(r => r.json())
      .then(d => { setSlots(d.slots ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedDate, serviceId]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-white mb-2">Pick a Date & Time</h2>
      <p className="text-white/50 mb-8">
        Service: <span className="text-brand-400">{service.name}</span>
      </p>

      {/* Date picker — horizontal scroll list */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
          <Calendar size={14} />
          Select Date
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {dates.map((d) => {
            const iso   = format(d, 'yyyy-MM-dd');
            const isSelected = iso === selectedDate;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => { onDateChange(iso); onTimeChange(''); }}
                className={cn(
                  'flex flex-col items-center min-w-[72px] py-3 px-4 rounded-xl border text-sm transition-all shrink-0',
                  isSelected
                    ? 'border-brand-400 bg-brand-400/15 text-white'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/80',
                )}
              >
                <span className={cn('text-xs mb-1', isSelected ? 'text-brand-400' : 'text-white/30')}>
                  {format(d, 'EEE')}
                </span>
                <span className="font-bold text-base">{format(d, 'd')}</span>
                <span className={cn('text-xs mt-1', isSelected ? 'text-white/60' : 'text-white/20')}>
                  {format(d, 'MMM')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
            <Clock size={14} />
            Select Time
          </label>
          {loading ? (
            <div className="flex items-center gap-2 text-white/30 text-sm py-4">
              <Loader2 size={16} className="animate-spin" />
              Checking availability…
            </div>
          ) : slots.length === 0 ? (
            <p className="text-white/30 text-sm py-4">
              No available slots for this date. Please try another day.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTimeChange(t)}
                  className={cn(
                    'py-2.5 px-3 rounded-lg border text-sm font-medium transition-all',
                    selectedTime === t
                      ? 'border-brand-400 bg-brand-400/15 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/80',
                  )}
                >
                  {formatTimeDisplay(t)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Contact details ──────────────────────────────────────────────────

function Step3({ register, errors, summary }: {
  register: ReturnType<typeof useForm<Step3Data>>['register'];
  errors:   ReturnType<typeof useForm<Step3Data>>['formState']['errors'];
  summary:  { service: string; date: string; time: string };
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-white mb-2">Your Details</h2>
      <p className="text-white/50 mb-6">
        Confirmation will be sent to your phone and email.
      </p>

      {/* Booking summary */}
      <div className="bg-brand-400/8 border border-brand-400/20 rounded-xl p-4 mb-8 text-sm">
        <p className="text-brand-400 font-semibold mb-2">Booking Summary</p>
        <div className="space-y-1 text-white/60">
          <p>Service: <span className="text-white">{summary.service}</span></p>
          <p>Date: <span className="text-white">{format(parseISO(summary.date), 'EEEE, MMMM d, yyyy')}</span></p>
          <p>Time: <span className="text-white">{formatTimeDisplay(summary.time)}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm text-white/60 mb-1.5">Full Name *</label>
          <input
            {...register('customer_name')}
            className="input-dark"
            placeholder="John Smith"
          />
          {errors.customer_name && (
            <p className="text-red-400 text-xs mt-1">{errors.customer_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1.5">Email *</label>
          <input
            {...register('customer_email')}
            type="email"
            className="input-dark"
            placeholder="john@example.com"
          />
          {errors.customer_email && (
            <p className="text-red-400 text-xs mt-1">{errors.customer_email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1.5">Phone *</label>
          <input
            {...register('customer_phone')}
            type="tel"
            className="input-dark"
            placeholder="(555) 123-4567"
          />
          {errors.customer_phone && (
            <p className="text-red-400 text-xs mt-1">{errors.customer_phone.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm text-white/60 mb-1.5">Service Address *</label>
          <input
            {...register('customer_address')}
            className="input-dark"
            placeholder="123 Main St, Your City, ST 00000"
          />
          {errors.customer_address && (
            <p className="text-red-400 text-xs mt-1">{errors.customer_address.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm text-white/60 mb-1.5">Special Notes (optional)</label>
          <textarea
            {...register('notes')}
            className="input-dark resize-none h-24"
            placeholder="Gate code, parking instructions, specific areas of concern…"
          />
        </div>
      </div>

      <p className="text-white/30 text-xs mt-4">
        By booking you agree to our cancellation policy: 24+ hours notice required for free reschedule.
      </p>
    </div>
  );
}

// ─── Success screen ──────────────────────────────────────────────────────────

function SuccessScreen({ bookingId }: { bookingId: string }) {
  return (
    <div className="text-center py-10">
      <div className="w-20 h-20 rounded-full bg-brand-400/20 border-2 border-brand-400 flex items-center justify-center mx-auto mb-6">
        <Check size={36} className="text-brand-400" />
      </div>
      <h2 className="font-display text-3xl font-bold text-white mb-3">You're Booked!</h2>
      <p className="text-white/60 max-w-md mx-auto mb-6">
        Your appointment is confirmed. Check your phone and email for confirmation details.
        Ref: <span className="text-brand-400 font-mono font-bold">{bookingId.slice(0, 8).toUpperCase()}</span>
      </p>
      <p className="text-white/40 text-sm mb-8">
        We'll send you a confirmation email within a few minutes.
        We'll send you a reminder 24 hours before your appointment.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <a href="/" className="btn-primary">Return Home</a>
        <a href="/services" className="btn-outline">Explore More Services</a>
      </div>
    </div>
  );
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

export default function BookingWizard() {
  const params     = useSearchParams();
  const [step,     setStep]     = useState(1);
  const [service,  setService]  = useState(params.get('service') ?? '');
  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [bookingId, setBookingId] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  });

  const canNext = useCallback(() => {
    if (step === 1) return !!service;
    if (step === 2) return !!date && !!time;
    return true;
  }, [step, service, date, time]);

  const onSubmit = async (data: Step3Data) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ service_id: service, date, time, ...data }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setBookingId(json.data.id);
      setStep(4);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = clientConfig.services.find(s => s.id === service);

  if (step === 4) return <SuccessScreen bookingId={bookingId} />;

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} />

      <div className="card-dark p-8">
        {step === 1 && (
          <Step1 value={service} onChange={setService} />
        )}
        {step === 2 && (
          <Step2
            serviceId={service}
            selectedDate={date}
            selectedTime={time}
            onDateChange={setDate}
            onTimeChange={setTime}
          />
        )}
        {step === 3 && (
          <form onSubmit={handleSubmit(onSubmit)} id="booking-form">
            <Step3
              register={register}
              errors={errors}
              summary={{
                service: selectedService?.name ?? '',
                date,
                time,
              }}
            />
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </form>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
              className={cn(
                'btn-primary text-sm px-8 py-3 flex items-center gap-2',
                !canNext() && 'opacity-40 cursor-not-allowed hover:transform-none hover:shadow-none',
              )}
            >
              Continue
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              form="booking-form"
              disabled={loading}
              className="btn-primary text-sm px-8 py-3 flex items-center gap-2 min-w-[160px] justify-center"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Booking…</>
              ) : (
                <><Check size={16} /> Confirm Booking</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
