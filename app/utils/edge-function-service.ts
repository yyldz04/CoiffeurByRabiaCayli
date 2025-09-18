// Edge Function Service for creating appointments
// This service calls the Supabase Edge Function which is public-facing

export interface CreateAppointmentRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  service_id: string
  gender: 'DAMEN' | 'HERREN'
  appointment_date: string // YYYY-MM-DD format
  appointment_time: string // HH:MM format
  special_requests?: string
}

export interface CreateAppointmentResponse {
  success: boolean
  error?: string
  appointment_id?: string
  message?: string
}

export const edgeFunctionService = {
  /**
   * Create a new appointment via the public edge function
   * @param appointmentData - The appointment data to create
   * @returns Promise<CreateAppointmentResponse> - Success/failure response
   */
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<CreateAppointmentResponse> {
    try {
      console.log('Creating appointment via edge function:', appointmentData)
      
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Edge function error:', errorData)
        return {
          success: false,
          error: errorData.error || `HTTP error: ${response.status}`
        }
      }

      const result = await response.json()
      console.log('Edge function response:', result)
      
      return result

    } catch (error) {
      console.error('Error calling edge function:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  },

  /**
   * Validate appointment data before sending to edge function
   * @param appointmentData - The appointment data to validate
   * @returns boolean - Whether the data is valid
   */
  validateAppointmentData(appointmentData: CreateAppointmentRequest): boolean {
    // Check required fields
    if (!appointmentData.first_name?.trim()) return false
    if (!appointmentData.last_name?.trim()) return false
    if (!appointmentData.email?.trim()) return false
    if (!appointmentData.phone?.trim()) return false
    if (!appointmentData.service_id) return false
    if (!appointmentData.gender) return false
    if (!appointmentData.appointment_date) return false
    if (!appointmentData.appointment_time) return false

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(appointmentData.email)) return false

    // Validate gender
    if (!['DAMEN', 'HERREN'].includes(appointmentData.gender)) return false

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(appointmentData.appointment_date)) return false

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(appointmentData.appointment_time)) return false

    // Validate appointment date is not in the past
    const appointmentDate = new Date(appointmentData.appointment_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    if (appointmentDate < today) return false

    // Validate appointment date is not too far in the future (6 months)
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6)
    if (appointmentDate > maxDate) return false

    return true
  }
}
