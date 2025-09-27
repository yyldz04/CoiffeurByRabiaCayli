import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

// Validate required environment variables
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is required but not set');
}
if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set');
}

// Log configuration for debugging (remove in production)
if (typeof window !== 'undefined') {
  console.log('Supabase configuration:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    anonKey: supabaseAnonKey ? 'Set' : 'Missing',
    serviceKey: supabaseServiceKey ? 'Set' : 'Missing'
  });
}

// Client for client-side operations (with anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side admin operations (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Client for client-side operations (with auth)
export const supabaseAuth = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Auth types
export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    first_name?: string
    last_name?: string
    role?: 'admin' | 'user'
  }
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
}

// Types for our database tables
export interface Category {
  id: string
  name: string
  description: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceGroup {
  id: string
  title: string
  description: string
  category_id: string
  gender_restriction: 'DAMEN' | 'HERREN' | 'BEIDE'
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface Service {
  id: string
  group_id: string
  hair_length: 'KURZ' | 'MITTEL' | 'LANG' | null
  duration_minutes: number
  price_euros: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceWithGroup extends Service {
  group_title: string
  group_description: string
  category: string
  gender_restriction: string
  group_order: number
}

export interface Appointment {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  service_id: string
  gender: string
  appointment_date: string
  appointment_time: string
  appointment_datetime: string
  special_requests?: string
  internal_notes?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
  confirmed_at?: string
  cancelled_at?: string
  service?: {
    duration_minutes: number
    price_euros: number
    hair_length: 'KURZ' | 'MITTEL' | 'LANG' | null
    service_group: {
      title: string
      description: string
      category: {
        name: string
      }
    }
  }
}

export interface BusySlot {
  id: string
  start_datetime: string  // ISO timestamp string
  end_datetime: string    // ISO timestamp string
  title: string
  description?: string
  created_at: string
  updated_at: string
}

// Legacy interface for backward compatibility during migration
export interface LegacyBusySlot {
  id: string
  busy_date: string
  end_date?: string
  start_time: string
  end_time: string
  title: string
  description?: string
  created_at: string
  updated_at: string
}

// Authentication services - Simplified for single admin user
export const authService = {
  // Sign in with email and password using service role key
  async signIn(email: string, password: string) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabaseAdmin.auth.signOut()
    if (error) throw error
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabaseAdmin.auth.getSession()
    if (error) throw error
    return session
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser()
    if (error) throw error
    return user
  },

  // Check if user is logged in (any authenticated user is admin)
  async isLoggedIn(): Promise<boolean> {
    try {
      const session = await this.getSession()
      return !!session
    } catch {
      return false
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabaseAdmin.auth.onAuthStateChange(callback)
  }
}

// Service management operations
export const serviceService = {
  // Get all service groups with their services
  async getServiceGroups() {
    console.log('Fetching service groups from API');
    
    const response = await fetch('/api/service-groups');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch service groups');
    }
    
    const result = await response.json();
    console.log('Service groups fetched successfully:', result.serviceGroups?.length || 0);
    return result.serviceGroups;
  },

  // Get services with group details (for booking)
  async getServicesWithGroups() {
    const { data, error } = await supabase
      .from('services_with_groups')
      .select('*')
      .order('group_order', { ascending: true })

    if (error) throw error
    return data
  },

  // Create a new service group with variants
  async createServiceGroup(groupData: {
    title: string
    description: string
    category_id: string
    gender_restriction: 'DAMEN' | 'HERREN' | 'BEIDE'
    order_index: number
    variants: Array<{
      hair_length: 'KURZ' | 'MITTEL' | 'LANG' | null
      duration_minutes: number
      price_euros: number
    }>
  }) {
    // Create service group
    const { data: group, error: groupError } = await supabase
      .from('service_groups')
      .insert([{
        title: groupData.title,
        description: groupData.description,
        category_id: groupData.category_id,
        gender_restriction: groupData.gender_restriction,
        order_index: groupData.order_index
      }])
      .select()
      .single()

    if (groupError) throw groupError

    // Create service variants
    const services = groupData.variants.map(variant => ({
      group_id: group.id,
      hair_length: variant.hair_length,
      duration_minutes: variant.duration_minutes,
      price_euros: variant.price_euros
    }))

    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .insert(services)
      .select()

    if (servicesError) throw servicesError

    return { group, services: servicesData }
  },

  // Update a service group and its variants
  async updateServiceGroup(groupId: string, groupData: {
    title: string
    description: string
    category_id: string
    gender_restriction: 'DAMEN' | 'HERREN' | 'BEIDE'
    order_index: number
    variants: Array<{
      id?: string
      hair_length: 'KURZ' | 'MITTEL' | 'LANG' | null
      duration_minutes: number
      price_euros: number
    }>
  }) {
    // Update service group
    const { data: group, error: groupError } = await supabase
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
      .single()

    if (groupError) throw groupError

    // Delete existing services
    await supabase
      .from('services')
      .delete()
      .eq('group_id', groupId)

    // Create new services
    const services = groupData.variants.map(variant => ({
      group_id: groupId,
      hair_length: variant.hair_length,
      duration_minutes: variant.duration_minutes,
      price_euros: variant.price_euros
    }))

    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .insert(services)
      .select()

    if (servicesError) throw servicesError

    return { group, services: servicesData }
  },

  // Delete service group (cascades to services)
  async deleteServiceGroup(groupId: string) {
    const { error } = await supabase
      .from('service_groups')
      .delete()
      .eq('id', groupId)

    if (error) throw error
  },

  // Delete individual services
  async deleteServices(serviceIds: string[]) {
    const { error } = await supabase
      .from('services')
      .delete()
      .in('id', serviceIds)

    if (error) throw error
  }
}

// Category management operations
export const categoryService = {
  // Get all categories
  async getCategories() {
    console.log('Fetching categories from API');
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.categories || [];
  },

  // Create a new category
  async createCategory(categoryData: {
    name: string
    description?: string
    order_index?: number
  }) {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create category');
    }

    const result = await response.json();
    return result.data;
  },

  // Update a category
  async updateCategory(categoryId: string, categoryData: {
    name: string
    description?: string
    order_index?: number
  }) {
    const response = await fetch('/api/categories', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryId, categoryData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update category');
    }

    const result = await response.json();
    return result.data;
  },

  // Delete a category
  async deleteCategory(categoryId: string) {
    const response = await fetch(`/api/categories?id=${categoryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete category');
    }

    const result = await response.json();
    return result.success;
  }
}

// Database operations
export const appointmentService = {
  // Create a new appointment
  async createAppointment(appointmentData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    service: string
    gender: string
    hairLength?: string
    date: string
    time: string
    requests?: string
    serviceDetails: {
      serviceName: string
      serviceDuration: string
      servicePrice: string
    }
  }) {
    console.log('Creating appointment with data:', appointmentData);
    
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error || 'Failed to create appointment');
    }

    const result = await response.json();
    console.log('Appointment created successfully:', result.data);
    return result.data;
  },

  // Get all appointments
  async getAppointments() {
    const response = await fetch('/api/appointments');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch appointments');
    }
    
    const result = await response.json();
    return result.appointments;
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
    console.log('Updating appointment status:', { appointmentId, status });
    
    const response = await fetch('/api/appointments', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appointmentId, status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error || 'Failed to update appointment status');
    }

    const result = await response.json();
    console.log('Appointment status updated successfully:', result.data);
    return result.data;
  },

  // Check for conflicting appointments
  async checkConflicts(date: string, time: string) {
    console.log('Checking conflicts for:', { date, time });
    
    const response = await fetch(`/api/appointments?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error || 'Failed to check conflicts');
    }
    
    const result = await response.json();
    console.log('Conflict check result:', result.hasConflict);
    
    // Also check for busy slots
    try {
      const busySlotsForDate = await this.checkBusySlotConflict(date, time, time);
      if (busySlotsForDate) {
        console.log('Busy slot conflict found');
        return true;
      }
    } catch (error) {
      console.error('Error checking busy slots:', error);
      // Don't throw here, just log the error and continue
    }
    
    return result.hasConflict;
  },

