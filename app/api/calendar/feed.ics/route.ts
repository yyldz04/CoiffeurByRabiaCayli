import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../utils/supabase/client';

// Types for calendar data
interface CalendarSettings {
  calendar_name: string;
  calendar_description: string;
  calendar_timezone: string;
  calendar_contact_email: string;
  calendar_contact_phone: string;
  calendar_website: string;
  calendar_location: string;
  calendar_refresh_interval: string;
  calendar_max_events: string;
}

interface TokenValidation {
  success: boolean;
  token_id?: string;
  name?: string;
  permissions?: string[];
  expires_at?: string;
  error?: string;
}

interface Appointment {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  service?: {
    duration_minutes: number;
    price_euros: number;
    hair_length: string;
    service_group: {
      title: string;
      description: string;
    };
  };
}

interface BusySlot {
  id: string;
  start_datetime: string;
  end_datetime: string;
  title: string;
  description?: string;
}

// Helper function to validate calendar token
async function validateToken(token: string): Promise<TokenValidation> {
  try {
    const { data, error } = await supabaseAdmin.rpc('validate_calendar_token', {
      p_token: token
    });
    
    if (error) {
      console.error('Token validation error:', error);
      return { success: false, error: 'Token validation failed' };
    }
    
    return data as TokenValidation;
  } catch (error) {
    console.error('Token validation exception:', error);
    return { success: false, error: 'Token validation failed' };
  }
}

// Helper function to get calendar settings
async function getCalendarSettings(): Promise<CalendarSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from('calendar_settings')
      .select('setting_key, setting_value');
    
    if (error) {
      console.error('Settings fetch error:', error);
      // Return default settings
      return {
        calendar_name: 'CBRC Termine',
        calendar_description: 'Coiffeur by Rabia Cayli - Termine und Zeitblöcke',
        calendar_timezone: 'Europe/Vienna',
        calendar_contact_email: '',
        calendar_contact_phone: '',
        calendar_website: '',
        calendar_location: '',
        calendar_refresh_interval: '3600',
        calendar_max_events: '1000'
      };
    }
    
    // Convert array to object
    const settings: Partial<CalendarSettings> = {};
    data.forEach((item: { setting_key: string; setting_value: string }) => {
      settings[item.setting_key as keyof CalendarSettings] = item.setting_value;
    });
    
    return settings as CalendarSettings;
  } catch (error) {
    console.error('Settings fetch exception:', error);
    // Return default settings
    return {
      calendar_name: 'CBRC Termine',
      calendar_description: 'Coiffeur by Rabia Cayli - Termine und Zeitblöcke',
      calendar_timezone: 'Europe/Vienna',
      calendar_contact_email: '',
      calendar_contact_phone: '',
      calendar_website: '',
      calendar_location: '',
      calendar_refresh_interval: '3600',
      calendar_max_events: '1000'
    };
  }
}

