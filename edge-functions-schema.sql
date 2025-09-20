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
  v_busy_end_time TIME;
  v_next_start_time TIME;
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
        
        -- Check for conflicts with busy slots (including date ranges)
        IF v_available THEN
          SELECT end_time
          INTO v_busy_end_time
          FROM public.busy_slots
          WHERE (
            (busy_date = p_date) OR 
            (busy_date <= p_date AND (end_date IS NULL OR end_date >= p_date))
          )
            AND start_time < v_end_time_str::TIME
            AND end_time > v_time_str::TIME
          ORDER BY start_time
          LIMIT 1;
          
          IF FOUND THEN
            v_available := FALSE;
            v_reason := 'Zeitblock reserviert';
          END IF;
        END IF;
        
        -- Additional check: ensure there's enough time before the next appointment/busy slot
        IF v_available THEN
          -- Find the next appointment or busy slot that starts after this slot
          SELECT LEAST(
            COALESCE(
              (SELECT MIN(a.appointment_time::TIME)
               FROM public.appointments a
               WHERE a.appointment_date = p_date
                 AND a.status IN ('pending', 'confirmed')
                 AND a.appointment_time::TIME >= v_end_time_str::TIME),
              '23:59'::TIME
            ),
            COALESCE(
              (SELECT MIN(start_time)
               FROM public.busy_slots
               WHERE (
                 (busy_date = p_date) OR 
                 (busy_date <= p_date AND (end_date IS NULL OR end_date >= p_date))
               )
                 AND start_time >= v_end_time_str::TIME),
              '23:59'::TIME
            )
          ) INTO v_next_start_time;
          
          -- If there's not enough gap, mark as unavailable
          IF v_next_start_time < v_end_time_str::TIME + INTERVAL '5 minutes' THEN
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
-- GRANTS
-- =====================================================

-- Public can call this function directly
GRANT EXECUTE ON FUNCTION public.get_available_time_slots TO anon;
