import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, depth',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PROPFIND, PROPPATCH, MKCALENDAR, REPORT'
}

// Types for calendar data
interface Appointment {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  appointment_date: string
  appointment_time: string
  appointment_datetime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests?: string
  service?: {
    duration_minutes: number
    price_euros: number
    hair_length: string
    service_group: {
      title: string
      description: string
    }
  }
}

interface BusySlot {
  id: string
  start_datetime: string
  end_datetime: string
  title: string
  description?: string
}

interface TokenValidation {
  success: boolean
  token_id?: string
  name?: string
  permissions?: string[]
  expires_at?: string
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/caldav-server', '')
    
    // Get the actual method (handle method override from Next.js proxy)
    const actualMethod = req.headers.get('X-HTTP-Method-Override') || req.method
    
    // Authenticate request
    const tokenId = await authenticateRequest(req)
    if (!tokenId) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: { 'WWW-Authenticate': 'Basic realm="Calendar"', ...corsHeaders }
      })
    }

    // Route CalDAV requests
    switch (actualMethod) {
      case 'PROPFIND':
        return handlePropfind(req, path, tokenId)
      case 'GET':
        return handleGet(req, path, tokenId)
      case 'PUT':
        return handlePut(req, path, tokenId)
      case 'DELETE':
        return handleDelete(req, path, tokenId)
      case 'REPORT':
        return handleReport(req, path, tokenId)
      case 'PROPPATCH':
        return handleProppatch(req, path, tokenId)
      case 'MKCALENDAR':
        return handleMkCalendar(req, path, tokenId)
      default:
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
    }
  } catch (error) {
    console.error('CalDAV server error:', error)
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

// Authentication function
async function authenticateRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Basic ')) {
    return null
  }
  
  try {
    const decoded = atob(authHeader.slice(6))
    const [username, token] = decoded.split(':')
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Validate token using CalDAV-specific function
    const { data } = await supabaseClient.rpc('validate_calendar_token_for_caldav', {
      p_token: token
    })
    
    return data?.success ? data.token_id : null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// PROPFIND - Calendar discovery
async function handlePropfind(req: Request, path: string, tokenId: string) {
  const depth = req.headers.get('Depth') || '1'
  
  // Root CalDAV discovery
  if (path === '/' || path === '') {
    return new Response(`<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:CS="http://calendarserver.org/ns/">
  <D:response>
    <D:href>/</D:href>
    <D:propstat>
      <D:prop>
        <D:current-user-principal>
          <D:href>/principals/users/calendar/</D:href>
        </D:current-user-principal>
        <D:resourcetype>
          <D:collection/>
        </D:resourcetype>
        <CS:getctag>1</CS:getctag>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
</D:multistatus>`, {
      status: 207,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        ...corsHeaders
      }
    })
  }
  
  // Calendar home discovery
  if (path === '/principals/users/calendar/' || path === '/principals/users/calendar') {
    return new Response(`<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:response>
    <D:href>/principals/users/calendar/</D:href>
    <D:propstat>
      <D:prop>
        <D:resourcetype>
          <D:collection/>
          <C:calendar-home-set/>
        </D:resourcetype>
        <C:calendar-home-set>
          <D:href>/calendars/</D:href>
        </C:calendar-home-set>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
</D:multistatus>`, {
      status: 207,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        ...corsHeaders
      }
    })
  }
  
  // Calendar collection discovery
  if (path === '/calendars/' || path === '/calendars') {
    return new Response(`<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:CS="http://calendarserver.org/ns/">
  <D:response>
    <D:href>/calendars/appointments/</D:href>
    <D:propstat>
      <D:prop>
        <D:resourcetype>
          <D:collection/>
          <C:calendar/>
        </D:resourcetype>
        <D:displayname>CBRC Appointments</D:displayname>
        <C:calendar-description>Coiffeur by Rabia Cayli - Customer Appointments</C:calendar-description>
        <C:supported-calendar-component-set>
          <C:comp name="VEVENT"/>
        </C:supported-calendar-component-set>
        <C:calendar-timezone>Europe/Vienna</C:calendar-timezone>
        <CS:getctag>1</CS:getctag>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
  <D:response>
    <D:href>/calendars/busy-slots/</D:href>
    <D:propstat>
      <D:prop>
        <D:resourcetype>
          <D:collection/>
          <C:calendar/>
        </D:resourcetype>
        <D:displayname>CBRC Busy Slots</D:displayname>
        <C:calendar-description>Coiffeur by Rabia Cayli - Busy Time Slots</C:calendar-description>
        <C:supported-calendar-component-set>
          <C:comp name="VEVENT"/>
        </C:supported-calendar-component-set>
        <C:calendar-timezone>Europe/Vienna</C:calendar-timezone>
        <CS:getctag>1</CS:getctag>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
</D:multistatus>`, {
      status: 207,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        ...corsHeaders
      }
    })
  }
  
  // Individual calendar discovery
  if (path.startsWith('/calendars/') && path.endsWith('/')) {
    const calendarName = path.split('/')[2]
    return new Response(`<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:CS="http://calendarserver.org/ns/">
  <D:response>
    <D:href>${path}</D:href>
    <D:propstat>
      <D:prop>
        <D:resourcetype>
          <D:collection/>
          <C:calendar/>
        </D:resourcetype>
        <D:displayname>${calendarName === 'appointments' ? 'CBRC Appointments' : 'CBRC Busy Slots'}</D:displayname>
        <C:calendar-description>${calendarName === 'appointments' ? 'Customer Appointments' : 'Busy Time Slots'}</C:calendar-description>
        <C:supported-calendar-component-set>
          <C:comp name="VEVENT"/>
        </C:supported-calendar-component-set>
        <C:calendar-timezone>Europe/Vienna</C:calendar-timezone>
        <CS:getctag>1</CS:getctag>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
</D:multistatus>`, {
      status: 207,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        ...corsHeaders
      }
    })
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders })
}

