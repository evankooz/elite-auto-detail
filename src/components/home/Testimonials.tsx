import { Star, Quote } from 'lucide-react';
import { clientConfig } from '@/config/client.config';

export default function Testimonials() {
  return (
    <section className="section-pad bg-dark-800 section-divider">
      <div className="container-site">
        <div className="text-center mb-14">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Reviews</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            What Customers <span className="gold-text">Say</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {clientConfig.testimonials.map((t, i) => (
            <div key={i} className="card-dark p-6 flex flex-col hover:border-brand-400/20 transition-colors">
              <Quote size={24} className="text-brand-400/30 mb-3" />
              <p className="text-white/70 text-sm leading-relaxed flex-1 mb-4">"{t.text}"</p>
              <div>
                <div className="flex mb-2">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={12} className="text-brand-400 fill-brand-400" />
                  ))}
                </div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{t.service}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
