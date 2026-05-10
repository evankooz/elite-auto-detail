import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Award, Heart, Users } from 'lucide-react';
import { clientConfig } from '@/config/client.config';

export const metadata: Metadata = {
  title: `About Us | ${clientConfig.businessName}`,
  description: `Learn about ${clientConfig.businessName} — professional detailing serving ${clientConfig.serviceArea}.`,
};

const values = [
  { icon: Shield, title: 'Integrity',     desc: 'We quote honestly, arrive on time, and stand behind our work with a satisfaction guarantee.' },
  { icon: Award,  title: 'Excellence',    desc: 'We use only professional-grade products and techniques — the same ones used by luxury dealerships.' },
  { icon: Heart,  title: 'Care',          desc: 'Your property is treated with the same care we\'d give our own.' },
  { icon: Users,  title: 'Community',     desc: 'Locally owned and operated, proud to serve our neighbors.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-900 pt-28 pb-20">
      <div className="container-site">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Passion for Clean.<br />
            <span className="gold-text">Built on Trust.</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-5">
            {clientConfig.businessName} was founded with a simple belief: every vehicle and home deserves to look its absolute best — and getting there shouldn't be complicated or expensive.
          </p>
          <p className="text-white/50 leading-relaxed">
            We started as a small mobile detailing operation and grew through word of mouth alone. Today, we serve hundreds of customers across {clientConfig.serviceArea}, and every single job is backed by our 100% satisfaction guarantee. We come to you, fully equipped, and we don't leave until you love the result.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-20">
          {clientConfig.stats.map(({ value, label }) => (
            <div key={label} className="card-dark p-6 text-center">
              <div className="font-display text-3xl font-bold gold-text mb-1">{value}</div>
              <div className="text-white/50 text-sm">{label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="font-display text-3xl font-bold text-white mb-10 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-dark p-7 flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-brand-400/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                  <p className="text-white/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products/process section */}
        <div className="bg-dark-800 rounded-3xl border border-white/5 p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                Professional-Grade Products Only
              </h2>
              <p className="text-white/50 leading-relaxed mb-4">
                We use only professional-grade, eco-friendly cleaning solutions and equipment — the same products trusted by luxury auto dealers and professional cleaning services.
              </p>
              <p className="text-white/50 leading-relaxed">
                Every technician completes hands-on training before working independently, and we invest in ongoing education to stay current with the latest detailing methods.
              </p>
            </div>
            <div className="space-y-4">
              {['Clay bar decontamination', 'Ceramic paint sealants', 'pH-balanced auto shampoos', 'HEPA-filtered wet/dry vacuums', 'Enzyme-based odor eliminators', 'Steam sanitization'].map(item => (
                <div key={item} className="flex items-center gap-3 text-white/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to experience the difference?
          </h2>
          <p className="text-white/50 mb-8">Book online — we'll handle everything else.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/booking" className="btn-primary text-lg px-10">Book Now</Link>
            <Link href="/contact"  className="btn-outline text-lg px-10">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
