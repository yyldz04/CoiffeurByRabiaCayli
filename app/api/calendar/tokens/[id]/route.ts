import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../utils/supabase/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// DELETE: Revoke/delete a calendar token
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    // Check if token exists
    const { data: existingToken, error: fetchError } = await supabaseAdmin
      .from('calendar_tokens')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !existingToken) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Delete the token
    const { error } = await supabaseAdmin
      .from('calendar_tokens')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calendar token:', error);
      return NextResponse.json(
        { error: `Failed to delete token: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Token "${existingToken.name}" has been revoked`
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update token status (activate/deactivate)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { is_active } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean value' },
        { status: 400 }
      );
    }

    // Update token status
    const { data, error } = await supabaseAdmin
      .from('calendar_tokens')
      .update({ is_active })
      .eq('id', id)
      .select('id, name, is_active')
      .single();

    if (error) {
      console.error('Error updating calendar token:', error);
      return NextResponse.json(
        { error: `Failed to update token: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      token: data,
      message: `Token "${data.name}" has been ${is_active ? 'activated' : 'deactivated'}`
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
