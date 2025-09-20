import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as yaml from 'yaml'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables')
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error - Supabase not configured' },
        { status: 500 }
      )
    }

    const contentType = request.headers.get('content-type') || '';
    let categoriesData: Array<{
      name: string;
      description?: string;
      order_index?: number;
      is_active?: boolean;
    }>;
    
    if (contentType.includes('application/x-yaml') || contentType.includes('text/yaml')) {
      const yamlText = await request.text();
      categoriesData = yaml.parse(yamlText);
    } else {
      const body = await request.json();
      categoriesData = body;
    }
    
    // Validate YAML structure - expect categories array
    if (!Array.isArray(categoriesData)) {
      return NextResponse.json(
        { error: 'YAML muss ein Array von Kategorien sein' },
        { status: 400 }
      )
    }

    let importedCount = 0

    // Import each category
    for (let i = 0; i < categoriesData.length; i++) {
      const categoryData = categoriesData[i]

      // Validate required fields
      if (!categoryData.name) {
        return NextResponse.json(
          { error: `Ungültige Daten in Element ${i + 1}: Name ist erforderlich` },
          { status: 400 }
        )
      }

      try {
        // Check if category already exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryData.name)
          .single()

        if (!existingCategory) {
          // Create new category
          const { error: categoryError } = await supabase
            .from('categories')
            .insert([{
              name: categoryData.name,
              description: categoryData.description || '',
              order_index: categoryData.order_index || 0,
              is_active: categoryData.is_active !== false
            }])

          if (categoryError) {
            console.log(`Warning: Could not create category ${categoryData.name}:`, categoryError.message)
          } else {
            importedCount++
          }
        }
      } catch (createError: unknown) {
        console.log(`Warning: Error processing category ${categoryData.name}:`, createError)
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      totalCount: categoriesData.length
    })

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Import error:', error)
    return NextResponse.json(
      { error: err.message || 'Fehler beim Importieren der YAML-Datei' },
      { status: 500 }
    )
  }
}