// GET - Fetch individual events
async function handleGet(req: Request, path: string, tokenId: string) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Parse path: /calendars/appointments/event-id.ics
  const pathParts = path.split('/').filter(p => p)
  if (pathParts.length !== 3 || !pathParts[2].endsWith('.ics')) {
    return new Response('Bad Request', { status: 400, headers: corsHeaders })
  }
  
  const calendarType = pathParts[1]
  const eventId = pathParts[2].replace('.ics', '')
  
  if (calendarType === 'appointments') {
    const { data: result, error } = await supabaseClient.rpc('get_appointment_for_caldav', {
      p_token_id: tokenId,
      p_appointment_id: eventId
    })
    
    if (error || !result?.success) {
      return new Response('Event not found', { status: 404, headers: corsHeaders })
    }
    
    const icalContent = generateAppointmentICal(result.appointment)
    
    return new Response(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'ETag': `"${result.appointment.id}-${result.appointment.updated_at}"`,
        'Last-Modified': new Date(result.appointment.updated_at).toUTCString(),
        ...corsHeaders
      }
    })
  } else if (calendarType === 'busy-slots') {
    const { data: result, error } = await supabaseClient.rpc('get_busy_slot_for_caldav', {
      p_token_id: tokenId,
      p_busy_slot_id: eventId
    })
    
    if (error || !result?.success) {
      return new Response('Event not found', { status: 404, headers: corsHeaders })
    }
    
    const icalContent = generateBusySlotICal(result.busy_slot)
    
    return new Response(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'ETag': `"${result.busy_slot.id}-${result.busy_slot.updated_at}"`,
        'Last-Modified': new Date(result.busy_slot.updated_at).toUTCString(),
        ...corsHeaders
      }
    })
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders })
}

