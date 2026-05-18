'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';
import { clientConfig } from '@/config/client.config';
import { cn } from '@/lib/utils';

export default function Header() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-dark-900/95 backdrop-blur-md border-b border-white/5 py-3'
        : 'bg-transparent py-5',
    )}>
      <div className="container-site flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-display text-xl font-bold green-text">
            {clientConfig.businessName.split('&')[0].trim()}
          </span>
          <span className="font-display text-sm text-white/60 -mt-0.5">
            &amp; {clientConfig.businessName.split('&')[1]?.trim()}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {clientConfig.nav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={`tel:${clientConfig.phone}`}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-brand-400 transition-colors"
          >
            <Phone size={14} />
            {clientConfig.phone}
          </a>
          <Link href="/booking" className="btn-primary text-sm py-2.5 px-6">
            Book Now
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="md:hidden bg-dark-800/98 backdrop-blur-md border-t border-white/5 px-6 py-6">
          <nav className="flex flex-col gap-4 mb-6">
            {clientConfig.nav.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-lg font-medium text-white/80 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/booking"
            className="btn-primary w-full justify-center"
            onClick={() => setOpen(false)}
          >
            Book Now
          </Link>
          <a
            href={`tel:${clientConfig.phone}`}
            className="flex items-center justify-center gap-2 mt-4 text-sm text-white/50"
          >
            <Phone size={14} />
            {clientConfig.phone}
          </a>
        </div>
      )}
    </header>
  );
}
