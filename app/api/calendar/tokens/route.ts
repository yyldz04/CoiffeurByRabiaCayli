import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../utils/supabase/client';

// GET: List all calendar tokens
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('calendar_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching calendar tokens:', error);
      return NextResponse.json(
        { error: `Failed to fetch tokens: ${error.message}` },
        { status: 500 }
      );
    }

    // Remove token values from response for security
    const sanitizedData = data.map(token => ({
      id: token.id,
      name: token.name,
      description: token.description,
      permissions: token.permissions,
      expires_at: token.expires_at,
      last_used_at: token.last_used_at,
      is_active: token.is_active,
      created_at: token.created_at,
      updated_at: token.updated_at,
    }));

    return NextResponse.json({ tokens: sanitizedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Generate new calendar token
export async function POST(request: NextRequest) {
  try {
    const { name, description, permissions, expires_days } = await request.json();

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Token name is required' },
        { status: 400 }
      );
    }

    // Validate permissions
    const validPermissions = ['appointments', 'busy_slots'];
    const tokenPermissions = permissions || ['appointments', 'busy_slots'];
    
    if (!Array.isArray(tokenPermissions) || 
        !tokenPermissions.every(p => validPermissions.includes(p))) {
      return NextResponse.json(
        { error: 'Invalid permissions. Must be array of: appointments, busy_slots' },
        { status: 400 }
      );
    }

    // Validate expiration days
    let expiresDays: number | null = null;
    if (expires_days !== undefined) {
      if (typeof expires_days !== 'number' || expires_days < 1) {
        return NextResponse.json(
          { error: 'Expiration days must be a positive number' },
          { status: 400 }
        );
      }
      expiresDays = expires_days;
    }

    // Generate token using database function
    const { data, error } = await supabaseAdmin.rpc('generate_calendar_token', {
      p_name: name.trim(),
      p_description: description?.trim() || null,
      p_permissions: tokenPermissions,
      p_expires_days: expiresDays
    });

    if (error) {
      console.error('Token generation error:', error);
      return NextResponse.json(
        { error: `Failed to generate token: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || 'Token generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token: data,
      message: 'Calendar token generated successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
