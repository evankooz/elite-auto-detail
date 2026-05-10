import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { clientConfig } from '@/config/client.config';
import { cn } from '@/lib/utils';

export default function Services() {
  return (
    <section className="section-pad bg-dark-900">
      <div className="container-site">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Our Services</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Every Detail. <span className="gold-text">Perfected.</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-lg">
            From quick refreshes to complete transformations — choose the service that fits your needs.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientConfig.services.map((service) => (
            <div
              key={service.id}
              className={cn(
                'card-dark p-6 flex flex-col relative overflow-hidden transition-all duration-300 group',
                'hover:border-brand-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-400/5',
                service.popular && 'border-brand-400/40',
              )}
            >
              {service.popular && (
                <div className="absolute top-4 right-4 bg-brand-400 text-dark-900 text-xs font-bold px-2.5 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">{service.name}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4 flex-1">{service.description}</p>
              <div className="text-brand-400 text-2xl font-bold font-display mb-4">
                {service.priceLabel}
              </div>
              <ul className="space-y-1.5 mb-6">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                    <Check size={14} className="text-brand-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/booking?service=${service.id}`}
                className={cn(
                  'flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold transition-all',
                  service.popular
                    ? 'btn-primary'
                    : 'border border-white/10 text-white/70 hover:border-brand-400/40 hover:text-white group-hover:bg-white/5',
                )}
              >
                Book This Service
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/services" className="btn-outline">
            View All Service Details
          </Link>
        </div>
      </div>
    </section>
  );
}
