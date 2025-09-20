import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as yaml from 'yaml'
import { ServiceGroupImportData } from '../../../types'

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
    let body: { data?: ServiceGroupImportData[]; categories?: Array<{name: string; description?: string; order_index?: number; is_active?: boolean}>; service_groups?: ServiceGroupImportData[]; shouldClear: boolean };
    
    if (contentType.includes('application/x-yaml') || contentType.includes('text/yaml')) {
      const yamlText = await request.text();
      body = yaml.parse(yamlText);
    } else {
      body = await request.json();
    }
    
    const { data, shouldClear } = body

    // Validate YAML structure - expect service groups array
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'YAML muss ein Array von Dienstleistungsgruppen sein' },
        { status: 400 }
      )
    }

    let importedCount = 0

    if (shouldClear) {
      // Clear all existing service groups (this will cascade to services)
      const { data: existingGroups } = await supabase
        .from('service_groups')
        .select('id')

      if (existingGroups) {
        for (const group of existingGroups) {
          await supabase
            .from('service_groups')
            .delete()
            .eq('id', group.id)
        }
      }
    }

    // Import each service group
    for (let i = 0; i < data.length; i++) {
      const groupData = data[i]

      // Validate required fields
      if (!groupData.title || !groupData.description || !groupData.category || !groupData.gender_restriction) {
        return NextResponse.json(
          { error: `Ungültige Daten in Element ${i + 1}: Titel, Beschreibung, Kategorie und Geschlechtsbeschränkung sind erforderlich` },
          { status: 400 }
        )
      }

      // Validate gender_restriction
      if (!['DAMEN', 'HERREN', 'BEIDE'].includes(groupData.gender_restriction)) {
        return NextResponse.json(
          { error: `Ungültige Geschlechtsbeschränkung in "${groupData.title}": Muss DAMEN, HERREN oder BEIDE sein` },
          { status: 400 }
        )
      }

      // Validate variants
      if (!Array.isArray(groupData.variants)) {
        return NextResponse.json(
          { error: `Ungültige Varianten in "${groupData.title}": Muss ein Array sein` },
          { status: 400 }
        )
      }

      // Validate each variant
      for (let j = 0; j < groupData.variants.length; j++) {
        const variant = groupData.variants[j]
        if (variant.hair_length && !['KURZ', 'MITTEL', 'LANG'].includes(variant.hair_length)) {
          return NextResponse.json(
            { error: `Ungültige Haarlänge in "${groupData.title}" Variante ${j + 1}: Muss KURZ, MITTEL oder LANG sein` },
            { status: 400 }
          )
        }
        if (typeof variant.duration_minutes !== 'number' || variant.duration_minutes < 0) {
          return NextResponse.json(
            { error: `Ungültige Dauer in "${groupData.title}" Variante ${j + 1}: Muss eine positive Zahl sein` },
            { status: 400 }
          )
        }
        if (typeof variant.price_euros !== 'number' || variant.price_euros < 0) {
          return NextResponse.json(
            { error: `Ungültiger Preis in "${groupData.title}" Variante ${j + 1}: Muss eine positive Zahl sein` },
            { status: 400 }
          )
        }
      }

      try {
        // Look up category ID from category name
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', groupData.category)
          .single()

        if (categoryError || !category) {
          return NextResponse.json(
            { error: `Kategorie "${groupData.category}" nicht gefunden. Bitte erstellen Sie die Kategorie zuerst.` },
            { status: 400 }
          )
        }

        // Create service group
        const { data: group, error: groupError } = await supabase
          .from('service_groups')
          .insert([{
            title: groupData.title,
            description: groupData.description,
            category_id: category.id,
            gender_restriction: groupData.gender_restriction,
            order_index: groupData.order_index || (i + 1)
          }])
          .select()
          .single()

        if (groupError) {
          // If it's a duplicate error and we didn't clear, skip this item
          if (!shouldClear && groupError.message.includes('duplicate')) {
            continue
          }
          throw groupError
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
        }))

        const { error: servicesError } = await supabase
          .from('services')
          .insert(services)

        if (servicesError) {
          throw servicesError
        }

        importedCount++
      } catch (createError: unknown) {
        const error = createError as Error;
        // If it's a duplicate error and we didn't clear, skip this item
        if (!shouldClear && error.message && error.message.includes('duplicate')) {
          continue
        }
        throw createError
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      totalCount: data.length
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
