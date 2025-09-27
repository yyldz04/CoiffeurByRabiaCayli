-- =====================================================
-- COIFFEUR BY RABIA CAYLI   - Public Booking Function
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

-- =====================================================
-- TIME SLOTS FUNCTION
-- =====================================================

-- Function to get available time slots for a specific date and service duration
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT 60
) RETURNS JSON AS $$
DECLARE
  v_business_start INTEGER := 9; -- 9 AM
  v_business_end INTEGER := 19;  -- 7 PM
  v_slot_interval INTEGER := 15; -- 15-minute intervals for more flexibility
  v_current_hour INTEGER;
  v_current_minute INTEGER;
  v_end_hour INTEGER;
  v_end_minute INTEGER;
  v_time_str TEXT;
  v_end_time_str TEXT;
  v_available BOOLEAN;
  v_reason TEXT;
  v_slots JSON[] := '{}';
  v_current_time TIME;
  v_appointment_end_time TIME;
  v_next_start_time TIME;
  v_slot_start_datetime TIMESTAMPTZ;
  v_slot_end_datetime TIMESTAMPTZ;
BEGIN
  -- Basic validation
  IF p_date IS NULL OR p_duration_minutes IS NULL OR p_duration_minutes <= 0 THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid parameters');
  END IF;

  -- Date sanity check
  IF p_date < CURRENT_DATE THEN
    RETURN json_build_object('success', FALSE, 'error', 'Date is in the past');
  END IF;

  IF p_date > CURRENT_DATE + INTERVAL '6 months' THEN
    RETURN json_build_object('success', FALSE, 'error', 'Date too far in the future');
  END IF;

  -- Get current time for today's date
  IF p_date = CURRENT_DATE THEN
    v_current_time := CURRENT_TIME;
  ELSE
    v_current_time := '00:00'::TIME;
  END IF;

  -- Generate time slots with 15-minute intervals for maximum flexibility
  v_current_hour := v_business_start;
  v_current_minute := 0;

  WHILE v_current_hour < v_business_end LOOP
    -- Format current time
    v_time_str := lpad(v_current_hour::TEXT, 2, '0') || ':' || lpad(v_current_minute::TEXT, 2, '0');
    
    -- Skip if this time is in the past (for today)
    IF v_time_str::TIME >= v_current_time THEN
      -- Calculate end time for this slot
      v_end_minute := v_current_minute + p_duration_minutes;
      v_end_hour := v_current_hour + floor(v_end_minute / 60);
      v_end_minute := v_end_minute % 60;
      v_end_time_str := lpad(v_end_hour::TEXT, 2, '0') || ':' || lpad(v_end_minute::TEXT, 2, '0');
      
      -- Check if slot fits within business hours
      IF v_end_hour < v_business_end OR (v_end_hour = v_business_end AND v_end_minute = 0) THEN
        v_available := TRUE;
        v_reason := NULL;
        
        -- Check for conflicts with appointments
        -- Find any appointment that overlaps with this time slot
        SELECT 
          (a.appointment_time::TIME + INTERVAL '1 minute' * s.duration_minutes)::TIME
        INTO v_appointment_end_time
        FROM public.appointments a
        JOIN public.services s ON a.service_id = s.id
        WHERE a.appointment_date = p_date
          AND a.status IN ('pending', 'confirmed')
          AND a.appointment_time::TIME < v_end_time_str::TIME
          AND (a.appointment_time::TIME + INTERVAL '1 minute' * s.duration_minutes)::TIME > v_time_str::TIME
        ORDER BY a.appointment_time
        LIMIT 1;
        
        IF FOUND THEN
          v_available := FALSE;
          v_reason := 'Termin bereits gebucht';
        END IF;
        
        -- Check for conflicts with busy slots (Updated for TIMESTAMP schema)
        IF v_available THEN
          -- Convert time slot to TIMESTAMPTZ for comparison (Austria timezone: UTC+1)
          v_slot_start_datetime := (p_date + v_time_str::TIME) AT TIME ZONE 'Europe/Vienna';
          v_slot_end_datetime := (p_date + v_end_time_str::TIME) AT TIME ZONE 'Europe/Vienna';
          
          -- MUCH SIMPLER: Direct TIMESTAMPTZ comparison
          -- No more complex date + time arithmetic!
          PERFORM 1
          FROM public.busy_slots
          WHERE start_datetime < v_slot_end_datetime 
            AND end_datetime > v_slot_start_datetime;
          
          IF FOUND THEN
            v_available := FALSE;
            v_reason := 'Zeitblock reserviert';
          END IF;
        END IF;
        
        -- Additional check: ensure there's enough time before the next appointment
        IF v_available THEN
          -- Find the next appointment that starts after this slot
          SELECT MIN(a.appointment_time::TIME)
          INTO v_next_start_time
          FROM public.appointments a
          WHERE a.appointment_date = p_date
            AND a.status IN ('pending', 'confirmed')
            AND a.appointment_time::TIME >= v_end_time_str::TIME;
          
          -- If there's not enough gap, mark as unavailable
          IF v_next_start_time IS NOT NULL AND v_next_start_time < v_end_time_str::TIME + INTERVAL '5 minutes' THEN
            v_available := FALSE;
            v_reason := 'Nicht genügend Zeit zwischen Terminen';
          END IF;
        END IF;
        
        -- Add slot to array
        v_slots := array_append(v_slots, json_build_object(
          'time', v_time_str,
          'available', v_available,
          'reason', v_reason
        ));
      END IF;
    END IF;
    
    -- Move to next slot (15-minute intervals)
    v_current_minute := v_current_minute + v_slot_interval;
    IF v_current_minute >= 60 THEN
      v_current_minute := 0;
      v_current_hour := v_current_hour + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'success', TRUE,
    'timeSlots', array_to_json(v_slots),
    'date', p_date,
    'duration', p_duration_minutes
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CALDAV EDGE FUNCTION SCHEMA
-- =====================================================

