-- =====================================================
-- SAFE DATABASE MIGRATION SCRIPT
-- This script adds new features without losing existing data
-- =====================================================

-- Enable UUIDs (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. UPDATE BUSY_SLOTS TABLE (Add end_date column)
-- =====================================================

-- Add end_date column to existing busy_slots table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'busy_slots' 
        AND column_name = 'end_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.busy_slots 
        ADD COLUMN end_date DATE;
        
        -- Add constraint for valid date range
        ALTER TABLE public.busy_slots 
        ADD CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= busy_date);
        
        RAISE NOTICE 'Added end_date column to busy_slots table';
    ELSE
        RAISE NOTICE 'end_date column already exists in busy_slots table';
    END IF;
END $$;

-- =====================================================
-- 2. CREATE SETTINGS TABLE (Only if it doesn't exist)
-- =====================================================

-- Create settings table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT NOT NULL DEFAULT 'Wir sind bald wieder da!',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (Only if not already enabled)
-- =====================================================

-- Enable RLS on settings table (safe to run multiple times)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE POLICIES (Only if they don't exist)
-- =====================================================

-- Settings policies
DO $$
BEGIN
    -- Staff manage settings policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'settings' 
        AND policyname = 'Staff manage settings'
    ) THEN
        CREATE POLICY "Staff manage settings" ON public.settings
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
        RAISE NOTICE 'Created Staff manage settings policy';
    ELSE
        RAISE NOTICE 'Staff manage settings policy already exists';
    END IF;

    -- Public read settings policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'settings' 
        AND policyname = 'Public can read settings for maintenance check'
    ) THEN
        CREATE POLICY "Public can read settings for maintenance check" ON public.settings
        FOR SELECT TO anon USING (true);
        RAISE NOTICE 'Created Public can read settings policy';
    ELSE
        RAISE NOTICE 'Public can read settings policy already exists';
    END IF;
END $$;

-- =====================================================
-- 5. CREATE TRIGGERS (Only if they don't exist)
-- =====================================================

-- Update trigger for settings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_settings_updated_at'
        AND event_object_table = 'settings'
    ) THEN
        CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON public.settings
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        RAISE NOTICE 'Created update_settings_updated_at trigger';
    ELSE
        RAISE NOTICE 'update_settings_updated_at trigger already exists';
    END IF;
END $$;

-- =====================================================
-- 6. GRANT PERMISSIONS (Safe to run multiple times)
-- =====================================================

-- Grant permissions for settings table
GRANT ALL ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
GRANT SELECT ON public.settings TO anon;

-- =====================================================
-- 7. INSERT DEFAULT SETTINGS (Only if no settings exist)
-- =====================================================

-- Insert default settings if none exist
INSERT INTO public.settings (maintenance_mode, maintenance_message)
SELECT false, 'Wir sind bald wieder da!'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Verify the migration was successful
DO $$
BEGIN
    -- Check if end_date column exists in busy_slots
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'busy_slots' 
        AND column_name = 'end_date'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✓ end_date column added to busy_slots table';
    ELSE
        RAISE NOTICE '✗ end_date column missing from busy_slots table';
    END IF;

    -- Check if settings table exists and has data
    IF EXISTS (SELECT 1 FROM public.settings) THEN
        RAISE NOTICE '✓ Settings table created and has data';
    ELSE
        RAISE NOTICE '✗ Settings table missing or empty';
    END IF;

    -- Check if policies exist
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'settings'
    ) THEN
        RAISE NOTICE '✓ Settings policies created';
    ELSE
        RAISE NOTICE '✗ Settings policies missing';
    END IF;

    RAISE NOTICE 'Migration completed successfully!';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================