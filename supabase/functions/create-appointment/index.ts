import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse request body
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      service_id, 
      gender, 
      appointment_date, 
      appointment_time, 
      special_requests 
    } = await req.json()

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !service_id || !gender || !appointment_date || !appointment_time) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
          appointment_id: null
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Call the database function to create appointment
    const { data, error } = await supabaseClient.rpc('create_appointment', {
      p_first_name: first_name.trim(),
      p_last_name: last_name.trim(),
      p_email: email.trim(),
      p_phone: phone.trim(),
      p_service_id: service_id,
      p_gender: gender,
      p_appointment_date: appointment_date,
      p_appointment_time: appointment_time,
      p_special_requests: special_requests || null
    })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database error: ' + error.message,
          appointment_id: null
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the result from the database function
    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        appointment_id: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
