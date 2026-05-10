/**
 * CLIENT CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 * This is THE file you edit when setting up a new client.
 * All other code reads from here — brand, copy, services, hours.
 *
 * To duplicate for a new client:
 *  1. Copy this entire project (or use the template repo)
 *  2. Update every field below
 *  3. Set matching .env.local values (see .env.example)
 *  4. Deploy to a new Vercel project
 * ─────────────────────────────────────────────────────────────
 */

export const clientConfig = {
  // ── Business identity ────────────────────────────────────────
  businessName: 'Elite Auto & Home Detail',
  tagline:      'Showroom Finish. Every Time.',
  description:  'Premium mobile auto and home detailing in [Your City]. We come to you — no travel required.',
  phone:        '(555) 123-4567',
  email:        'info@eliteautoandhomedetail.com',
  address:      '123 Main St, Your City, ST 00000',
  serviceArea:  'Serving [City], [Nearby Town], and surrounding areas',
  timezone:     'America/Chicago',  // Service area timezone for booking consistency

  // ── SEO ──────────────────────────────────────────────────────
  seo: {
    title:        'Elite Auto & Home Detail | Premium Detailing Services',
    description:  'Professional mobile auto and home detailing. Book online in minutes. Serving [Your City] and surrounding areas.',
    keywords:     'auto detailing, car detailing, home detailing, mobile detailing, [Your City]',
    ogImage:      '/og-image.jpg',
  },

  // ── Brand colors (used in tailwind.config.js via CSS vars) ──
  // Override in src/app/globals.css under :root
  brand: {
    primary:    '#2E8B57', // green
    secondary:  '#0A0A0B', // near-black
    accent:     '#236B43',
  },

  // ── Navigation ───────────────────────────────────────────────
  nav: [
    { label: 'Services', href: '/services' },
    { label: 'Gallery',  href: '/gallery' },
    { label: 'About',    href: '/about' },
    { label: 'Contact',  href: '/contact' },
  ],

  // ── Services catalog ─────────────────────────────────────────
  // These are also seeded into the `services` DB table
  services: [
    {
      id:          'exterior-detail',
      name:        'Exterior Detail',
      category:    'auto',
      description: 'Full wash, clay bar, polish, and ceramic sealant for a showroom-quality shine.',
      price:       149,
      priceLabel:  'Starting at $149',
      duration:    120, // minutes
      icon:        '🚗',
      popular:     false,
      includes:    ['Hand wash & dry', 'Clay bar decontamination', 'Paint polish', 'Ceramic sealant', 'Tire & trim dressing'],
    },
    {
      id:          'interior-detail',
      name:        'Interior Detail',
      category:    'auto',
      description: 'Deep clean of every surface — seats, carpets, vents, and glass.',
      price:       129,
      priceLabel:  'Starting at $129',
      duration:    150,
      icon:        '💺',
      popular:     false,
      includes:    ['Vacuum & shampoo carpets', 'Leather/fabric seat cleaning', 'Dashboard & console wipe-down', 'Window cleaning', 'Air vent detailing'],
    },
    {
      id:          'full-detail',
      name:        'Full Detail Package',
      category:    'auto',
      description: 'The complete treatment — exterior and interior combined for maximum results.',
      price:       249,
      priceLabel:  'Starting at $249',
      duration:    240,
      icon:        '⭐',
      popular:     true,
      includes:    ['Everything in Exterior Detail', 'Everything in Interior Detail', 'Engine bay cleaning', 'Odor elimination treatment'],
    },
    {
      id:          'home-basic',
      name:        'Home Basic Clean',
      category:    'home',
      description: 'Thorough standard cleaning of living spaces, kitchen, and bathrooms.',
      price:       120,
      priceLabel:  'Starting at $120',
      duration:    180,
      icon:        '🏠',
      popular:     false,
      includes:    ['Kitchen surfaces & appliances', 'Bathroom scrub & sanitize', 'Vacuuming & mopping', 'Dusting all surfaces', 'Trash removal'],
    },
    {
      id:          'home-deep',
      name:        'Home Deep Clean',
      category:    'home',
      description: 'Intensive whole-home clean covering every corner, inside cabinets, and beyond.',
      price:       220,
      priceLabel:  'Starting at $220',
      duration:    300,
      icon:        '✨',
      popular:     true,
      includes:    ['Everything in Basic Clean', 'Inside oven & fridge', 'Cabinet interiors', 'Baseboards & crown molding', 'Window sill & track cleaning'],
    },
  ],

  // ── Business hours & booking rules ───────────────────────────
  hours: {
    // 0 = Sunday, 6 = Saturday
    workDays:    [1, 2, 3, 4, 5, 6], // Mon–Sat
    startHour:   8,   // 8:00 AM
    endHour:     17,  // 5:00 PM (last slot start)
    slotMinutes: 60,  // booking slot interval
    maxAdvanceDays: 60,  // how far ahead customers can book
    minAdvanceHours: 2,  // minimum notice required
  },

  // ── Testimonials ─────────────────────────────────────────────
  testimonials: [
    {
      name:    'Sarah M.',
      rating:  5,
      text:    'Absolutely incredible work! My car looks better than the day I bought it. Will definitely be a repeat customer.',
      service: 'Full Detail Package',
      date:    '2024-07',
    },
    {
      name:    'James T.',
      rating:  5,
      text:    'The team was professional, on time, and thorough. My home has never looked cleaner. Highly recommend!',
      service: 'Home Deep Clean',
      date:    '2024-07',
    },
    {
      name:    'Maria L.',
      rating:  5,
      text:    'I was skeptical about mobile detailing but these guys blew me away. The attention to detail is unmatched.',
      service: 'Exterior Detail',
      date:    '2024-06',
    },
    {
      name:    'David R.',
      rating:  5,
      text:    'Best investment for my truck. Clay bar treatment made the paint look like glass. Book them — you won\'t regret it.',
      service: 'Full Detail Package',
      date:    '2024-06',
    },
  ],

  // ── Trust signals ────────────────────────────────────────────
  stats: [
    { value: '500+', label: 'Happy Customers' },
    { value: '5.0★', label: 'Average Rating' },
    { value: '3 Yrs', label: 'In Business' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  // ── Social links ─────────────────────────────────────────────
  social: {
    instagram: 'https://instagram.com/eliteautoandhomedetail',
    facebook:  'https://facebook.com/eliteautoandhomedetail',
    google:    'https://g.page/eliteautoandhomedetail',
  },

  // ── Notifications ────────────────────────────────────────────
  notifications: {
    ownerPhone: process.env.OWNER_PHONE ?? '',  // e.g. '+15551234567'
    ownerEmail: process.env.OWNER_EMAIL ?? '',
    fromPhone:  process.env.TWILIO_PHONE_NUMBER ?? '',
    fromEmail:  'onboarding@resend.dev',
    fromName:   'Elite Auto & Home Detail',
  },
} as const;

export type ClientConfig = typeof clientConfig;
export type Service      = typeof clientConfig.services[number];
