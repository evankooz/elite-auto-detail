import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clientConfig } from '@/config/client.config';
import { format, addMinutes, parse, isAfter, isBefore, addHours } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(cents);
}

/**
 * Generate all available time slots for a given date.
 * Filters out slots already booked (pass existing bookings in).
 */
export function generateTimeSlots(
  date: Date,
  bookedTimes: string[] = [],
  serviceDuration: number = 60,
): string[] {
  const { startHour, endHour, slotMinutes } = clientConfig.hours;
  const slots: string[] = [];
  const minAdvance = addHours(new Date(), clientConfig.hours.minAdvanceHours);

  let current = new Date(date);
  current.setHours(startHour, 0, 0, 0);
  const end = new Date(date);
  end.setHours(endHour, 0, 0, 0);

  while (isBefore(current, end)) {
    const timeStr = format(current, 'HH:mm');
    const slotEnd = addMinutes(current, serviceDuration);

    const isBooked = bookedTimes.some(t => {
      const bt = parse(t, 'HH:mm', date);
      return !(isAfter(current, addMinutes(bt, serviceDuration)) || isBefore(slotEnd, bt));
    });

    const isPast = isBefore(current, minAdvance);

    if (!isBooked && !isPast && isBefore(slotEnd, end)) {
      slots.push(timeStr);
    }

    current = addMinutes(current, slotMinutes);
  }

  return slots;
}

export function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}
