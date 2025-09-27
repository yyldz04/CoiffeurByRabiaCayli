import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../utils/supabase/client';

// CalDAV namespace constants
const DAV_NAMESPACE = 'DAV:';
const CALDAV_NAMESPACE = 'urn:ietf:params:xml:ns:caldav';

// Helper function to validate calendar token
async function validateToken(request: NextRequest): Promise<{ success: boolean; token_id?: string; permissions?: string[]; error?: string }> {
  try {
    // Extract token from Authorization header or query params
    let token: string | null = null;
    
    // Try Authorization header first (Basic auth)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Basic ')) {
      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');
      token = password; // Use password as token
    }
    
    // Try query parameter
    if (!token) {
      const url = new URL(request.url);
      token = url.searchParams.get('token');
    }
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }
    
    const { data, error } = await supabaseAdmin.rpc('validate_calendar_token', {
      p_token: token
    });
    
    if (error || !data.success) {
      return { success: false, error: 'Invalid token' };
    }
    
    return data;
  } catch (error) {
    console.error('Token validation error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// Helper function to get calendar home path
function getCalendarHomePath(): string {
  return '/caldav/';
}

// Helper function to get calendar path
function getCalendarPath(tokenId: string): string {
  return `/caldav/calendars/${tokenId}/`;
}

// Helper function to generate calendar display name
function getCalendarDisplayName(): string {
  return 'CBRC Termine';
}

// Helper function to generate calendar description
function getCalendarDescription(): string {
  return 'Coiffeur by Rabia Cayli - Termine und Zeitblöcke';
}

// Helper function to generate XML response
function generateXMLResponse(xmlContent: string): NextResponse {
  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

// Helper function to parse iCal content and extract event data
function parseICalEvent(icalContent: string) {
  // This is a simplified parser - in production, you'd want to use a proper iCal library
  const lines = icalContent.split(/\r?\n/);
  const event: any = {};
  let inEvent = false;
  
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      continue;
    }
    if (line === 'END:VEVENT') {
      break;
    }
    if (!inEvent) continue;
    
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':');
    
    switch (key) {
      case 'UID':
        event.uid = value;
        break;
      case 'SUMMARY':
        event.summary = value;
        break;
      case 'DESCRIPTION':
        event.description = value;
        break;
      case 'DTSTART':
        event.dtstart = value;
        break;
      case 'DTEND':
        event.dtend = value;
        break;
      case 'CATEGORIES':
        event.categories = value;
        break;
    }
  }
  
  return event;
}

// Helper function to convert event to iCal format
function eventToICal(event: any): string {
  const uid = event.uid || `event-${Date.now()}@${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] || 'localhost'}`;
  
  let ical = 'BEGIN:VEVENT\r\n';
  ical += `UID:${uid}\r\n`;
  ical += `DTSTART:${event.dtstart}\r\n`;
  ical += `DTEND:${event.dtend}\r\n`;
  ical += `SUMMARY:${event.summary || ''}\r\n`;
  if (event.description) {
    ical += `DESCRIPTION:${event.description}\r\n`;
  }
  if (event.categories) {
    ical += `CATEGORIES:${event.categories}\r\n`;
  }
  ical += 'STATUS:CONFIRMED\r\n';
  ical += 'END:VEVENT\r\n';
  
  return ical;
}

