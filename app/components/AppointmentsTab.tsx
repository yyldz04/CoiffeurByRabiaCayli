"use client";

import { useState, useEffect, useCallback } from "react";
// import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Clock, User, Mail, Phone } from "lucide-react";
import { appointmentService, Appointment } from '../utils/supabase/client';

interface AppointmentsTabProps {
  currentTime: Date;
}

export function AppointmentsTab({ currentTime }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    try {
      const appointments = await appointmentService.getAppointments();
      setAppointments(appointments || []);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      setError(`Fehler beim Laden der Termine: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus as 'pending' | 'confirmed' | 'cancelled' | 'completed');
      // Refresh appointments list
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Set error state to show user-friendly message
      setError(`Fehler beim Aktualisieren des Termins: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Check if appointment should be auto-expanded (within 15 minutes)
  const shouldAutoExpand = useCallback((appointment: Appointment): boolean => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const timeDiff = appointmentDateTime.getTime() - currentTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Expand if appointment is within 15 minutes (before or during)
    return minutesDiff <= 15 && minutesDiff >= -60; // Also keep expanded for 1 hour after start
  }, [currentTime]);

  // Update expanded rows based on current time
  useEffect(() => {
    setExpandedRows(prevExpandedRows => {
      const newExpandedRows = new Set<string>();
      
      // Preserve manually expanded rows
      appointments.forEach(appointment => {
        if (shouldAutoExpand(appointment) || prevExpandedRows.has(appointment.id)) {
          newExpandedRows.add(appointment.id);
        }
      });

      return newExpandedRows;
    });
  }, [currentTime, appointments, shouldAutoExpand]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const toggleRow = (appointmentId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(appointmentId)) {
      newExpandedRows.delete(appointmentId);
    } else {
      newExpandedRows.add(appointmentId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-white/20 text-white border-white/30';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('de-AT', {
      timeZone: 'Europe/Vienna',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60 uppercase tracking-[0.05em]">Termine werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 uppercase tracking-[0.05em]">{error}</p>
        <button 
          onClick={fetchAppointments}
          className="mt-4 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black px-8 py-3 tracking-[0.05em] transition-colors uppercase"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60 uppercase tracking-[0.05em]">Keine Termine vorhanden</p>
      </div>
    );
  }

  // Sort appointments by date and time
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
    const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-0 md:px-4 xl:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl tracking-[0.2em] mb-2 uppercase">Termine</h1>
            <p className="text-white/60 uppercase">Verwalten Sie Ihre Salon-Termine ({appointments.length})</p>
          </div>
          <button 
            onClick={fetchAppointments}
            className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black px-8 py-3 tracking-[0.05em] transition-colors uppercase"
          >
            Aktualisieren
          </button>
        </div>

      {sortedAppointments.map((appointment) => {
        const isExpanded = expandedRows.has(appointment.id);
        const isAutoExpanded = shouldAutoExpand(appointment);
        
        return (
          <div key={appointment.id} className={`border border-white/20 ${isAutoExpanded ? 'border-purple-400/50 bg-purple-400/5' : ''}`}>
            <div 
              className="w-full p-4 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => toggleRow(appointment.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white/60" />
                    <span className="tracking-[0.05em] uppercase">
                      {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-white/60" />
                    <span className="tracking-[0.05em] uppercase">
                      {appointment.first_name} {appointment.last_name}
                    </span>
                  </div>
                  <div className={`border px-3 py-1 ${getStatusColor(appointment.status)} uppercase tracking-[0.05em] text-xs`}>
                    {appointment.status}
                  </div>
                  {isAutoExpanded && (
                    <div className="border px-3 py-1 bg-purple-500/20 text-purple-400 border-purple-500/30 uppercase tracking-[0.05em] text-xs">
                      Aktiv
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 tracking-[0.05em] uppercase">
                    {appointment.service?.service_group?.title || 'Service'}
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-white/20 p-6 bg-white/2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="tracking-[0.1em] uppercase border-b border-white/20 pb-2">
                      Kundeninformationen
                    </h3>
                    <div className="space-y-2 text-white/70">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="uppercase">
                          {appointment.first_name} {appointment.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{appointment.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="uppercase">{appointment.phone}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="uppercase">Geschlecht: {appointment.gender}</p>
                        {appointment.service?.hair_length && (
                          <p className="uppercase">Haarlänge: {appointment.service.hair_length}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div className="space-y-4">
                    <h3 className="tracking-[0.1em] uppercase border-b border-white/20 pb-2">
                      Service Details
                    </h3>
                    <div className="space-y-2 text-white/70">
                      <p className="uppercase">Service: {appointment.service?.service_group?.title || 'N/A'}</p>
                      <p className="uppercase">Dauer: {appointment.service?.duration_minutes || 'N/A'} Min</p>
                      <p className="uppercase">Preis: {appointment.service?.price_euros ? `${appointment.service.price_euros.toFixed(2)}€` : 'N/A'}</p>
                      {appointment.special_requests && (
                        <div>
                          <p className="uppercase text-white/90 mb-1">Besondere Wünsche:</p>
                          <p className="uppercase text-white/70">{appointment.special_requests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      disabled={appointment.status === 'confirmed'}
                      className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 px-6 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50"
                    >
                      Bestätigen
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      disabled={appointment.status === 'completed'}
                      className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 px-6 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50"
                    >
                      Abgeschlossen
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      disabled={appointment.status === 'cancelled'}
                      className="bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 px-6 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50"
                    >
                      Stornieren
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'pending')}
                      disabled={appointment.status === 'pending'}
                      className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black px-6 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50"
                    >
                      Ausstehend
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-xs text-white/40 uppercase tracking-[0.05em]">
                  Erstellt: {new Date(appointment.created_at).toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}