// PUT - Create or update events
async function handlePut(req: Request, path: string, tokenId: string) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const icalContent = await req.text()
  const pathParts = path.split('/').filter(p => p)
  
  if (pathParts.length !== 3 || !pathParts[2].endsWith('.ics')) {
    return new Response('Bad Request', { status: 400, headers: corsHeaders })
  }
  
  const calendarType = pathParts[1]
  const eventId = pathParts[2].replace('.ics', '')
  
  try {
    if (calendarType === 'appointments') {
      const appointmentData = parseICalToAppointment(icalContent)
      
      const { data: result, error } = await supabaseClient.rpc('upsert_appointment_from_caldav', {
        p_token_id: tokenId,
        p_appointment_id: eventId,
        p_first_name: appointmentData.first_name || 'Unknown',
        p_last_name: appointmentData.last_name || 'Customer',
        p_email: appointmentData.email || '',
        p_phone: appointmentData.phone || '',
        p_appointment_date: appointmentData.appointment_date,
        p_appointment_time: appointmentData.appointment_time,
        p_appointment_datetime: appointmentData.appointment_datetime,
        p_status: appointmentData.status || 'pending',
        p_special_requests: appointmentData.special_requests,
        p_service_id: appointmentData.service_id
      })
      
      if (error || !result?.success) {
        console.error('Upsert error:', error || result?.error)
        return new Response('Upsert failed', { status: 500, headers: corsHeaders })
      }
      
      return new Response('OK', { 
        status: result.message === 'Updated' ? 204 : 201, 
        headers: corsHeaders 
      })
    }
  } catch (error) {
    console.error('PUT error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders })
}

// DELETE - Remove events
async function handleDelete(req: Request, path: string, tokenId: string) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const pathParts = path.split('/').filter(p => p)
  if (pathParts.length !== 3 || !pathParts[2].endsWith('.ics')) {
    return new Response('Bad Request', { status: 400, headers: corsHeaders })
  }
  
  const calendarType = pathParts[1]
  const eventId = pathParts[2].replace('.ics', '')
  
  try {
    if (calendarType === 'appointments') {
      const { data: result, error } = await supabaseClient.rpc('delete_appointment_from_caldav', {
        p_token_id: tokenId,
        p_appointment_id: eventId
      })
      
      if (error || !result?.success) {
        console.error('Delete error:', error || result?.error)
        return new Response('Delete failed', { status: 500, headers: corsHeaders })
      }
      
      return new Response('OK', { status: 204, headers: corsHeaders })
    } else if (calendarType === 'busy-slots') {
      const { data: result, error } = await supabaseClient.rpc('delete_busy_slot_from_caldav', {
        p_token_id: tokenId,
        p_busy_slot_id: eventId
      })
      
      if (error || !result?.success) {
        console.error('Delete error:', error || result?.error)
        return new Response('Delete failed', { status: 500, headers: corsHeaders })
      }
      
      return new Response('OK', { status: 204, headers: corsHeaders })
    }
  } catch (error) {
    console.error('DELETE error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders })
}

// REPORT - Calendar query (for syncing)
async function handleReport(req: Request, path: string, tokenId: string) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const pathParts = path.split('/').filter(p => p)
  if (pathParts.length !== 2) {
    return new Response('Bad Request', { status: 400, headers: corsHeaders })
  }
  
  const calendarType = pathParts[1]
  
  try {
    if (calendarType === 'appointments') {
      const { data: result, error } = await supabaseClient.rpc('get_appointments_for_caldav', {
        p_token_id: tokenId,
        p_start_date: null,
        p_end_date: null,
        p_max_events: 1000
      })
      
      if (error || !result?.success) {
        console.error('Query error:', error || result?.error)
        return new Response('Query failed', { status: 500, headers: corsHeaders })
      }
      
      const appointments = result.appointments || []
      
      // Generate calendar query response
      let xml = `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-multiget xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
`
      
      appointments.forEach((appointment: any) => {
        xml += `  <D:response>
    <D:href>/calendars/appointments/${appointment.id}.ics</D:href>
    <D:propstat>
      <D:prop>
        <D:getetag>"${appointment.id}-${appointment.updated_at}"</D:getetag>
        <D:getlastmodified>${new Date(appointment.updated_at).toUTCString()}</D:getlastmodified>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
`
      })
      
      xml += `</C:calendar-multiget>`
      
      return new Response(xml, {
        status: 207,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          ...corsHeaders
        }
      })
    } else if (calendarType === 'busy-slots') {
      const { data: result, error } = await supabaseClient.rpc('get_busy_slots_for_caldav', {
        p_token_id: tokenId,
        p_start_date: null,
        p_end_date: null,
        p_max_events: 1000
      })
      
      if (error || !result?.success) {
        console.error('Query error:', error || result?.error)
        return new Response('Query failed', { status: 500, headers: corsHeaders })
      }
      
      const busySlots = result.busy_slots || []
      
      // Generate calendar query response
      let xml = `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-multiget xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
`
      
      busySlots.forEach((busySlot: any) => {
        xml += `  <D:response>
    <D:href>/calendars/busy-slots/${busySlot.id}.ics</D:href>
    <D:propstat>
      <D:prop>
        <D:getetag>"${busySlot.id}-${busySlot.updated_at}"</D:getetag>
        <D:getlastmodified>${new Date(busySlot.updated_at).toUTCString()}</D:getlastmodified>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
`
      })
      
      xml += `</C:calendar-multiget>`
      
      return new Response(xml, {
        status: 207,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          ...corsHeaders
        }
      })
    }
  } catch (error) {
    console.error('REPORT error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders })
}

// PROPPATCH - Update properties
async function handleProppatch(req: Request, path: string, tokenId: string) {
  // For now, return not implemented
  return new Response('PROPPATCH not implemented', { status: 501, headers: corsHeaders })
}

// MKCALENDAR - Create calendar collection
async function handleMkCalendar(req: Request, path: string, tokenId: string) {
  // For now, return not implemented
  return new Response('MKCALENDAR not implemented', { status: 501, headers: corsHeaders })
}

// Helper function to generate iCal for appointment
function generateAppointmentICal(appointment: Appointment): string {
  const startDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
  const endDate = new Date(startDate.getTime() + (appointment.service?.duration_minutes || 60) * 60000)
  
  const uid = `appointment-${appointment.id}@${Deno.env.get('SUPABASE_URL')?.split('//')[1] || 'localhost'}`
  const summary = `Termin: ${appointment.first_name} ${appointment.last_name} - ${appointment.service?.service_group?.title || 'Service'}`
  
  let description = `Kunde: ${appointment.first_name} ${appointment.last_name}\\n`
  description += `Telefon: ${appointment.phone}\\n`
  description += `E-Mail: ${appointment.email}\\n`
  description += `Service: ${appointment.service?.service_group?.title || 'N/A'}\\n`
  description += `Dauer: ${appointment.service?.duration_minutes || 'N/A'} Min\\n`
  description += `Preis: ${appointment.service?.price_euros ? `${appointment.service.price_euros.toFixed(2)}€` : 'N/A'}\\n`
  description += `Status: ${appointment.status}`
  
  if (appointment.special_requests) {
    description += `\\nBesondere Wünsche: ${appointment.special_requests}`
  }
  
  const formatICalDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const escapeICalText = (text: string) => text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/\r/g, '')
  
  let ical = `BEGIN:VCALENDAR\r\n`
  ical += `VERSION:2.0\r\n`
  ical += `PRODID:-//CBRC//Calendar//EN\r\n`
  ical += `CALSCALE:GREGORIAN\r\n`
  ical += `METHOD:PUBLISH\r\n`
  ical += `BEGIN:VEVENT\r\n`
  ical += `UID:${uid}\r\n`
  ical += `DTSTART:${formatICalDate(startDate)}\r\n`
  ical += `DTEND:${formatICalDate(endDate)}\r\n`
  ical += `SUMMARY:${escapeICalText(summary)}\r\n`
  ical += `DESCRIPTION:${escapeICalText(description)}\r\n`
  ical += `STATUS:${appointment.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}\r\n`
  ical += `CATEGORIES:APPOINTMENT\r\n`
  ical += `CREATED:${formatICalDate(new Date(appointment.created_at || new Date()))}\r\n`
  ical += `LAST-MODIFIED:${formatICalDate(new Date(appointment.updated_at || new Date()))}\r\n`
  ical += `END:VEVENT\r\n`
  ical += `END:VCALENDAR\r\n`
  
  return ical
}

