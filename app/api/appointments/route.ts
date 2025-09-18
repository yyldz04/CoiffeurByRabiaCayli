import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();
    
    console.log('API: Creating appointment with data:', appointmentData);
    
    const insertData = {
      first_name: appointmentData.firstName,
      last_name: appointmentData.lastName,
      email: appointmentData.email,
      phone: appointmentData.phone,
      service_id: appointmentData.service,
      gender: appointmentData.gender,
      appointment_date: appointmentData.date,
      appointment_time: appointmentData.time,
      special_requests: appointmentData.requests,
      status: 'pending'
    };
    
    console.log('API: Insert data:', insertData);
    
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('API: Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }
    
    console.log('API: Appointment created successfully:', data);
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { appointmentId, status } = await request.json();
    
    console.log('API: Updating appointment status:', { appointmentId, status });
    
    const updateData: { status: string; confirmed_at?: string; cancelled_at?: string; completed_at?: string } = { status };
    
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    }
    
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('API: Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }
    
    console.log('API: Appointment status updated successfully:', data);
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    
    if (date && time) {
      // Check for conflicts
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .select('id')
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .eq('status', 'confirmed');

      if (error) {
        console.error('API: Error checking conflicts:', error);
        return NextResponse.json(
          { error: `Conflict check failed: ${error.message || JSON.stringify(error)}` },
          { status: 500 }
        );
      }
      
      const hasConflict = data && data.length > 0;
      return NextResponse.json({ hasConflict });
    }
    
    // Get all appointments with service details
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        service:services!appointments_service_id_fkey (
          duration_minutes,
          price_euros,
          hair_length,
          service_group:service_groups!services_group_id_fkey (
            title,
            description,
            category:categories!service_groups_category_id_fkey (
              name
            )
          )
        )
      `)
      .order('appointment_datetime', { ascending: true });

    if (error) {
      console.error('API: Error fetching appointments:', error);
      return NextResponse.json(
        { error: `Failed to fetch appointments: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ appointments: data });
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
