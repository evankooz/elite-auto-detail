import Link from 'next/link';
import Image from 'next/image';

// Replace with real before/after photos stored in Supabase Storage or public/images/
const galleryItems = [
  { before: '/images/gallery/car-1-before.jpg', after: '/images/gallery/car-1-after.jpg', label: 'Full Detail – Sedan' },
  { before: '/images/gallery/car-2-before.jpg', after: '/images/gallery/car-2-after.jpg', label: 'Exterior Polish – SUV' },
  { before: '/images/gallery/home-1-before.jpg', after: '/images/gallery/home-1-after.jpg', label: 'Kitchen Deep Clean' },
];

export default function Gallery() {
  return (
    <section className="section-pad bg-dark-900 section-divider">
      <div className="container-site">
        <div className="text-center mb-14">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Our Work</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            See the <span className="gold-text">Difference</span>
          </h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto">
            Real results from real customers. Swipe to see before and after.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryItems.map((item, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/5">
              {/* Before/After split effect — shows after on hover */}
              <div className="relative aspect-[4/3] bg-dark-700">
                {/* Before image (shown by default) */}
                <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
                  {/* In production, use real images */}
                  <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center">
                    <span className="text-white/20 text-sm">BEFORE</span>
                  </div>
                </div>
                {/* After image (shown on hover) */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="w-full h-full bg-gradient-to-br from-dark-600 to-dark-800 flex items-center justify-center border border-brand-400/20">
                    <span className="text-brand-400/50 text-sm">AFTER</span>
                  </div>
                </div>
                {/* Hover hint */}
                <div className="absolute top-3 left-3 bg-dark-900/70 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs text-white/60">
                  Hover for After
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-white/70">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/gallery" className="btn-outline">
            View Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