// PROPFIND method handler
async function handlePropfind(request: NextRequest, path: string[]): Promise<NextResponse> {
  const auth = await validateToken(request);
  if (!auth.success) {
    return new NextResponse('Unauthorized', { 
      status: 401, 
      headers: { 'WWW-Authenticate': 'Basic realm="Calendar"' }
    });
  }
  
  const depth = request.headers.get('Depth') || '1';
  const requestPath = '/' + path.join('/');
  
  let xmlResponse = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="${DAV_NAMESPACE}" xmlns:C="${CALDAV_NAMESPACE}">`;
  
  // Handle calendar home discovery
  if (requestPath === '/caldav/') {
    xmlResponse += `
  <D:response>
    <D:href>/caldav/</D:href>
    <D:propstat>
      <D:prop>
        <D:current-user-principal>
          <D:href>/caldav/principals/user/</D:href>
        </D:current-user-principal>
        <D:resource-type>
          <D:collection/>
        </D:resource-type>
        <D:displayname>${getCalendarDisplayName()}</D:displayname>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>`;
    
    // Include calendar collection if depth > 0
    if (depth !== '0') {
      const calendarPath = getCalendarPath(auth.token_id!);
      xmlResponse += `
  <D:response>
    <D:href>${calendarPath}</D:href>
    <D:propstat>
      <D:prop>
        <D:resourcetype>
          <D:collection/>
          <C:calendar/>
        </D:resourcetype>
        <D:displayname>${getCalendarDisplayName()}</D:displayname>
        <D:getetag>"${Date.now()}"</D:getetag>
        <C:calendar-description>${getCalendarDescription()}</C:calendar-description>
        <C:supported-calendar-component-set>
          <C:comp name="VEVENT"/>
        </C:supported-calendar-component-set>
        <C:calendar-timezone>Europe/Vienna</C:calendar-timezone>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>`;
    }
  }
  // Handle calendar collection
  else if (requestPath.startsWith('/caldav/calendars/')) {
    xmlResponse += `
  <D:response>
    <D:href>${requestPath}</D:href>
    <D:propstat>
      <D:prop>
        <D:resourcetype>
          <D:collection/>
          <C:calendar/>
        </D:resourcetype>
        <D:displayname>${getCalendarDisplayName()}</D:displayname>
        <D:getetag>"${Date.now()}"</D:getetag>
        <C:calendar-description>${getCalendarDescription()}</C:calendar-description>
        <C:supported-calendar-component-set>
          <C:comp name="VEVENT"/>
        </C:supported-calendar-component-set>
        <C:calendar-timezone>Europe/Vienna</C:calendar-timezone>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>`;
    
    // Include events if depth > 0
    if (depth !== '0') {
      // Get appointments and busy slots
      const appointments = auth.permissions?.includes('appointments') 
        ? await getAppointmentsForCalDAV() 
        : [];
      const busySlots = auth.permissions?.includes('busy_slots') 
        ? await getBusySlotsForCalDAV() 
        : [];
      
      const allEvents = [...appointments, ...busySlots];
      
      for (const event of allEvents) {
        const eventPath = `${requestPath}${event.id}.ics`;
        xmlResponse += `
  <D:response>
    <D:href>${eventPath}</D:href>
    <D:propstat>
      <D:prop>
        <D:getetag>"${event.etag}"</D:getetag>
        <D:getlastmodified>${event.lastModified}</D:getlastmodified>
        <D:getcontenttype>text/calendar; charset=utf-8</D:getcontenttype>
        <D:getcontentlength>${event.size}</D:getcontentlength>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>`;
      }
    }
  }
  
  xmlResponse += `
</D:multistatus>`;
  
  return generateXMLResponse(xmlResponse);
}

// GET method handler (for retrieving events)
async function handleGet(request: NextRequest, path: string[]): Promise<NextResponse> {
  const auth = await validateToken(request);
  if (!auth.success) {
    return new NextResponse('Unauthorized', { 
      status: 401, 
      headers: { 'WWW-Authenticate': 'Basic realm="Calendar"' }
    });
  }
  
  const requestPath = '/' + path.join('/');
  
  // Handle calendar collection - return calendar info
  if (requestPath.match(/^\/caldav\/calendars\/[^\/]+\/$/)) {
    const calendarUrl = request.url.replace('/api/caldav', '/api/calendar/feed.ics');
    const icalUrl = `${calendarUrl}?token=${request.headers.get('Authorization')?.split(' ')[1] || ''}`;
    
    return new NextResponse(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CBRC//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${getCalendarDisplayName()}
X-WR-CALDESC:${getCalendarDescription()}
X-WR-TIMEZONE:Europe/Vienna
END:VCALENDAR`, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  }
  
  // Handle individual events
  const eventMatch = requestPath.match(/^\/caldav\/calendars\/[^\/]+\/(.+)\.ics$/);
  if (eventMatch) {
    const eventId = eventMatch[1];
    
    // Try to get the event from appointments or busy slots
    let event = null;
    
    if (auth.permissions?.includes('appointments')) {
      event = await getAppointmentById(eventId);
    }
    
    if (!event && auth.permissions?.includes('busy_slots')) {
      event = await getBusySlotById(eventId);
    }
    
    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }
    
    const icalContent = eventToICal(event);
    
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'ETag': `"${event.etag}"`,
        'Last-Modified': event.lastModified,
        'Cache-Control': 'no-cache',
      },
    });
  }
  
  return new NextResponse('Not found', { status: 404 });
}