// Helper function to generate iCal for busy slot
function generateBusySlotICal(busySlot: BusySlot): string {
  const startDate = new Date(busySlot.start_datetime)
  const endDate = new Date(busySlot.end_datetime)
  
  const uid = `busy-${busySlot.id}@${Deno.env.get('SUPABASE_URL')?.split('//')[1] || 'localhost'}`
  const summary = `BESETZT: ${busySlot.title}`
  
  let description = `Zeitblock reserviert\\n`
  if (busySlot.description) {
    description += `Beschreibung: ${busySlot.description}`
  }
  
  const formatICalDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const escapeICalText = (text: string) => text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/\r/g, '')
  
  let ical = `BEGIN:VCALENDAR\r\n`
  ical += `VERSION:2.0\r\n`
  ical += `PRODID:-//CBRC//Calendar//EN\r\n`
  ical += `CALSCALE:GREGORIAN\r\n`
  ical += `METHOD:PUBLISH\r\n`
  ical += `BEGIN:VEVENT\r\n`
  ical += `UID:${uid}\r\n`
  ical += `DTSTART:${formatICalDate(startDate)}\r\n`
  ical += `DTEND:${formatICalDate(endDate)}\r\n`
  ical += `SUMMARY:${escapeICalText(summary)}\r\n`
  ical += `DESCRIPTION:${escapeICalText(description)}\r\n`
  ical += `STATUS:CONFIRMED\r\n`
  ical += `CATEGORIES:BUSY\r\n`
  ical += `TRANSP:OPAQUE\r\n`
  ical += `CREATED:${formatICalDate(new Date(busySlot.created_at || new Date()))}\r\n`
  ical += `LAST-MODIFIED:${formatICalDate(new Date(busySlot.updated_at || new Date()))}\r\n`
  ical += `END:VEVENT\r\n`
  ical += `END:VCALENDAR\r\n`
  
  return ical
}

