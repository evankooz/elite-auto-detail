import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Clock, ArrowRight, Shield, Star } from 'lucide-react';
import { clientConfig } from '@/config/client.config';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Services & Pricing | ${clientConfig.businessName}`,
  description: `Full list of auto and home detailing services with transparent pricing. ${clientConfig.serviceArea}.`,
};

const guarantees = [
  { icon: Shield, title: '100% Satisfaction',  desc: 'Not happy? We\'ll return and make it right — free of charge.' },
  { icon: Star,   title: 'No Hidden Fees',      desc: 'Price quoted is price charged. Always.' },
  { icon: Clock,  title: 'On-Time Arrival',     desc: 'We respect your time and always arrive within the booked window.' },
];

export default function ServicesPage() {
  const autoServices = clientConfig.services.filter(s => s.category === 'auto');
  const homeServices = clientConfig.services.filter(s => s.category === 'home');

  return (
    <div className="min-h-screen bg-dark-900 pt-28 pb-20">
      {/* Hero */}
      <div className="container-site text-center mb-20">
        <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Services & Pricing</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-5">
          Transparent Pricing.<br />
          <span className="green-text">Exceptional Results.</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          No estimates, no surprises. Choose from our menu of professional detailing services — all performed by certified technicians.
        </p>
      </div>

      {/* Auto services */}
      <div className="container-site mb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display text-3xl font-bold text-white">Auto Detailing</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {autoServices.map((service) => (
            <div key={service.id} className={cn(
              'card-dark p-7 flex flex-col relative',
              service.popular && 'border-brand-400/40 ring-1 ring-brand-400/20',
            )}>
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-400 text-dark-900 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="text-5xl mb-5">{service.icon}</div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">{service.name}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-5">{service.description}</p>

              {/* Price + duration */}
              <div className="flex items-end gap-3 mb-6">
                <span className="font-display text-3xl font-bold green-text">{service.priceLabel}</span>
                <span className="text-white/30 text-sm mb-1 flex items-center gap-1">
                  <Clock size={12} /> ~{Math.round(service.duration / 60)}h
                </span>
              </div>

              {/* Includes */}
              <div className="border-t border-white/5 pt-5 mb-6 flex-1">
                <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-3">What's included</p>
                <ul className="space-y-2">
                  {service.includes.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                      <Check size={14} className="text-brand-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/booking?service=${service.id}`}
                className={cn(
                  'flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-all',
                  service.popular ? 'btn-primary' : 'btn-outline',
                )}
              >
                Book Now
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Home services */}
      <div className="container-site mb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display text-3xl font-bold text-white">Home Detailing</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {homeServices.map((service) => (
            <div key={service.id} className={cn(
              'card-dark p-7 flex flex-col relative',
              service.popular && 'border-brand-400/40 ring-1 ring-brand-400/20',
            )}>
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-400 text-dark-900 text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{service.icon}</span>
                <span className="font-display text-3xl font-bold green-text">{service.priceLabel}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{service.name}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{service.description}</p>
              <div className="flex items-center gap-2 text-white/30 text-sm mb-5">
                <Clock size={12} />
                ~{Math.round(service.duration / 60)} hours
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {service.includes.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check size={14} className="text-brand-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/booking?service=${service.id}`}
                className={cn(
                  'flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-all',
                  service.popular ? 'btn-primary' : 'btn-outline',
                )}
              >
                Book Now <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Guarantees */}
      <div className="container-site mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {guarantees.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-dark p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-white/50 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="container-site text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-white/50 mb-8">Book online in 60 seconds. Instant confirmation sent to your phone.</p>
        <Link href="/booking" className="btn-primary text-lg px-12 py-4">
          Book Your Appointment
        </Link>
      </div>
    </div>
  );
}