-- Function to validate calendar token for CalDAV access
CREATE OR REPLACE FUNCTION public.validate_calendar_token_for_caldav(
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

-- Function to get appointments for CalDAV calendar
CREATE OR REPLACE FUNCTION public.get_appointments_for_caldav(
  p_token_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_max_events INTEGER DEFAULT 1000
) RETURNS JSON AS $$
DECLARE
  v_token_permissions TEXT[];
  v_appointments JSON;
BEGIN
  -- Get token permissions
  SELECT permissions INTO v_token_permissions
  FROM public.calendar_tokens
  WHERE id = p_token_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid token');
  END IF;
  
  -- Check if token has appointments permission
  IF NOT ('appointments' = ANY(v_token_permissions)) THEN
    RETURN json_build_object('success', FALSE, 'error', 'Token does not have appointments permission');
  END IF;
  
  -- Build query
  SELECT json_agg(
    json_build_object(
      'id', a.id,
      'first_name', a.first_name,
      'last_name', a.last_name,
      'email', a.email,
      'phone', a.phone,
      'appointment_date', a.appointment_date,
      'appointment_time', a.appointment_time,
      'appointment_datetime', a.appointment_datetime,
      'status', a.status,
      'special_requests', a.special_requests,
      'created_at', a.created_at,
      'updated_at', a.updated_at,
      'service', CASE 
        WHEN s.id IS NOT NULL THEN json_build_object(
          'duration_minutes', s.duration_minutes,
          'price_euros', s.price_euros,
          'hair_length', s.hair_length,
          'service_group', json_build_object(
            'title', sg.title,
            'description', sg.description
          )
        )
        ELSE NULL
      END
    )
  ) INTO v_appointments
  FROM public.appointments a
  LEFT JOIN public.services s ON a.service_id = s.id
  LEFT JOIN public.service_groups sg ON s.group_id = sg.id
  WHERE (p_start_date IS NULL OR a.appointment_date >= p_start_date)
    AND (p_end_date IS NULL OR a.appointment_date <= p_end_date)
  ORDER BY a.appointment_datetime
  LIMIT p_max_events;
  
  RETURN json_build_object(
    'success', TRUE,
    'appointments', COALESCE(v_appointments, '[]'::json)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get busy slots for CalDAV calendar
CREATE OR REPLACE FUNCTION public.get_busy_slots_for_caldav(
  p_token_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_max_events INTEGER DEFAULT 1000
) RETURNS JSON AS $$
DECLARE
  v_token_permissions TEXT[];
  v_busy_slots JSON;
BEGIN
  -- Get token permissions
  SELECT permissions INTO v_token_permissions
  FROM public.calendar_tokens
  WHERE id = p_token_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid token');
  END IF;
  
  -- Check if token has busy_slots permission
  IF NOT ('busy_slots' = ANY(v_token_permissions)) THEN
    RETURN json_build_object('success', FALSE, 'error', 'Token does not have busy_slots permission');
  END IF;
  
  -- Build query
  SELECT json_agg(
    json_build_object(
      'id', bs.id,
      'start_datetime', bs.start_datetime,
      'end_datetime', bs.end_datetime,
      'title', bs.title,
      'description', bs.description,
      'created_at', bs.created_at,
      'updated_at', bs.updated_at
    )
  ) INTO v_busy_slots
  FROM public.busy_slots bs
  WHERE (p_start_date IS NULL OR bs.start_datetime::date >= p_start_date)
    AND (p_end_date IS NULL OR bs.end_datetime::date <= p_end_date)
  ORDER BY bs.start_datetime
  LIMIT p_max_events;
  
  RETURN json_build_object(
    'success', TRUE,
    'busy_slots', COALESCE(v_busy_slots, '[]'::json)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get single appointment for CalDAV
CREATE OR REPLACE FUNCTION public.get_appointment_for_caldav(
  p_token_id UUID,
  p_appointment_id UUID
) RETURNS JSON AS $$
DECLARE
  v_token_permissions TEXT[];
  v_appointment JSON;
BEGIN
  -- Get token permissions
  SELECT permissions INTO v_token_permissions
  FROM public.calendar_tokens
  WHERE id = p_token_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid token');
  END IF;
  
  -- Check if token has appointments permission
  IF NOT ('appointments' = ANY(v_token_permissions)) THEN
    RETURN json_build_object('success', FALSE, 'error', 'Token does not have appointments permission');
  END IF;
  
  -- Get appointment
  SELECT json_build_object(
    'id', a.id,
    'first_name', a.first_name,
    'last_name', a.last_name,
    'email', a.email,
    'phone', a.phone,
    'appointment_date', a.appointment_date,
    'appointment_time', a.appointment_time,
    'appointment_datetime', a.appointment_datetime,
    'status', a.status,
    'special_requests', a.special_requests,
    'created_at', a.created_at,
    'updated_at', a.updated_at,
    'service', CASE 
      WHEN s.id IS NOT NULL THEN json_build_object(
        'duration_minutes', s.duration_minutes,
        'price_euros', s.price_euros,
        'hair_length', s.hair_length,
        'service_group', json_build_object(
          'title', sg.title,
          'description', sg.description
        )
      )
      ELSE NULL
    END
  ) INTO v_appointment
  FROM public.appointments a
  LEFT JOIN public.services s ON a.service_id = s.id
  LEFT JOIN public.service_groups sg ON s.group_id = sg.id
  WHERE a.id = p_appointment_id;
  
  IF v_appointment IS NULL THEN
    RETURN json_build_object('success', FALSE, 'error', 'Appointment not found');
  END IF;
  
  RETURN json_build_object(
    'success', TRUE,
    'appointment', v_appointment
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get single busy slot for CalDAV
CREATE OR REPLACE FUNCTION public.get_busy_slot_for_caldav(
  p_token_id UUID,
  p_busy_slot_id UUID
) RETURNS JSON AS $$
DECLARE
  v_token_permissions TEXT[];
  v_busy_slot JSON;
BEGIN
  -- Get token permissions
  SELECT permissions INTO v_token_permissions
  FROM public.calendar_tokens
  WHERE id = p_token_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid token');
  END IF;
  
  -- Check if token has busy_slots permission
  IF NOT ('busy_slots' = ANY(v_token_permissions)) THEN
    RETURN json_build_object('success', FALSE, 'error', 'Token does not have busy_slots permission');
  END IF;
  
  -- Get busy slot
  SELECT json_build_object(
    'id', bs.id,
    'start_datetime', bs.start_datetime,
    'end_datetime', bs.end_datetime,
    'title', bs.title,
    'description', bs.description,
    'created_at', bs.created_at,
    'updated_at', bs.updated_at
  ) INTO v_busy_slot
  FROM public.busy_slots bs
  WHERE bs.id = p_busy_slot_id;
  
  IF v_busy_slot IS NULL THEN
    RETURN json_build_object('success', FALSE, 'error', 'Busy slot not found');
  END IF;
  
  RETURN json_build_object(
    'success', TRUE,
    'busy_slot', v_busy_slot
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create/update appointment from CalDAV
CREATE OR REPLACE FUNCTION public.upsert_appointment_from_caldav(
  p_token_id UUID,
  p_appointment_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_appointment_datetime TIMESTAMPTZ,
  p_status TEXT DEFAULT 'pending',
  p_special_requests TEXT DEFAULT NULL,
  p_service_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_token_permissions TEXT[];
  v_appointment_id UUID;
  v_existing_appointment UUID;
BEGIN
  -- Get token permissions
  SELECT permissions INTO v_token_permissions
  FROM public.calendar_tokens
  WHERE id = p_token_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid token');
  END IF;
  
  -- Check if token has appointments permission
  IF NOT ('appointments' = ANY(v_token_permissions)) THEN
    RETURN json_build_object('success', FALSE, 'error', 'Token does not have appointments permission');
  END IF;
  
  -- Check if appointment exists
  SELECT id INTO v_existing_appointment
  FROM public.appointments
  WHERE id = p_appointment_id;
  
  IF v_existing_appointment IS NOT NULL THEN
    -- Update existing appointment
    UPDATE public.appointments
    SET first_name = p_first_name,
        last_name = p_last_name,
        email = p_email,
        phone = p_phone,
        appointment_date = p_appointment_date,
        appointment_time = p_appointment_time,
        appointment_datetime = p_appointment_datetime,
        status = p_status,
        special_requests = p_special_requests,
        service_id = COALESCE(p_service_id, service_id),
        updated_at = NOW()
    WHERE id = p_appointment_id;
    
    v_appointment_id := p_appointment_id;
  ELSE
    -- Create new appointment
    INSERT INTO public.appointments (
      id,
      first_name,
      last_name,
      email,
      phone,
      appointment_date,
      appointment_time,
      appointment_datetime,
      status,
      special_requests,
      service_id
    ) VALUES (
      p_appointment_id,
      p_first_name,
      p_last_name,
      p_email,
      p_phone,
      p_appointment_date,
      p_appointment_time,
      p_appointment_datetime,
      p_status,
      p_special_requests,
      COALESCE(p_service_id, (SELECT id FROM public.services LIMIT 1)) -- Default to first service if none specified
    )
    RETURNING id INTO v_appointment_id;
  END IF;
  
  RETURN json_build_object(
    'success', TRUE,
    'appointment_id', v_appointment_id,
    'message', CASE WHEN v_existing_appointment IS NOT NULL THEN 'Updated' ELSE 'Created' END
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete appointment from CalDAV
CREATE OR REPLACE FUNCTION public.delete_appointment_from_caldav(
  p_token_id UUID,
  p_appointment_id UUID
) RETURNS JSON AS $$
DECLARE
  v_token_permissions TEXT[];
  v_appointment_exists BOOLEAN;
BEGIN
  -- Get token permissions
  SELECT permissions INTO v_token_permissions
  FROM public.calendar_tokens
  WHERE id = p_token_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid token');
  END IF;
  
  -- Check if token has appointments permission
  IF NOT ('appointments' = ANY(v_token_permissions)) THEN
    RETURN json_build_object('success', FALSE, 'error', 'Token does not have appointments permission');
  END IF;
  
  -- Check if appointment exists
  SELECT EXISTS(SELECT 1 FROM public.appointments WHERE id = p_appointment_id) INTO v_appointment_exists;
  
  IF NOT v_appointment_exists THEN
    RETURN json_build_object('success', FALSE, 'error', 'Appointment not found');
  END IF;
  
  -- Delete appointment
  DELETE FROM public.appointments
  WHERE id = p_appointment_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Appointment deleted'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete busy slot from CalDAV
CREATE OR REPLACE FUNCTION public.delete_busy_slot_from_caldav(
  p_token_id UUID,
  p_busy_slot_id UUID
) RETURNS JSON AS $$
DECLARE
  v_token_permissions TEXT[];
  v_busy_slot_exists BOOLEAN;
BEGIN
  -- Get token permissions
  SELECT permissions INTO v_token_permissions
  FROM public.calendar_tokens
  WHERE id = p_token_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid token');
  END IF;
  
  -- Check if token has busy_slots permission
  IF NOT ('busy_slots' = ANY(v_token_permissions)) THEN
    RETURN json_build_object('success', FALSE, 'error', 'Token does not have busy_slots permission');
  END IF;
  
  -- Check if busy slot exists
  SELECT EXISTS(SELECT 1 FROM public.busy_slots WHERE id = p_busy_slot_id) INTO v_busy_slot_exists;
  
  IF NOT v_busy_slot_exists THEN
    RETURN json_build_object('success', FALSE, 'error', 'Busy slot not found');
  END IF;
  
  -- Delete busy slot
  DELETE FROM public.busy_slots
  WHERE id = p_busy_slot_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Busy slot deleted'
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
GRANT EXECUTE ON FUNCTION public.get_available_time_slots TO anon;

-- Grant execute permissions for CalDAV functions
GRANT EXECUTE ON FUNCTION public.validate_calendar_token_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.get_appointments_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.get_busy_slots_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.get_appointment_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.get_busy_slot_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_appointment_from_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_appointment_from_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_busy_slot_from_caldav TO service_role;
