-- =====================================================
-- CALENDAR API INTEGRATION - Database Schema
-- =====================================================

-- Calendar tokens for secure access to calendar feeds
CREATE TABLE public.calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, -- User-friendly name for the token
  description TEXT,
  permissions TEXT[] NOT NULL DEFAULT ARRAY['appointments', 'busy_slots'], -- What this token can access
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID, -- Could reference a users table in the future
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar settings
CREATE TABLE public.calendar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES
-- =====================================================

-- Calendar tokens: staff only for management
CREATE POLICY "Staff manage calendar tokens" ON public.calendar_tokens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Calendar settings: staff only for management, public read for feed generation
CREATE POLICY "Staff manage calendar settings" ON public.calendar_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public can read calendar settings for feeds" ON public.calendar_settings
  FOR SELECT TO anon USING (true);

-- =====================================================
-- FUNCTIONS + TRIGGERS
-- =====================================================

-- Update updated_at automatically
CREATE TRIGGER update_calendar_tokens_updated_at
  BEFORE UPDATE ON public.calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_settings_updated_at
  BEFORE UPDATE ON public.calendar_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- GRANTS
-- =====================================================

-- Authenticated: full access (staff/admin)
GRANT ALL ON public.calendar_tokens TO authenticated;
GRANT ALL ON public.calendar_settings TO authenticated;

-- Service role: bypass policies (for edge functions)
GRANT ALL ON public.calendar_tokens TO service_role;
GRANT ALL ON public.calendar_settings TO service_role;

-- Anon: read-only access to settings (for calendar feed generation)
GRANT SELECT ON public.calendar_settings TO anon;

-- =====================================================
-- DEFAULT SETTINGS
-- =====================================================

-- Insert default calendar settings
INSERT INTO public.calendar_settings (setting_key, setting_value, description) VALUES
('calendar_name', 'CBRC Termine', 'Name of the calendar in external applications'),
('calendar_description', 'Coiffeur by Rabia Cayli - Termine und Zeitblöcke', 'Description of the calendar'),
('calendar_timezone', 'Europe/Vienna', 'Timezone for calendar events'),
('calendar_contact_email', '', 'Contact email for calendar issues'),
('calendar_contact_phone', '', 'Contact phone for calendar issues'),
('calendar_website', '', 'Website URL for calendar information'),
('calendar_location', '', 'Physical location of the business'),
('calendar_refresh_interval', '3600', 'Recommended refresh interval in seconds (1 hour)'),
('calendar_max_events', '1000', 'Maximum number of events to include in feed');

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to generate a secure calendar token
CREATE OR REPLACE FUNCTION public.generate_calendar_token(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_permissions TEXT[] DEFAULT ARRAY['appointments', 'busy_slots'],
  p_expires_days INTEGER DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_token TEXT;
  v_token_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Generate a secure random token (32 characters)
  v_token := encode(gen_random_bytes(24), 'base64url');
  
  -- Calculate expiration if provided
  IF p_expires_days IS NOT NULL THEN
    v_expires_at := NOW() + (p_expires_days || ' days')::INTERVAL;
  ELSE
    v_expires_at := NULL;
  END IF;
  
  -- Insert the token
  INSERT INTO public.calendar_tokens (
    token, name, description, permissions, expires_at
  ) VALUES (
    v_token, p_name, p_description, p_permissions, v_expires_at
  ) RETURNING id INTO v_token_id;
  
  -- Return success with token info (token only returned once)
  RETURN json_build_object(
    'success', TRUE,
    'token_id', v_token_id,
    'token', v_token, -- Only returned on creation
    'name', p_name,
    'permissions', p_permissions,
    'expires_at', v_expires_at,
    'message', 'Calendar token created successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate a calendar token
CREATE OR REPLACE FUNCTION public.validate_calendar_token(
  p_token TEXT
) RETURNS JSON AS $$
DECLARE
  v_token_record RECORD;
BEGIN
  -- Find the token
  SELECT * INTO v_token_record
  FROM public.calendar_tokens
  WHERE token = p_token AND is_active = TRUE
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid or inactive token');
  END IF;
  
  -- Check expiration
  IF v_token_record.expires_at IS NOT NULL AND v_token_record.expires_at < NOW() THEN
    RETURN json_build_object('success', FALSE, 'error', 'Token has expired');
  END IF;
  
  -- Update last used timestamp
  UPDATE public.calendar_tokens
  SET last_used_at = NOW()
  WHERE id = v_token_record.id;
  
  -- Return token info
  RETURN json_build_object(
    'success', TRUE,
    'token_id', v_token_record.id,
    'name', v_token_record.name,
    'permissions', v_token_record.permissions,
    'expires_at', v_token_record.expires_at
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS FOR FUNCTIONS
-- =====================================================

-- Staff can generate and validate tokens
GRANT EXECUTE ON FUNCTION public.generate_calendar_token TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_calendar_token TO authenticated;

-- Service role can also use these functions
GRANT EXECUTE ON FUNCTION public.generate_calendar_token TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_calendar_token TO service_role;

-- =====================================================
-- READY
-- =====================================================
