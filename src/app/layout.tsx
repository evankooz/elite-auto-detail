import type { Metadata } from 'next';
import './globals.css';
import { clientConfig } from '@/config/client.config';
import { validateEnvironment } from '@/lib/env';

// Validate environment at build/startup time
if (typeof window === 'undefined') {
  validateEnvironment();
}

export const metadata: Metadata = {
  title:       clientConfig.seo.title,
  description: clientConfig.seo.description,
  keywords:    clientConfig.seo.keywords,
  openGraph: {
    title:       clientConfig.seo.title,
    description: clientConfig.seo.description,
    images:      [clientConfig.seo.ogImage],
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       clientConfig.seo.title,
    description: clientConfig.seo.description,
    images:      [clientConfig.seo.ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-dark-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}