// PUT method handler (for creating/updating events)
async function handlePut(request: NextRequest, path: string[]): Promise<NextResponse> {
  const auth = await validateToken(request);
  if (!auth.success) {
    return new NextResponse('Unauthorized', { 
      status: 401, 
      headers: { 'WWW-Authenticate': 'Basic realm="Calendar"' }
    });
  }
  
  const requestPath = '/' + path.join('/');
  const eventMatch = requestPath.match(/^\/caldav\/calendars\/[^\/]+\/(.+)\.ics$/);
  
  if (!eventMatch) {
    return new NextResponse('Invalid event path', { status: 400 });
  }
  
  const eventId = eventMatch[1];
  const icalContent = await request.text();
  
  try {
    const event = parseICalEvent(icalContent);
    
    // Determine if this is an appointment or busy slot based on categories
    if (event.categories === 'APPOINTMENT') {
      // Handle appointment update (read-only for now)
      return new NextResponse('Appointments are read-only via CalDAV', { status: 403 });
    } else if (event.categories === 'BUSY') {
      // Handle busy slot update
      await updateBusySlotFromCalDAV(eventId, event);
      return new NextResponse('Event updated', { 
        status: 200,
        headers: {
          'ETag': `"${Date.now()}"`,
        }
      });
    } else {
      // Default to busy slot
      await updateBusySlotFromCalDAV(eventId, event);
      return new NextResponse('Event updated', { 
        status: 200,
        headers: {
          'ETag': `"${Date.now()}"`,
        }
      });
    }
  } catch (error) {
    console.error('Error updating event:', error);
    return new NextResponse('Error updating event', { status: 500 });
  }
}

