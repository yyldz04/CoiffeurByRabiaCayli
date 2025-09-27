import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../utils/supabase/client';

// GET: Get calendar settings
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('calendar_settings')
      .select('setting_key, setting_value, description')
      .order('setting_key');

    if (error) {
      console.error('Error fetching calendar settings:', error);
      return NextResponse.json(
        { error: `Failed to fetch settings: ${error.message}` },
        { status: 500 }
      );
    }

    // Convert array to object for easier use
    const settings: Record<string, { value: string; description: string }> = {};
    data.forEach((item: { setting_key: string; setting_value: string; description: string }) => {
      settings[item.setting_key] = {
        value: item.setting_value,
        description: item.description || ''
      };
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update calendar settings
export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings must be an object' },
        { status: 400 }
      );
    }

    // Validate and update each setting
    const updates = [];
    const validSettings = [
      'calendar_name',
      'calendar_description', 
      'calendar_timezone',
      'calendar_contact_email',
      'calendar_contact_phone',
      'calendar_website',
      'calendar_location',
      'calendar_refresh_interval',
      'calendar_max_events'
    ];

    for (const [key, value] of Object.entries(settings)) {
      if (!validSettings.includes(key)) {
        continue; // Skip invalid settings
      }

      if (typeof value !== 'string') {
        return NextResponse.json(
          { error: `Setting ${key} must be a string` },
          { status: 400 }
        );
      }

      // Validate specific settings
      if (key === 'calendar_refresh_interval' || key === 'calendar_max_events') {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1) {
          return NextResponse.json(
            { error: `Setting ${key} must be a positive number` },
            { status: 400 }
          );
        }
      }

      if (key === 'calendar_contact_email' && value && !value.includes('@')) {
        return NextResponse.json(
          { error: 'Contact email must be a valid email address' },
          { status: 400 }
        );
      }

      updates.push({
        setting_key: key,
        setting_value: value.trim()
      });
    }

    // Update settings using upsert
    const { data, error } = await supabaseAdmin
      .from('calendar_settings')
      .upsert(updates, {
        onConflict: 'setting_key',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Error updating calendar settings:', error);
      return NextResponse.json(
        { error: `Failed to update settings: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated_settings: data,
      message: 'Calendar settings updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
