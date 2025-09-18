-- =====================================================
-- Salon Booking System - Public Booking Function
-- =====================================================

-- Main function: public can call this without auth
CREATE OR REPLACE FUNCTION public.create_appointment(
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_service_id UUID,
  p_gender TEXT,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_special_requests TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_appointment_id UUID;
  v_service_exists BOOLEAN;
  v_conflict BOOLEAN;
BEGIN
  -- Basic validation
  IF p_first_name IS NULL OR trim(p_first_name) = '' OR
     p_last_name IS NULL OR trim(p_last_name) = '' OR
     p_email IS NULL OR trim(p_email) = '' OR
     p_phone IS NULL OR trim(p_phone) = '' OR
     p_service_id IS NULL OR
     p_gender NOT IN ('DAMEN','HERREN') OR
     p_appointment_date IS NULL OR
     p_appointment_time IS NULL THEN
    RETURN json_build_object('success', FALSE, 'error', 'Missing or invalid required fields');
  END IF;

  -- Email format
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid email format');
  END IF;

  -- Date sanity
  IF p_appointment_date < CURRENT_DATE THEN
    RETURN json_build_object('success', FALSE, 'error', 'Date is in the past');
  END IF;

  IF p_appointment_date > CURRENT_DATE + INTERVAL '6 months' THEN
    RETURN json_build_object('success', FALSE, 'error', 'Date too far in the future');
  END IF;

  -- Check service validity
  SELECT TRUE INTO v_service_exists
  FROM public.services s
  JOIN public.service_groups sg ON s.group_id = sg.id
  WHERE s.id = p_service_id AND s.is_active = TRUE AND sg.is_active = TRUE
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Service not available');
  END IF;

  -- Conflict check (confirmed appointments only)
  SELECT TRUE INTO v_conflict
  FROM public.appointments
  WHERE appointment_date = p_appointment_date
    AND appointment_time = p_appointment_time
    AND status = 'confirmed'
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Time slot already booked');
  END IF;

  -- Insert appointment
  INSERT INTO public.appointments (
    first_name, last_name, email, phone, service_id,
    gender, appointment_date, appointment_time, special_requests, status
  ) VALUES (
    trim(p_first_name), trim(p_last_name), trim(p_email), trim(p_phone), p_service_id,
    p_gender, p_appointment_date, p_appointment_time, p_special_requests, 'pending'
  ) RETURNING id INTO v_appointment_id;

  -- Success response (future-proof for filtering)
  RETURN json_build_object(
    'success', TRUE,
    'appointment', json_build_object(
      'id', v_appointment_id,
      'status', 'pending',
      'first_name', p_first_name,
      'last_name', p_last_name,
      'appointment_date', p_appointment_date,
      'appointment_time', p_appointment_time
    ),
    'message', 'Appointment created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- =====================================================

-- Public can call this function directly
GRANT EXECUTE ON FUNCTION public.create_appointment TO anon;

-- Prevent anon from inserting directly into appointments
REVOKE INSERT ON public.appointments FROM anon;
