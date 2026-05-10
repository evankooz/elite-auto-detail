import type { Metadata } from 'next';
import Link from 'next/link';
import { clientConfig } from '@/config/client.config';

export const metadata: Metadata = {
  title: `Gallery | ${clientConfig.businessName}`,
  description: `Before and after photos of our auto and home detailing work. See the results for yourself.`,
};

// Replace with real Supabase Storage URLs or public/images/ files
const galleryItems = [
  { label: 'Full Detail — Sedan',      category: 'Auto',  tag: 'Full Detail' },
  { label: 'Paint Correction — SUV',   category: 'Auto',  tag: 'Exterior' },
  { label: 'Interior Shampoo — Truck', category: 'Auto',  tag: 'Interior' },
  { label: 'Kitchen Deep Clean',       category: 'Home',  tag: 'Deep Clean' },
  { label: 'Bathroom Restoration',     category: 'Home',  tag: 'Deep Clean' },
  { label: 'Ceramic Coating — Sports', category: 'Auto',  tag: 'Premium' },
  { label: 'Living Room Refresh',      category: 'Home',  tag: 'Basic Clean' },
  { label: 'Engine Bay Detail',        category: 'Auto',  tag: 'Exterior' },
  { label: 'Move-Out Clean',           category: 'Home',  tag: 'Deep Clean' },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-dark-900 pt-28 pb-20">
      <div className="container-site">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Portfolio</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">
            Before & <span className="gold-text">After</span>
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            Real results from real customers. Hover over any photo to see the transformation.
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {galleryItems.map((item, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-brand-400/30 transition-all">
              {/* Image placeholder — replace with real <Image> from Supabase Storage */}
              <div className="relative aspect-[4/3]">
                {/* BEFORE */}
                <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0
                                bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white/20 text-xs font-semibold uppercase tracking-widest mb-1">Before</p>
                    <p className="text-white/10 text-sm">{item.label}</p>
                  </div>
                </div>
                {/* AFTER */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100
                                bg-gradient-to-br from-dark-800 to-dark-700 flex items-center justify-center
                                border border-brand-400/10">
                  <div className="text-center">
                    <p className="text-brand-400/50 text-xs font-semibold uppercase tracking-widest mb-1">After</p>
                    <p className="text-white/20 text-sm">{item.label}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  <span className="bg-dark-900/70 backdrop-blur-sm text-white/50 text-xs px-2.5 py-1 rounded-lg">
                    {item.category}
                  </span>
                  <span className="bg-brand-400/20 text-brand-400 text-xs px-2.5 py-1 rounded-lg font-medium">
                    {item.tag}
                  </span>
                </div>

                {/* Hover instruction */}
                <div className="absolute bottom-3 right-3 z-10 bg-dark-900/70 backdrop-blur-sm text-white/30 text-xs px-2 py-1 rounded-lg group-hover:opacity-0 transition-opacity">
                  Hover for after ›
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-white/70">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Adding real photos note (remove when live) ── */}
        <div className="card-dark p-6 mb-12 border-dashed text-center">
          <p className="text-white/30 text-sm">
            📸 <strong className="text-white/50">For the live site:</strong> Replace gallery placeholders with real before/after photos stored in Supabase Storage.
            Use <code className="text-brand-400">next/image</code> with your Supabase storage URL configured in <code className="text-brand-400">next.config.js</code>.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Want results like these?
          </h2>
          <Link href="/booking" className="btn-primary text-lg px-12 py-4">
            Book Your Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
