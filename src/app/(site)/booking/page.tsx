import type { Metadata } from 'next';
import { Suspense } from 'react';
import { clientConfig } from '@/config/client.config';
import BookingWizard from '@/components/booking/BookingWizard';

export const metadata: Metadata = {
  title:       `Book Now | ${clientConfig.businessName}`,
  description: `Schedule your detailing appointment online. Quick, easy booking with instant confirmation.`,
};

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-dark-900 pt-28 pb-20">
      <div className="container-site">
        {/* Page header */}
        <div className="text-center mb-12">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Online Booking
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Schedule Your <span className="green-text">Appointment</span>
          </h1>
          <p className="text-white/50 max-w-lg mx-auto">
            Choose your service, pick a time, and we'll handle the rest.
            Instant confirmation sent to your phone and email.
          </p>
        </div>

        <Suspense fallback={<div className="h-96" />}>
          <BookingWizard />
        </Suspense>
      </div>
    </div>
  );
}