// Helper function to parse iCal to appointment data
function parseICalToAppointment(icalContent: string): any {
  // This is a simplified parser - in production you'd want a proper iCal parser
  const lines = icalContent.split(/\r?\n/)
  const appointmentData: any = {
    status: 'pending'
  }
  
  let inEvent = false
  let summary = ''
  let description = ''
  let dtstart = ''
  let dtend = ''
  
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true
      continue
    }
    if (line.startsWith('END:VEVENT')) {
      inEvent = false
      break
    }
    
    if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        summary = line.substring(8)
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.substring(12)
      } else if (line.startsWith('DTSTART:')) {
        dtstart = line.substring(8)
      } else if (line.startsWith('DTEND:')) {
        dtend = line.substring(6)
      }
    }
  }
  
  // Parse date/time from iCal format
  if (dtstart) {
    const startDate = new Date(dtstart.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6'))
    appointmentData.appointment_date = startDate.toISOString().split('T')[0]
    appointmentData.appointment_time = startDate.toTimeString().slice(0, 5)
    appointmentData.appointment_datetime = startDate.toISOString()
  }
  
  // Extract customer info from summary/description
  if (summary.includes(':')) {
    const parts = summary.split(':')
    if (parts.length >= 2) {
      const namePart = parts[1].trim()
      const nameParts = namePart.split(' - ')
      if (nameParts.length >= 1) {
        const customerName = nameParts[0].trim()
        const nameParts2 = customerName.split(' ')
        if (nameParts2.length >= 2) {
          appointmentData.first_name = nameParts2[0]
          appointmentData.last_name = nameParts2.slice(1).join(' ')
        }
      }
    }
  }
  
  // Extract contact info from description
  if (description) {
    const phoneMatch = description.match(/Telefon:\s*([^\n\r]+)/)
    if (phoneMatch) {
      appointmentData.phone = phoneMatch[1]
    }
    
    const emailMatch = description.match(/E-Mail:\s*([^\n\r]+)/)
    if (emailMatch) {
      appointmentData.email = emailMatch[1]
    }
    
    const requestsMatch = description.match(/Besondere Wünsche:\s*([^\n\r]+)/)
    if (requestsMatch) {
      appointmentData.special_requests = requestsMatch[1]
    }
  }
  
  return appointmentData
}
