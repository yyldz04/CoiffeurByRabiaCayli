import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();
    
    console.log('API: Proxying appointment creation to edge function:', appointmentData);
    
    // Get Supabase URL and service role key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('API: Missing Supabase configuration');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error',
          appointment_id: null 
        },
        { status: 500 }
      );
    }
    
    // Call the Supabase Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-appointment`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(appointmentData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('API: Edge function error:', result);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Edge function error',
          appointment_id: null 
        },
        { status: response.status }
      );
    }
    
    console.log('API: Appointment created successfully via edge function:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        appointment_id: null 
      },
      { status: 500 }
    );
  }
}
