import Link from 'next/link';
import { clientConfig } from '@/config/client.config';

export default function CTA() {
  return (
    <section className="section-pad bg-dark-900 section-divider">
      <div className="container-site">
        <div className="relative rounded-3xl overflow-hidden bg-dark-700 border border-brand-400/20 px-8 py-16 md:py-20 text-center">
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-brand-400/10 blur-3xl rounded-full" />

          <div className="relative z-10">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4">
              Ready to Book?
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 max-w-2xl mx-auto">
              Your{' '}
              <span className="gold-shimmer">Best-Looking</span>
              {' '}Vehicle is One Click Away
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              Join 500+ satisfied customers. Booking takes 60 seconds — and we come to you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/booking" className="btn-primary text-lg px-12 py-4">
                Book Now — It's Free
              </Link>
              <a href={`tel:${clientConfig.phone}`}
                 className="text-white/60 hover:text-brand-400 text-sm transition-colors">
                Or call {clientConfig.phone}
              </a>
            </div>
            <p className="text-white/30 text-xs mt-6">
              100% Satisfaction Guarantee · No Prepayment Required · We Come To You
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
