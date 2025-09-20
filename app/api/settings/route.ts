import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabase/client';

// GET - Fetch settings
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .single();

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          settings: {
            maintenance_mode: false,
            maintenance_message: "Wir sind bald wieder da!",
            updated_at: new Date().toISOString()
          }
        });
      }
      throw error;
    }

    return NextResponse.json({ settings: data });
    
  } catch (error) {
    console.error('API: Error fetching settings:', error);
    return NextResponse.json(
      { error: `Failed to fetch settings: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const settingsData = await request.json();
    
    console.log('API: Updating settings with data:', settingsData);
    
    // Validate required fields
    if (typeof settingsData.maintenance_mode !== 'boolean') {
      return NextResponse.json(
        { error: 'maintenance_mode must be a boolean' },
        { status: 400 }
      );
    }

    if (!settingsData.maintenance_message || typeof settingsData.maintenance_message !== 'string') {
      return NextResponse.json(
        { error: 'maintenance_message is required and must be a string' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      maintenance_mode: settingsData.maintenance_mode,
      maintenance_message: settingsData.maintenance_message.trim(),
      updated_at: new Date().toISOString()
    };
    
    // Try to update existing settings first
    const { data: existingSettings, error: selectError } = await supabaseAdmin
      .from('settings')
      .select('id')
      .single();

    let result;
    if (selectError && selectError.code === 'PGRST116') {
      // No settings exist, create new one
      const { data, error } = await supabaseAdmin
        .from('settings')
        .insert([updateData])
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else if (selectError) {
      throw selectError;
    } else {
      // Settings exist, update them
      const { data, error } = await supabaseAdmin
        .from('settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }
    
    console.log('API: Settings updated successfully:', result);
    return NextResponse.json({ success: true, settings: result });
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
