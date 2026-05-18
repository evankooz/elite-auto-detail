import Link from 'next/link';
import { clientConfig } from '@/config/client.config';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="bg-dark-800 border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <span className="font-display text-base font-bold green-text">
                {clientConfig.businessName}
              </span>
              <span className="text-xs bg-brand-400/15 text-brand-400 border border-brand-400/25 px-2 py-0.5 rounded-md font-medium">
                Admin
              </span>
            </div>
            <Link
              href="/"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}