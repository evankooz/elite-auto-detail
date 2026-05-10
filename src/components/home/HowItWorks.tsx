import Link from 'next/link';

const steps = [
  { n: '01', title: 'Choose Your Service', desc: 'Pick from our menu of auto and home detailing packages. Pricing is transparent — no surprises.' },
  { n: '02', title: 'Pick Date & Time',     desc: 'See real-time availability and choose a slot that works for you. Takes less than a minute.' },
  { n: '03', title: 'We Come To You',       desc: 'We arrive at your location on time, fully equipped. You relax while we do the work.' },
  { n: '04', title: 'Showroom Results',     desc: 'Inspect the finished job. Not satisfied? We\'ll fix it — 100% satisfaction guaranteed.' },
];

export default function HowItWorks() {
  return (
    <section className="section-pad bg-dark-800 section-divider">
      <div className="container-site">
        <div className="text-center mb-14">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">The Process</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Booking Takes <span className="gold-text">60 Seconds</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.n} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-brand-400/30 to-transparent -ml-4 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center mb-5">
                  <span className="font-display text-xl font-bold gold-text">{step.n}</span>
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link href="/booking" className="btn-primary text-lg px-12">
            Book Your Appointment Now
          </Link>
        </div>
      </div>
    </section>
  );
}
