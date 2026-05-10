'use client';
import Link from 'next/link';
import { ChevronDown, Star } from 'lucide-react';
import { clientConfig } from '@/config/client.config';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-900">
        {/* Green accent glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]
                        bg-brand-400/8 blur-[120px] rounded-full pointer-events-none" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="container-site relative z-10 pt-32 pb-20">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 bg-brand-400/10 border border-brand-400/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-brand-400 fill-brand-400" />
            ))}
          </div>
          <span className="text-brand-400 text-xs font-semibold">500+ 5-Star Reviews</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 max-w-4xl animate-fade-up">
          <span className="text-white">Premium </span>
          <span className="green-text">Detailing</span>
          <br />
          <span className="text-white/90 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            That Comes <em className="not-italic text-white">To You</em>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {clientConfig.description} Book online in 60 seconds — we handle everything else.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <Link href="/booking" className="btn-primary text-lg px-10 py-4 gap-2">
            Book Now — It's Free
          </Link>
          <Link href="/services" className="btn-outline text-lg px-10 py-4">
            View Services
          </Link>
        </div>

        {/* Service area note */}
        <p className="mt-6 text-white/35 text-sm animate-fade-in" style={{ animationDelay: '0.35s' }}>
          📍 {clientConfig.serviceArea}
        </p>

        {/* Service quick-links */}
        <div className="mt-16 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          {clientConfig.services.slice(0, 4).map((s) => (
            <Link
              key={s.id}
              href="/booking"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10
                         rounded-xl px-4 py-2.5 text-sm text-white/70 hover:text-white transition-all"
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
              <span className="text-brand-400 font-semibold">{s.priceLabel.split(' ').pop()}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={16} />
      </div>
    </section>
  );
}
