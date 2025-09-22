import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../utils/supabase/client';

// GET - Public endpoint to check maintenance mode (no auth required)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('maintenance_mode, maintenance_message')
      .single();

    if (error) {
      // If no settings exist, return defaults (no maintenance mode)
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          maintenance_mode: false,
          maintenance_message: "Wir sind bald wieder da!"
        });
      }
      throw error;
    }

    return NextResponse.json({
      maintenance_mode: data.maintenance_mode || false,
      maintenance_message: data.maintenance_message || "Wir sind bald wieder da!"
    });
    
  } catch (error) {
    console.error('API: Error fetching public settings:', error);
    // On error, default to no maintenance mode
    return NextResponse.json({
      maintenance_mode: false,
      maintenance_message: "Wir sind bald wieder da!"
    });
  }
}
