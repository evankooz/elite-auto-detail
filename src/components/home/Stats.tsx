import { clientConfig } from '@/config/client.config';

export default function Stats() {
  return (
    <section className="bg-dark-800 border-y border-white/5">
      <div className="container-site py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/5">
          {clientConfig.stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center px-6">
              <span className="font-display text-3xl md:text-4xl font-bold green-text mb-1">
                {value}
              </span>
              <span className="text-white/50 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