// DELETE method handler (for deleting events)
async function handleDelete(request: NextRequest, path: string[]): Promise<NextResponse> {
  const auth = await validateToken(request);
  if (!auth.success) {
    return new NextResponse('Unauthorized', { 
      status: 401, 
      headers: { 'WWW-Authenticate': 'Basic realm="Calendar"' }
    });
  }
  
  const requestPath = '/' + path.join('/');
  const eventMatch = requestPath.match(/^\/caldav\/calendars\/[^\/]+\/(.+)\.ics$/);
  
  if (!eventMatch) {
    return new NextResponse('Invalid event path', { status: 400 });
  }
  
  const eventId = eventMatch[1];
  
  try {
    // Try to delete from busy slots (appointments are read-only)
    if (auth.permissions?.includes('busy_slots')) {
      await deleteBusySlotById(eventId);
      return new NextResponse('Event deleted', { status: 200 });
    }
    
    return new NextResponse('Cannot delete this event type', { status: 403 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return new NextResponse('Error deleting event', { status: 500 });
  }
}

// Helper functions for data access
async function getAppointmentsForCalDAV() {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        first_name,
        last_name,
        appointment_date,
        appointment_time,
        status,
        special_requests,
        service:services!appointments_service_id_fkey (
          duration_minutes,
          price_euros,
          service_group:service_groups!services_group_id_fkey (
            title
          )
        )
      `)
      .order('appointment_datetime', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(appointment => ({
      id: appointment.id,
      uid: `appointment-${appointment.id}`,
      summary: `Termin: ${appointment.first_name} ${appointment.last_name} - ${appointment.service?.service_group?.title || 'Service'}`,
      description: `Kunde: ${appointment.first_name} ${appointment.last_name}\\nService: ${appointment.service?.service_group?.title || 'N/A'}\\nStatus: ${appointment.status}`,
      dtstart: new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      dtend: new Date(new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).getTime() + (appointment.service?.duration_minutes || 60) * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      categories: 'APPOINTMENT',
      etag: `"${Date.now()}"`,
      lastModified: new Date().toUTCString(),
      size: 0 // Will be calculated
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

async function getBusySlotsForCalDAV() {
  try {
    const { data, error } = await supabaseAdmin
      .from('busy_slots')
      .select('*')
      .order('start_datetime', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(slot => ({
      id: slot.id,
      uid: `busy-${slot.id}`,
      summary: `BESETZT: ${slot.title}`,
      description: slot.description || 'Zeitblock reserviert',
      dtstart: new Date(slot.start_datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      dtend: new Date(slot.end_datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      categories: 'BUSY',
      etag: `"${Date.now()}"`,
      lastModified: new Date().toUTCString(),
      size: 0 // Will be calculated
    }));
  } catch (error) {
    console.error('Error fetching busy slots:', error);
    return [];
  }
}

async function getAppointmentById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        first_name,
        last_name,
        appointment_date,
        appointment_time,
        status,
        special_requests,
        service:services!appointments_service_id_fkey (
          duration_minutes,
          price_euros,
          service_group:service_groups!services_group_id_fkey (
            title
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      uid: `appointment-${data.id}`,
      summary: `Termin: ${data.first_name} ${data.last_name} - ${data.service?.service_group?.title || 'Service'}`,
      description: `Kunde: ${data.first_name} ${data.last_name}\\nService: ${data.service?.service_group?.title || 'N/A'}\\nStatus: ${data.status}`,
      dtstart: new Date(`${data.appointment_date}T${data.appointment_time}`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      dtend: new Date(new Date(`${data.appointment_date}T${data.appointment_time}`).getTime() + (data.service?.duration_minutes || 60) * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      categories: 'APPOINTMENT',
      etag: `"${Date.now()}"`,
      lastModified: new Date().toUTCString()
    };
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return null;
  }
}

async function getBusySlotById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('busy_slots')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      uid: `busy-${data.id}`,
      summary: `BESETZT: ${data.title}`,
      description: data.description || 'Zeitblock reserviert',
      dtstart: new Date(data.start_datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      dtend: new Date(data.end_datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      categories: 'BUSY',
      etag: `"${Date.now()}"`,
      lastModified: new Date().toUTCString()
    };
  } catch (error) {
    console.error('Error fetching busy slot:', error);
    return null;
  }
}

async function updateBusySlotFromCalDAV(id: string, event: any) {
  try {
    // Parse dates from iCal format
    const startDate = new Date(event.dtstart.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z'));
    const endDate = new Date(event.dtend.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z'));
    
    const updateData = {
      start_datetime: startDate.toISOString(),
      end_datetime: endDate.toISOString(),
      title: event.summary.replace('BESETZT: ', '') || 'Zeitblock',
      description: event.description || null
    };
    
    const { error } = await supabaseAdmin
      .from('busy_slots')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating busy slot:', error);
    throw error;
  }
}

async function deleteBusySlotById(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('busy_slots')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting busy slot:', error);
    throw error;
  }
}

// Main route handler
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleGet(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handlePut(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleDelete(request, params.path);
}

export async function PROPFIND(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handlePropfind(request, params.path);
}

// Handle other CalDAV methods
export async function PROPPATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Not implemented - return not supported
  return new NextResponse('Method not implemented', { status: 405 });
}

export async function MKCOL(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Not implemented - return not supported
  return new NextResponse('Method not implemented', { status: 405 });
}

export async function COPY(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Not implemented - return not supported
  return new NextResponse('Method not implemented', { status: 405 });
}

export async function MOVE(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Not implemented - return not supported
  return new NextResponse('Method not implemented', { status: 405 });
}
