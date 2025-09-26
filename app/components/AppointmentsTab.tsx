"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { appointmentService, Appointment } from '../utils/supabase/client';
import { PaymentDialog } from './PaymentDialog';
import { TabHeader } from './TabHeader';
import { AppointmentCard } from './AppointmentCard';

interface AppointmentsTabProps {
  currentTime: Date;
  onFullscreenToggle: (isFullscreen: boolean) => void;
}

export function AppointmentsTab({ currentTime, onFullscreenToggle }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
  }>({ isOpen: false, appointment: null });
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showMoreUpcoming, setShowMoreUpcoming] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    onFullscreenToggle(newFullscreenState);
  };
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

  // Get upcoming appointments for the next week
  const getUpcomingAppointments = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      return appointmentDate >= today && appointmentDate <= nextWeek;
    });
  };

  // Get all future appointments
  const getAllFutureAppointments = () => {
    const today = new Date();
    return appointments.filter(appointment => {
      const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      return appointmentDate >= today;
    });
  };

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
        <Button 
          onClick={fetchAppointments}
          variant="primaryOutline"
          size="default"
        >
          Erneut versuchen
        </Button>
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


  return (
    <div className="space-y-4">
      {/* Header */}
      <TabHeader
        title="Termine"
        subtitle={showAllAppointments 
          ? `Alle Termine (${getAllFutureAppointments().length})` 
          : `Kommende Woche (${getUpcomingAppointments().length})`
        }
      >
        <Button 
          variant="primaryOutline"
          size="dashboard"
          icon={<RefreshCw />}
          onClick={fetchAppointments}
          className="hidden sm:flex"
        >
          Aktualisieren
        </Button>

        <Button 
          variant="primaryOutline"
          size="icon"
          iconOnly
          icon={<RefreshCw />}
          onClick={fetchAppointments}
          title="Aktualisieren"
          className="sm:hidden"
        />

        <Button 
          variant="primaryOutline"
          size="dashboard"
          icon={isFullscreen ? <Minimize2 /> : <Maximize2 />}
          onClick={handleFullscreenToggle}
          className="hidden sm:flex"
        >
          {isFullscreen ? 'Verkleinern' : 'Vollbild'}
        </Button>

        <Button 
          variant="primaryOutline"
          iconOnly
          icon={isFullscreen ? <Minimize2 /> : <Maximize2 />}
          onClick={handleFullscreenToggle}
          title={isFullscreen ? 'Verkleinern' : 'Vollbild'}
          className="sm:hidden"
        />
      </TabHeader>

      {/* Upcoming Appointments Section */}
      {!showAllAppointments && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl tracking-[0.1em] uppercase">Kommende Termine</h2>
            {getUpcomingAppointments().length > 3 && (
              <Button
                onClick={() => setShowMoreUpcoming(!showMoreUpcoming)}
                variant="secondary"
                size="sm"
              >
                {showMoreUpcoming ? 'Weniger anzeigen' : 'Mehr anzeigen'}
              </Button>
            )}
          </div>
          
          {getUpcomingAppointments().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60 uppercase tracking-[0.05em]">Keine Termine in der kommenden Woche</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(showMoreUpcoming ? getUpcomingAppointments() : getUpcomingAppointments().slice(0, 3))
                .sort((a, b) => {
                  const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
                  const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
                  return dateA.getTime() - dateB.getTime();
                })
                .map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    currentTime={currentTime}
                    isExpanded={expandedRows.has(appointment.id)}
                    isAutoExpanded={shouldAutoExpand(appointment)}
                    onToggle={toggleRow}
                    onStatusUpdate={updateAppointmentStatus}
                    onPaymentOpen={(appointment) => setPaymentDialog({ isOpen: true, appointment })}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* All Appointments Section */}
      {showAllAppointments && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl tracking-[0.1em] uppercase">Alle Termine</h2>
            <Button
              onClick={() => setShowAllAppointments(false)}
              variant="secondary"
              size="sm"
            >
              Zurück zur Übersicht
            </Button>
          </div>
          
          {getAllFutureAppointments().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60 uppercase tracking-[0.05em]">Keine zukünftigen Termine</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getAllFutureAppointments()
                .sort((a, b) => {
                  const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
                  const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
                  return dateA.getTime() - dateB.getTime();
                })
                .map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    currentTime={currentTime}
                    isExpanded={expandedRows.has(appointment.id)}
                    isAutoExpanded={shouldAutoExpand(appointment)}
                    onToggle={toggleRow}
                    onStatusUpdate={updateAppointmentStatus}
                    onPaymentOpen={(appointment) => setPaymentDialog({ isOpen: true, appointment })}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Show All Button - Only when not showing all appointments */}
      {!showAllAppointments && (
        <div className="text-center pt-8 border-t border-white/20">
          <Button
            onClick={() => setShowAllAppointments(true)}
            variant="primaryOutline"
            size="default"
          >
            Alle Termine anzeigen
          </Button>
        </div>
      )}

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={paymentDialog.isOpen}
        onClose={() => setPaymentDialog({ isOpen: false, appointment: null })}
        amount={paymentDialog.appointment?.service?.price_euros || 0}
        appointmentId={paymentDialog.appointment?.id || ''}
        serviceName={paymentDialog.appointment?.service?.service_group?.title || 'N/A'}
        customerName={`${paymentDialog.appointment?.first_name || ''} ${paymentDialog.appointment?.last_name || ''}`.trim()}
      />
    </div>
  );
}