  // Check if a time slot conflicts with busy slots (Updated for TIMESTAMP schema)
  async checkBusySlotConflict(date: string, startTime: string, endTime: string) {
    try {
      const busySlotsForDate = await busySlotService.getBusySlotsForDate(date);
      
      // Convert appointment time to full datetime for comparison
      const appointmentStartDateTime = `${date}T${startTime}:00`;
      const appointmentEndDateTime = `${date}T${endTime}:00`;
      
      // Check if the appointment time overlaps with any busy slot
      for (const slot of busySlotsForDate) {
        if (appointmentStartDateTime < slot.end_datetime && appointmentEndDateTime > slot.start_datetime) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking busy slot conflicts:', error);
      return false; // Return false on error to not block appointments
    }
  }
}

// Busy slots management operations (Updated for TIMESTAMP schema)
export const busySlotService = {
  // Get all busy slots
  async getBusySlots() {
    const { data, error } = await supabaseAdmin
      .from('busy_slots')
      .select('*')
      .order('start_datetime', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get busy slots for a specific date range
  async getBusySlotsForDateRange(startDate: string, endDate?: string) {
    let query = supabaseAdmin
      .from('busy_slots')
      .select('*')
      .gte('start_datetime', `${startDate}T00:00:00`)
    
    if (endDate) {
      query = query.lte('end_datetime', `${endDate}T23:59:59`)
    }
    
    const { data, error } = await query.order('start_datetime', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get busy slots for a specific date (backward compatibility)
  async getBusySlotsForDate(date: string) {
    return this.getBusySlotsForDateRange(date, date)
  },

  // Create a new busy slot
  async createBusySlot(slotData: {
    start_datetime: string  // ISO timestamp string
    end_datetime: string    // ISO timestamp string
    title: string
    description?: string
  }) {
    const { data, error } = await supabaseAdmin
      .from('busy_slots')
      .insert([slotData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a busy slot
  async updateBusySlot(slotId: string, slotData: {
    start_datetime: string  // ISO timestamp string
    end_datetime: string    // ISO timestamp string
    title: string
    description?: string
  }) {
    const { data, error } = await supabaseAdmin
      .from('busy_slots')
      .update(slotData)
      .eq('id', slotId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a busy slot
  async deleteBusySlot(slotId: string) {
    const { error } = await supabaseAdmin
      .from('busy_slots')
      .delete()
      .eq('id', slotId)

    if (error) throw error
  },

  // Helper function to convert old format to new format
  convertLegacyToTimestamp(legacyData: {
    busy_date: string
    end_date?: string
    start_time: string
    end_time: string
    title: string
    description?: string
  }) {
    const startDate = legacyData.busy_date
    const endDate = legacyData.end_date || legacyData.busy_date
    
    return {
      start_datetime: `${startDate}T${legacyData.start_time}:00`,
      end_datetime: `${endDate}T${legacyData.end_time}:00`,
      title: legacyData.title,
      description: legacyData.description
    }
  },

  // Helper function to convert new format to display format
  convertTimestampToDisplay(timestampData: {
    start_datetime: string
    end_datetime: string
    title: string
    description?: string
  }) {
    const start = new Date(timestampData.start_datetime)
    const end = new Date(timestampData.end_datetime)
    
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      start_time: start.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
      title: timestampData.title,
      description: timestampData.description
    }
  }
}
