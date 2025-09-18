import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabase/client';

export async function GET() {
  try {
    console.log('API: Fetching service groups');
    
    const { data, error } = await supabaseAdmin
      .from('service_groups')
      .select(`
        *,
        services (*),
        category:categories!service_groups_category_id_fkey (*)
      `)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('API: Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }
    
    console.log('API: Service groups fetched successfully:', data?.length || 0);
    return NextResponse.json({ serviceGroups: data });
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const groupData = await request.json();
    
    console.log('API: Creating service group with data:', groupData);
    
    // Create service group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('service_groups')
      .insert([{
        title: groupData.title,
        description: groupData.description,
        category_id: groupData.category_id,
        gender_restriction: groupData.gender_restriction,
        order_index: groupData.order_index
      }])
      .select()
      .single();

    if (groupError) {
      console.error('API: Group creation error:', groupError);
      return NextResponse.json(
        { error: `Database error: ${groupError.message || JSON.stringify(groupError)}` },
        { status: 500 }
      );
    }

    // Create service variants
    const services = groupData.variants.map((variant: {
      hair_length: string | null;
      duration_minutes: number;
      price_euros: number;
    }) => ({
      group_id: group.id,
      hair_length: variant.hair_length,
      duration_minutes: variant.duration_minutes,
      price_euros: variant.price_euros
    }));

    const { data: servicesData, error: servicesError } = await supabaseAdmin
      .from('services')
      .insert(services)
      .select();

    if (servicesError) {
      console.error('API: Services creation error:', servicesError);
      return NextResponse.json(
        { error: `Database error: ${servicesError.message || JSON.stringify(servicesError)}` },
        { status: 500 }
      );
    }

    console.log('API: Service group created successfully:', { group, services: servicesData });
    return NextResponse.json({ success: true, data: { group, services: servicesData } });
    
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
    const { groupId, groupData } = await request.json();
    
    console.log('API: Updating service group:', { groupId, groupData });
    
    // Update service group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('service_groups')
      .update({
        title: groupData.title,
        description: groupData.description,
        category_id: groupData.category_id,
        gender_restriction: groupData.gender_restriction,
        order_index: groupData.order_index
      })
      .eq('id', groupId)
      .select()
      .single();

    if (groupError) {
      console.error('API: Group update error:', groupError);
      return NextResponse.json(
        { error: `Database error: ${groupError.message || JSON.stringify(groupError)}` },
        { status: 500 }
      );
    }

    // Delete existing services
    await supabaseAdmin
      .from('services')
      .delete()
      .eq('group_id', groupId);

    // Create new services
    const services = groupData.variants.map((variant: {
      hair_length: string | null;
      duration_minutes: number;
      price_euros: number;
    }) => ({
      group_id: groupId,
      hair_length: variant.hair_length,
      duration_minutes: variant.duration_minutes,
      price_euros: variant.price_euros
    }));

    const { data: servicesData, error: servicesError } = await supabaseAdmin
      .from('services')
      .insert(services)
      .select();

    if (servicesError) {
      console.error('API: Services update error:', servicesError);
      return NextResponse.json(
        { error: `Database error: ${servicesError.message || JSON.stringify(servicesError)}` },
        { status: 500 }
      );
    }

    console.log('API: Service group updated successfully:', { group, services: servicesData });
    return NextResponse.json({ success: true, data: { group, services: servicesData } });
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { groupId } = await request.json();
    
    console.log('API: Deleting service group:', groupId);
    
    const { error } = await supabaseAdmin
      .from('service_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('API: Delete error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }
    
    console.log('API: Service group deleted successfully');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
