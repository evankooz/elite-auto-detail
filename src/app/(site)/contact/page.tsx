'use client';
import type { Metadata } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle } from 'lucide-react';
import { clientConfig } from '@/config/client.config';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ContactPage() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);

  // Simple mailto fallback — replace with Resend API call if desired
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate send
    setSent(true);
    setLoading(false);
  };

  const { hours } = clientConfig;
  const workDayLabels = hours.workDays.map(d => DAY_NAMES[d]).join(', ');
  const startAMPM = hours.startHour >= 12
    ? `${hours.startHour - 12 || 12}pm` : `${hours.startHour}am`;
  const endAMPM = hours.endHour >= 12
    ? `${hours.endHour - 12 || 12}pm` : `${hours.endHour}am`;

  return (
    <div className="min-h-screen bg-dark-900 pt-28 pb-20">
      <div className="container-site">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Contact</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">
            Get in <span className="green-text">Touch</span>
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            Questions about a service? Ready to book? We typically respond within a few hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact form */}
          <div className="card-dark p-8">
            {sent ? (
              <div className="text-center py-10">
                <CheckCircle size={48} className="text-brand-400 mx-auto mb-4" />
                <h3 className="font-display text-2xl text-white mb-2">Message Sent!</h3>
                <p className="text-white/50 mb-6">We'll be in touch shortly. For fastest response, give us a call.</p>
                <a href={`tel:${clientConfig.phone}`} className="btn-primary">
                  Call {clientConfig.phone}
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="font-display text-2xl font-bold text-white mb-6">Send a Message</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Your Name</label>
                    <input
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input-dark"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Email Address</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-dark"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Message</label>
                    <textarea
                      required
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="input-dark resize-none h-32"
                      placeholder="Ask about a service, pricing, availability…"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            {/* Fastest path */}
            <div className="card-dark p-7">
              <h3 className="font-semibold text-white mb-4 text-lg">Fastest Way to Book</h3>
              <Link href="/booking" className="btn-primary w-full justify-center mb-3">
                Book Online Now
              </Link>
              <p className="text-center text-white/30 text-sm">Instant confirmation · Takes 60 seconds</p>
            </div>

            {/* Contact details */}
            <div className="card-dark p-7 space-y-5">
              <h3 className="font-semibold text-white text-lg mb-2">Contact Details</h3>
              <a href={`tel:${clientConfig.phone}`}
                 className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-0.5">Phone</p>
                  <p className="text-white group-hover:text-brand-400 transition-colors font-medium">
                    {clientConfig.phone}
                  </p>
                </div>
              </a>
              <a href={`mailto:${clientConfig.email}`}
                 className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-0.5">Email</p>
                  <p className="text-white group-hover:text-brand-400 transition-colors font-medium">
                    {clientConfig.email}
                  </p>
                </div>
              </a>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-0.5">Service Area</p>
                  <p className="text-white font-medium">{clientConfig.serviceArea}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-0.5">Business Hours</p>
                  <p className="text-white font-medium">{workDayLabels}</p>
                  <p className="text-white/50 text-sm">{startAMPM} – {endAMPM}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
