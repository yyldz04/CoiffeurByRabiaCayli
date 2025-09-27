-- =====================================================
-- CBRC COIFFEUR BY RABIA CAYLI   - Clean Schema (Supabase)
-- =====================================================

-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Categories (e.g. Hair, Nails, etc.)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service groups (e.g. Haircut Damen, Haircut Herren)
CREATE TABLE public.service_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  gender_restriction TEXT NOT NULL CHECK (gender_restriction IN ('DAMEN', 'HERREN', 'BEIDE')),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services (variants per hair length)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.service_groups(id) ON DELETE CASCADE,
  hair_length TEXT CHECK (hair_length IN ('KURZ', 'MITTEL', 'LANG')),
  duration_minutes INTEGER NOT NULL,
  price_euros DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, hair_length)
);

-- Appointments (customer bookings)
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES public.services(id),
  gender TEXT NOT NULL CHECK (gender IN ('DAMEN', 'HERREN')),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_datetime TIMESTAMP GENERATED ALWAYS AS (
    (appointment_date + appointment_time)::timestamp
  ) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  special_requests TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Busy time slots (admin reserved times)
CREATE TABLE public.busy_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL DEFAULT 'Besetzt',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table for website configuration
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT NOT NULL DEFAULT 'Wir sind bald wieder da!',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.busy_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES
-- =====================================================

-- Categories / Service Groups / Services: Public read access
CREATE POLICY "Public can read categories" ON public.categories
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Public can read service groups" ON public.service_groups
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Public can read services" ON public.services
  FOR SELECT TO anon USING (is_active = true);

-- Staff (authenticated) can manage everything
CREATE POLICY "Staff manage categories" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Staff manage service groups" ON public.service_groups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Staff manage services" ON public.services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Appointments: locked down
-- Only staff can see/manage directly
CREATE POLICY "Staff manage appointments" ON public.appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Busy slots: staff only
CREATE POLICY "Staff manage busy slots" ON public.busy_slots
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Settings: staff only for management, public read for maintenance mode
CREATE POLICY "Staff manage settings" ON public.settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public can read settings for maintenance check" ON public.settings
  FOR SELECT TO anon USING (true);

-- No anon policies → frontend cannot insert/read appointments directly
-- Edge function with service_role inserts new appointments

-- =====================================================
-- FUNCTIONS + TRIGGERS
-- =====================================================

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_groups_updated_at
  BEFORE UPDATE ON public.service_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_busy_slots_updated_at
  BEFORE UPDATE ON public.busy_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- GRANTS
-- =====================================================

-- Allow usage of schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Authenticated: full access (staff/admin)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Service role: bypass policies (for edge functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Anon: read-only access to settings (for maintenance mode check)
GRANT SELECT ON public.settings TO anon;

-- Anon: only read categories/services
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.service_groups TO anon;
GRANT SELECT ON public.services TO anon;

-- =====================================================
-- READY
-- =====================================================