import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TimeSlotRequest {
  date: string;
  duration: number; // in minutes
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error - Supabase not configured' },
        { status: 500 }
      );
    }

    const { date, duration }: TimeSlotRequest = await request.json();

    if (!date || !duration) {
      return NextResponse.json(
        { error: 'Date and duration are required' },
        { status: 400 }
      );
    }

    // Call the edge function to get available time slots
    const { data, error } = await supabase.rpc('get_available_time_slots', {
      p_date: date,
      p_duration_minutes: duration
    });

    if (error) {
      console.error('Error calling get_available_time_slots:', error);
      return NextResponse.json(
        { error: 'Failed to fetch time slots' },
        { status: 500 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch time slots' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      timeSlots: data.timeSlots,
      date: data.date,
      duration: data.duration
    });

  } catch (error) {
    console.error('Error in time-slots API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
