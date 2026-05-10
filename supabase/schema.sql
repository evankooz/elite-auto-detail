-- ═══════════════════════════════════════════════════════════════
-- DETAILING SAAS — SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL editor for each new client
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Service info (denormalized for historical accuracy)
  service_id       TEXT NOT NULL,
  service_name     TEXT NOT NULL,
  duration         INTEGER NOT NULL,       -- minutes
  price            NUMERIC(10,2) NOT NULL,

  -- Schedule
  date             DATE NOT NULL,
  time             TIME NOT NULL,          -- HH:MM (24h) — TODO: consider TIMESTAMPTZ for DST handling

  -- Customer info
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  notes            TEXT,

  -- Status
  status           TEXT NOT NULL DEFAULT 'confirmed'
                   CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),

  -- Timestamps
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_bookings_date       ON bookings(date);
CREATE INDEX idx_bookings_status     ON bookings(status);
CREATE INDEX idx_bookings_customer   ON bookings(customer_email);
CREATE INDEX idx_bookings_date_time  ON bookings(date, time);

-- ─── SERVICES (optional — use for dynamic pricing/admin) ─────────────────────

CREATE TABLE IF NOT EXISTS services (
  id          TEXT PRIMARY KEY,            -- matches client.config.ts service IDs
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,               -- 'auto' | 'home'
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  duration    INTEGER NOT NULL,            -- minutes
  active      BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AVAILABILITY OVERRIDES (blocked dates, custom hours) ────────────────────

CREATE TABLE IF NOT EXISTS availability_overrides (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date         DATE NOT NULL UNIQUE,
  is_blocked   BOOLEAN DEFAULT false,      -- true = whole day blocked
  notes        TEXT,                       -- "Holiday", "Vacation", etc.
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REMINDERS LOG ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reminders_log (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,               -- 'confirmation' | 'reminder_24h' | 'reminder_1h'
  sent_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  channel     TEXT DEFAULT 'sms+email',
  success     BOOLEAN DEFAULT true
);

CREATE INDEX idx_reminders_booking ON reminders_log(booking_id);

-- ─── UPDATED_AT trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- Anon can insert bookings (for the booking form)
-- Anon can read availability (to show open slots)
-- Admin secret (service role key) bypasses RLS

ALTER TABLE bookings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders_log          ENABLE ROW LEVEL SECURITY;

-- Public: insert bookings (booking form)
CREATE POLICY "Anyone can create a booking"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (true);

-- Public: read confirmed/pending bookings for availability checks
CREATE POLICY "Read bookings for availability"
  ON bookings FOR SELECT
  TO anon
  USING (status IN ('confirmed', 'pending'));

-- Public: read availability overrides
CREATE POLICY "Read availability overrides"
  ON availability_overrides FOR SELECT
  TO anon
  USING (true);

-- ─── SEED SERVICES (optional) ────────────────────────────────────────────────
-- Uncomment and customize to seed from config:
/*
INSERT INTO services (id, name, category, price, duration, sort_order) VALUES
  ('exterior-detail', 'Exterior Detail', 'auto', 149, 120, 1),
  ('interior-detail', 'Interior Detail', 'auto', 129, 150, 2),
  ('full-detail',     'Full Detail Package', 'auto', 249, 240, 3),
  ('home-basic',      'Home Basic Clean', 'home', 120, 180, 4),
  ('home-deep',       'Home Deep Clean', 'home', 220, 300, 5)
ON CONFLICT (id) DO NOTHING;
*/

-- ─── HELPFUL VIEWS ────────────────────────────────────────────────────────────

-- Today's schedule
CREATE VIEW todays_schedule AS
  SELECT
    b.time,
    b.customer_name,
    b.service_name,
    b.customer_address,
    b.customer_phone,
    b.status,
    b.price
  FROM bookings b
  WHERE b.date = CURRENT_DATE
    AND b.status IN ('confirmed', 'pending')
  ORDER BY b.time;

-- Monthly revenue summary
CREATE VIEW monthly_revenue AS
  SELECT
    DATE_TRUNC('month', date)::DATE AS month,
    COUNT(*) AS total_bookings,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    SUM(price) FILTER (WHERE status = 'completed') AS revenue
  FROM bookings
  GROUP BY DATE_TRUNC('month', date)
  ORDER BY month DESC;