// Helper function to get appointments
async function getAppointments(startDate?: string, endDate?: string, maxEvents: number = 1000): Promise<Appointment[]> {
  try {
    let query = supabaseAdmin
      .from('appointments')
      .select(`
        *,
        service:services!appointments_service_id_fkey (
          duration_minutes,
          price_euros,
          hair_length,
          service_group:service_groups!services_group_id_fkey (
            title,
            description
          )
        )
      `)
      .order('appointment_datetime', { ascending: true })
      .limit(maxEvents);
    
    if (startDate) {
      query = query.gte('appointment_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('appointment_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Appointments fetch error:', error);
      return [];
    }
    
    return data as Appointment[];
  } catch (error) {
    console.error('Appointments fetch exception:', error);
    return [];
  }
}

// Helper function to get busy slots
async function getBusySlots(startDate?: string, endDate?: string, maxEvents: number = 1000): Promise<BusySlot[]> {
  try {
    let query = supabaseAdmin
      .from('busy_slots')
      .select('*')
      .order('start_datetime', { ascending: true })
      .limit(maxEvents);
    
    if (startDate) {
      query = query.gte('start_datetime', `${startDate}T00:00:00`);
    }
    
    if (endDate) {
      query = query.lte('end_datetime', `${endDate}T23:59:59`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Busy slots fetch error:', error);
      return [];
    }
    
    return data as BusySlot[];
  } catch (error) {
    console.error('Busy slots fetch exception:', error);
    return [];
  }
}

// Helper function to format date for iCal
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Helper function to escape iCal text
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// Helper function to generate iCal event for appointment
function generateAppointmentEvent(appointment: Appointment, settings: CalendarSettings): string {
  const startDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
  const endDate = new Date(startDate.getTime() + (appointment.service?.duration_minutes || 60) * 60000);
  
  const uid = `appointment-${appointment.id}@${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] || 'localhost'}`;
  const summary = `Termin: ${appointment.first_name} ${appointment.last_name} - ${appointment.service?.service_group?.title || 'Service'}`;
  
  let description = `Kunde: ${appointment.first_name} ${appointment.last_name}\\n`;
  description += `Telefon: ${appointment.phone}\\n`;
  description += `E-Mail: ${appointment.email}\\n`;
  description += `Service: ${appointment.service?.service_group?.title || 'N/A'}\\n`;
  description += `Dauer: ${appointment.service?.duration_minutes || 'N/A'} Min\\n`;
  description += `Preis: ${appointment.service?.price_euros ? `${appointment.service.price_euros.toFixed(2)}€` : 'N/A'}\\n`;
  description += `Status: ${appointment.status}`;
  
  if (appointment.special_requests) {
    description += `\\nBesondere Wünsche: ${appointment.special_requests}`;
  }
  
  if (settings.calendar_contact_phone) {
    description += `\\n\\nKontakt: ${settings.calendar_contact_phone}`;
  }
  
  let event = `BEGIN:VEVENT\r\n`;
  event += `UID:${uid}\r\n`;
  event += `DTSTART:${formatICalDate(startDate)}\r\n`;
  event += `DTEND:${formatICalDate(endDate)}\r\n`;
  event += `SUMMARY:${escapeICalText(summary)}\r\n`;
  event += `DESCRIPTION:${escapeICalText(description)}\r\n`;
  event += `STATUS:${appointment.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}\r\n`;
  event += `CATEGORIES:APPOINTMENT\r\n`;
  
  // Add location if available
  if (settings.calendar_location) {
    event += `LOCATION:${escapeICalText(settings.calendar_location)}\r\n`;
  }
  
  // Add contact information
  if (settings.calendar_contact_email) {
    event += `CONTACT:${escapeICalText(settings.calendar_contact_email)}\r\n`;
  }
  
  event += `END:VEVENT\r\n`;
  
  return event;
}

// Helper function to generate iCal event for busy slot
function generateBusySlotEvent(slot: BusySlot, settings: CalendarSettings): string {
  const startDate = new Date(slot.start_datetime);
  const endDate = new Date(slot.end_datetime);
  
  const uid = `busy-${slot.id}@${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] || 'localhost'}`;
  const summary = `BESETZT: ${slot.title}`;
  
  let description = `Zeitblock reserviert\\n`;
  if (slot.description) {
    description += `Beschreibung: ${slot.description}`;
  }
  
  if (settings.calendar_contact_phone) {
    description += `\\n\\nKontakt: ${settings.calendar_contact_phone}`;
  }
  
  let event = `BEGIN:VEVENT\r\n`;
  event += `UID:${uid}\r\n`;
  event += `DTSTART:${formatICalDate(startDate)}\r\n`;
  event += `DTEND:${formatICalDate(endDate)}\r\n`;
  event += `SUMMARY:${escapeICalText(summary)}\r\n`;
  event += `DESCRIPTION:${escapeICalText(description)}\r\n`;
  event += `STATUS:CONFIRMED\r\n`;
  event += `CATEGORIES:BUSY\r\n`;
  event += `TRANSP:OPAQUE\r\n`; // Mark as busy time
  
  // Add location if available
  if (settings.calendar_location) {
    event += `LOCATION:${escapeICalText(settings.calendar_location)}\r\n`;
  }
  
  event += `END:VEVENT\r\n`;
  
  return event;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    
    // Validate token
    if (!token) {
      return NextResponse.json(
        { error: 'Calendar token is required' },
        { status: 401 }
      );
    }
    
    const tokenValidation = await validateToken(token);
    if (!tokenValidation.success) {
      return NextResponse.json(
        { error: tokenValidation.error || 'Invalid calendar token' },
        { status: 401 }
      );
    }
    
    // Get calendar settings
    const settings = await getCalendarSettings();
    const maxEvents = parseInt(settings.calendar_max_events) || 1000;
    
    // Get events based on permissions
    let appointments: Appointment[] = [];
    let busySlots: BusySlot[] = [];
    
    if (tokenValidation.permissions?.includes('appointments')) {
      appointments = await getAppointments(startDate || undefined, endDate || undefined, maxEvents);
    }
    
    if (tokenValidation.permissions?.includes('busy_slots')) {
      busySlots = await getBusySlots(startDate || undefined, endDate || undefined, maxEvents);
    }
    
    // Generate iCal content
    let icalContent = `BEGIN:VCALENDAR\r\n`;
    icalContent += `VERSION:2.0\r\n`;
    icalContent += `PRODID:-//CBRC//Calendar//EN\r\n`;
    icalContent += `CALSCALE:GREGORIAN\r\n`;
    icalContent += `METHOD:PUBLISH\r\n`;
    icalContent += `X-WR-CALNAME:${escapeICalText(settings.calendar_name)}\r\n`;
    icalContent += `X-WR-CALDESC:${escapeICalText(settings.calendar_description)}\r\n`;
    icalContent += `X-WR-TIMEZONE:${settings.calendar_timezone}\r\n`;
    icalContent += `X-WR-RELCALID:${tokenValidation.token_id}\r\n`;
    
    // Add refresh interval if specified
    if (settings.calendar_refresh_interval) {
      icalContent += `X-PUBLISHED-TTL:PT${settings.calendar_refresh_interval}S\r\n`;
    }
    
    // Add events
    for (const appointment of appointments) {
      icalContent += generateAppointmentEvent(appointment, settings);
    }
    
    for (const slot of busySlots) {
      icalContent += generateBusySlotEvent(slot, settings);
    }
    
    icalContent += `END:VCALENDAR\r\n`;
    
    // Return iCal content
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="cbrc-calendar.ics"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'ETag': `"${Date.now()}-${appointments.length}-${busySlots.length}"`, // Simple ETag for caching
      },
    });
    
  } catch (error) {
    console.error('Calendar feed generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
