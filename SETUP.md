# Detailing SaaS — Complete Setup & Operations Guide

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [First-Time Setup](#2-first-time-setup)
3. [Supabase Setup](#3-supabase-setup)
4. [SMS Setup (Twilio)](#4-sms-setup-twilio)
5. [Email Setup (Resend)](#5-email-setup-resend)
6. [Deploying to Vercel](#6-deploying-to-vercel)
7. [Configuring a New Client](#7-configuring-a-new-client)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Adding Payments (Stripe)](#9-adding-payments-stripe)
10. [Scaling to Multiple Clients](#10-scaling-to-multiple-clients)
11. [Monthly Cost Breakdown](#11-monthly-cost-breakdown)
12. [Future SaaS Platform Path](#12-future-saas-platform-path)

---

## 1. Architecture Overview

```
Each client = 1 Git branch/repo + 1 Vercel project + 1 Supabase project
                                                        │
                    ┌───────────────────────────────────▼────────────────────┐
                    │  Next.js 14 (App Router)  ·  Deployed on Vercel        │
                    │                                                          │
                    │  Pages: Home · Services · Booking · Gallery · About     │
                    │  API:   /api/bookings · /api/availability · /api/reminders│
                    └───────────────────────────────────┬────────────────────┘
                                                        │
                    ┌──────────────┐    ┌───────────────▼──────────────┐
                    │   Supabase   │    │        Notifications          │
                    │  PostgreSQL  │    │  Twilio (SMS) + Resend (Email)│
                    │  + Auth      │    │  Vercel Cron (daily reminders)│
                    └──────────────┘    └──────────────────────────────┘
```

**Why this stack for a subscription business:**
- **Next.js on Vercel** — Zero-config deployments, automatic scaling, built-in serverless functions. No server to manage.
- **Supabase** — Generous free tier ($0/client at low volume), Postgres with RLS, real-time if needed later.
- **Twilio** — Industry standard for SMS, ~$0.0075/message, pay-as-you-go.
- **Resend** — 3,000 free emails/month per account. Clean API, great deliverability.
- **Vercel Cron** — Free on Hobby plan, handles the daily reminder job without a separate worker.

---

## 2. First-Time Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Accounts on: Vercel, Supabase, Twilio, Resend

### Local development
```bash
# Clone / unzip the project
cd detailing-saas

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# → Fill in your values (see sections below)

# Run dev server
npm run dev
# → Open http://localhost:3000
```

---

## 3. Supabase Setup

### Create a new Supabase project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it after your client (e.g., `elite-auto-detail`)
3. Choose a region close to your users (e.g., `us-east-1`)
4. Save the database password

### Run the schema
1. In Supabase → SQL Editor → New Query
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

### Get your keys
Go to **Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**keep this secret — never expose in browser**)

### Viewing bookings directly
Use **Supabase Studio → Table Editor → bookings** to see all bookings. You can also use the `todays_schedule` view for a quick daily overview.

---

## 4. SMS Setup (Twilio)

### Create Twilio account
1. Sign up at [twilio.com](https://twilio.com)
2. Start with the **free trial** ($15 credit — enough for hundreds of test SMS)
3. Get a **phone number** (Twilio Console → Phone Numbers → Buy a number)
   - Choose a local area code matching your client's area

### Get credentials
- **Account SID** → `TWILIO_ACCOUNT_SID`
- **Auth Token** → `TWILIO_AUTH_TOKEN`
- **Phone Number** (E.164 format, e.g., `+15551234567`) → `TWILIO_PHONE_NUMBER`

### Cost estimate
| Volume | Monthly SMS Cost |
|--------|-----------------|
| 50 bookings/mo | ~$2.25 (3 SMS/booking: confirm × 2 + reminder × 1) |
| 100 bookings/mo | ~$4.50 |
| 200 bookings/mo | ~$9.00 |

### Enable SMS for the owner's phone
- In Twilio trial, you must **verify** the owner's phone number before sending to it.
- Go to Twilio Console → Verified Caller IDs → Add a number.
- In production (paid), this restriction is lifted.

---

## 5. Email Setup (Resend)

### Create Resend account
1. Sign up at [resend.com](https://resend.com)
2. Free tier: **3,000 emails/month** — plenty for most small clients

### Add your domain
1. Resend Dashboard → Domains → Add Domain
2. Enter your client's domain (e.g., `eliteautoandhomedetail.com`)
3. Add the provided DNS records (MX, SPF, DKIM) in your DNS registrar
4. Wait for verification (can take up to 24 hours)

### Create an API key
- Resend → API Keys → Create API Key
- Scope: `Full access` (or `Sending access` for tighter security)
- Copy to `RESEND_API_KEY`

### Update `from` address
In `src/config/client.config.ts`:
```ts
notifications: {
  fromEmail: 'bookings@eliteautoandhomedetail.com',
  fromName:  'Elite Auto & Home Detailing',
}
```

---

## 6. Deploying to Vercel

### Initial deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: elite-auto-detail (or client name)
# - Framework: Next.js (auto-detected)
```

### Set environment variables
In Vercel Dashboard → Your Project → Settings → Environment Variables, add **all** variables from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
RESEND_API_KEY
OWNER_PHONE
OWNER_EMAIL
ADMIN_SECRET
CRON_SECRET
NEXT_PUBLIC_SITE_URL
```

### Connect custom domain
1. Vercel → Project → Settings → Domains
2. Add `eliteautoandhomedetail.com`
3. Update DNS at your registrar with the provided records

### Vercel Cron (reminders)
The `vercel.json` file already configures the daily reminder cron at **8:00 AM UTC**.

> ⚠️ Vercel Hobby plan supports 1 cron job. The Pro plan ($20/mo) supports unlimited.
> If you need multiple cron schedules, upgrade or use a free external cron (cron-job.org) to hit your `/api/reminders` endpoint.

Set `CRON_SECRET` in Vercel env vars — this protects the endpoint from unauthorized calls.

### Production deploy
```bash
# Deploy to production
vercel --prod
```

---

## 7. Configuring a New Client

This is the key to your subscription model. **It takes under 30 minutes to set up a new client.**

### Step-by-step duplication

```bash
# 1. Clone the template repo (keep a clean "template" branch)
git clone https://github.com/yourname/detailing-saas-template new-client-name
cd new-client-name

# 2. Create a new git repo for this client
git remote remove origin
git remote add origin https://github.com/yourname/client-name-site
git push -u origin main
```

### What to change (5 files total)

#### File 1: `src/config/client.config.ts`
This is **the only file you MUST edit** — everything else reads from it.

```ts
// Change ALL of these:
businessName: 'Sparkle Clean Co.',
tagline:      'Your Home, Spotless.',
phone:        '(555) 987-6543',
email:        'info@sparkleclean.com',
serviceArea:  'Serving Portland, Beaverton, and Hillsboro',

services: [
  // Customize or remove services
  // Add new service types for this business category
],

hours: {
  workDays: [1, 2, 3, 4, 5], // Mon-Fri only for this client
  startHour: 9,
  endHour:   17,
},
```

#### File 2: `src/app/globals.css` — brand colors
```css
:root {
  --brand-400: #2E8B57;
  --font-display: 'Cormorant Garamond'; /* Different display font */
}
```

#### File 3: `.env.local` — all new credentials
New Supabase project, new Twilio number, new Resend API key, new ADMIN_SECRET.

#### File 4: `vercel.json` — (usually no change needed)

#### File 5: `public/` — Replace favicon, OG image, any client photos

### New Supabase project
- Create a **brand new** Supabase project for each client
- Run `supabase/schema.sql` in the new project
- Update env vars with the new project's keys

### New Vercel project
- `vercel` → create new project → link to the client's repo
- Add all env vars
- Connect client's domain

**Total setup time per new client: ~20–30 minutes**

---

## 8. Admin Dashboard

The owner accesses the admin dashboard at:
```
https://their-domain.com/admin
```

**Login:** The `ADMIN_SECRET` env var is the password.

### What owners can do
- View all bookings (filterable by status)
- Mark bookings as Complete or Cancelled
- See customer contact details and addresses
- Refresh the list on demand

### Giving owners direct Supabase access (optional)
For more sophisticated owners, give them read access to Supabase Studio:
1. Supabase → Settings → Team → Invite member
2. Set role to "Viewer"
3. They can use the Table Editor and views like `todays_schedule` and `monthly_revenue`

### Blocking dates (holidays, vacations)
Insert into the `availability_overrides` table:
```sql
INSERT INTO availability_overrides (date, is_blocked, notes)
VALUES ('2024-12-25', true, 'Christmas - closed');
```

> 🚧 **TODO for production:** Wire `availability_overrides` into the `/api/availability` route to filter out blocked dates. The schema is ready — just add the query.

---

## 9. Adding Payments (Stripe)

When you're ready to collect payment at booking time:

### Setup
```bash
npm install @stripe/stripe-js stripe
```

Add to `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Implementation plan
1. **Add a `/api/checkout` route** that creates a Stripe Checkout Session:
```ts
// POST /api/checkout
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{
    price_data: {
      currency:     'usd',
      product_data: { name: service.name },
      unit_amount:  service.price * 100, // cents
    },
    quantity: 1,
  }],
  success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?session={CHECKOUT_SESSION_ID}`,
  cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/booking`,
  metadata: { ...bookingData }, // pass booking data through
});

return NextResponse.redirect(session.url!);
```

2. **Add a webhook** at `/api/webhooks/stripe` to:
   - Receive `checkout.session.completed`
   - Create the booking in Supabase
   - Send confirmation notifications

3. **Replace the booking form submit** with a redirect to Stripe Checkout instead of directly to `/api/bookings`

### Deposit-only option
Many service businesses take a small deposit ($25–$50) to reduce no-shows, with the balance due on-site. This is easy with Stripe — just set `unit_amount` to the deposit amount.

---

## 10. Scaling to Multiple Clients

### Current model (1–10 clients) — recommended
- One Vercel project per client (free–$20/mo per project)
- One Supabase project per client (free for small volume)
- One template repo + client-specific branches or forks
- **Estimated infra cost per client: $5–$15/mo**
- **Charge clients: $99–$199/mo** → strong margin

**Pros:** Complete data isolation, easy to cancel/hand-off a client, simple mental model.
**Cons:** More Vercel projects to manage as you scale past ~10.

### Intermediate model (10–50 clients) — multi-tenant Supabase
- Single Supabase project with `client_id` column on every table
- Single Vercel project with subdomain routing (`client1.youragency.com/`)
- Config stored in DB instead of `client.config.ts`
- Add a simple admin UI for you (not the client) to manage all clients

This is where the SaaS platform path begins.

### Full SaaS platform (50+ clients)
See section 12.

---

## 11. Monthly Cost Breakdown

| Service | Per Client | Notes |
|---------|-----------|-------|
| Vercel (Hobby) | $0 | 1 project free, includes cron |
| Vercel (Pro) | $20 | Needed if Hobby limits hit |
| Supabase | $0–$25 | Free up to 500MB DB + 1GB storage |
| Twilio SMS | $1–$5 | ~$0.0075/SMS, ~3/booking |
| Resend Email | $0–$20 | 3k free, then $20/mo for 50k |
| Domain (if you manage) | $1–$2/mo | ~$12–24/yr amortized |
| **Total infra** | **$2–$47/mo** | Most small clients: ~$5–15/mo |
| **Suggested client fee** | **$99–$199/mo** | Includes hosting + maintenance |
| **Your gross margin** | **~80–95%** | After infra, before your time |

### Value-adds to justify higher fees
- Monthly performance report (bookings, revenue, top services)
- Google Analytics setup and monthly summary
- Quarterly content updates (photos, testimonials)
- Priority support SLA
- Paid ads management (separate add-on)

---

## 12. Future SaaS Platform Path

When you have 20+ clients and want to build a true platform:

### Phase 1: Shared codebase
```
youragency.com          ← Your marketing site
app.youragency.com      ← Client onboarding dashboard
client1.youragency.com  ← Client 1's site
client2.youragency.com  ← Client 2's site
```

### Phase 2: Self-service onboarding
Build an onboarding wizard at `app.youragency.com/onboard`:
1. Business name, services, hours → stored in DB
2. Auto-provision Supabase schema via Supabase Management API
3. Auto-create Vercel project via Vercel API
4. Auto-deploy with client config

### Phase 3: SaaS billing
- Charge clients via Stripe Subscriptions (recurring billing)
- Offer tier plans: Starter ($79/mo), Growth ($149/mo), Pro ($249/mo)
- Higher tiers = more services, custom domain, analytics, SMS credits

### Tech to add for SaaS
```bash
npm install next-auth                  # Auth for your agency dashboard
npm install @stripe/stripe-js stripe   # Subscription billing
```

### Platform DB schema additions
```sql
-- Agency-level tables (in your own Supabase project)
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,  -- used for subdomain
  name        TEXT NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'starter',
  stripe_customer_id TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE client_configs (
  client_id   UUID REFERENCES clients(id),
  key         TEXT NOT NULL,
  value       JSONB,
  PRIMARY KEY (client_id, key)
);
```

---

## Quick Reference

### Common tasks

| Task | How |
|------|-----|
| Add a new service | Edit `services` array in `client.config.ts`, redeploy |
| Change pricing | Edit `price` field in `client.config.ts`, redeploy |
| Block a date | Insert into `availability_overrides` table in Supabase |
| View today's bookings | Supabase → Table Editor → `todays_schedule` view |
| Change business hours | Edit `hours` in `client.config.ts`, redeploy |
| Add a testimonial | Edit `testimonials` array in `client.config.ts`, redeploy |
| Update contact info | Edit top fields in `client.config.ts`, redeploy |

### Emergency contacts for clients to save
```
Your site is managed by: [Your Agency Name]
Support email: support@youragency.com
Support phone: (555) 000-0000
Admin dashboard: https://their-domain.com/admin
```

---

*Template version 1.0 — Built for subscription-based web service agencies*
