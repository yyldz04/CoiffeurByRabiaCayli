import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabase/client';

export async function GET() {
  try {
    console.log('API: Fetching categories');
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('API: Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }
    
    console.log('API: Categories fetched successfully:', data?.length || 0);
    return NextResponse.json({ categories: data });
    
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
    const categoryData = await request.json();
    
    console.log('API: Creating category with data:', categoryData);
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([{
        name: categoryData.name,
        description: categoryData.description,
        order_index: categoryData.order_index || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('API: Category creation error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }

    console.log('API: Category created successfully:', data);
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
    const { categoryId, categoryData } = await request.json();
    
    console.log('API: Updating category:', { categoryId, categoryData });
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({
        name: categoryData.name,
        description: categoryData.description,
        order_index: categoryData.order_index
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('API: Category update error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }

    console.log('API: Category updated successfully:', data);
    return NextResponse.json({ success: true, data });
    
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
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    console.log('API: Deleting category:', categoryId);
    
    // Check if category is being used by any service groups
    const { data: serviceGroups, error: checkError } = await supabaseAdmin
      .from('service_groups')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1);

    if (checkError) {
      console.error('API: Check error:', checkError);
      return NextResponse.json(
        { error: `Database error: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (serviceGroups && serviceGroups.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by service groups' },
        { status: 400 }
      );
    }
    
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('API: Category deletion error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      );
    }

    console.log('API: Category deleted successfully');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


