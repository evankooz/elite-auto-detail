import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook, Star } from 'lucide-react';
import { clientConfig } from '@/config/client.config';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5">
      <div className="container-site py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-xl font-bold gold-text mb-3">
              {clientConfig.businessName}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              {clientConfig.description}
            </p>
            <div className="flex gap-3">
              {clientConfig.social.instagram && (
                <a href={clientConfig.social.instagram} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-brand-400 hover:bg-white/10 transition-all">
                  <Instagram size={16} />
                </a>
              )}
              {clientConfig.social.facebook && (
                <a href={clientConfig.social.facebook} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-brand-400 hover:bg-white/10 transition-all">
                  <Facebook size={16} />
                </a>
              )}
              {clientConfig.social.google && (
                <a href={clientConfig.social.google} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-brand-400 hover:bg-white/10 transition-all">
                  <Star size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5">
              {clientConfig.services.map((s) => (
                <li key={s.id}>
                  <Link href="/services"
                    className="text-sm text-white/50 hover:text-white transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us',   href: '/about' },
                { label: 'Gallery',    href: '/gallery' },
                { label: 'Contact',    href: '/contact' },
                { label: 'Book Now',   href: '/booking' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${clientConfig.phone}`}
                   className="flex items-center gap-2.5 text-sm text-white/50 hover:text-brand-400 transition-colors">
                  <Phone size={14} className="text-brand-400 shrink-0" />
                  {clientConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${clientConfig.email}`}
                   className="flex items-center gap-2.5 text-sm text-white/50 hover:text-brand-400 transition-colors">
                  <Mail size={14} className="text-brand-400 shrink-0" />
                  {clientConfig.email}
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2.5 text-sm text-white/50">
                  <MapPin size={14} className="text-brand-400 shrink-0 mt-0.5" />
                  {clientConfig.serviceArea}
                </span>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/booking" className="btn-primary text-sm py-2.5 px-5 w-full justify-center">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container-site py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {clientConfig.businessName}. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Professional website by{' '}
            <span className="text-white/30">YourAgencyName</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
