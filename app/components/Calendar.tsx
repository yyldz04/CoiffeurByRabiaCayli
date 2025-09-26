"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, User, CreditCard, RefreshCw, CalendarPlus, Maximize2, Minimize2 } from "lucide-react";
import { appointmentService, busySlotService, Appointment, BusySlot } from '../utils/supabase/client';
import { PaymentDialog } from './PaymentDialog';
import { SegmentPicker } from './SegmentPicker';
import { BusySlotDialog } from './BusySlotDialog';
import { TabHeader } from './TabHeader';
import { Button } from './ui/button';

type CalendarView = 'day' | 'week' | 'month';

interface CalendarProps {
  onBack: () => void;
  onFullscreenToggle: (isFullscreen: boolean) => void;
}

export function Calendar({ onBack, onFullscreenToggle }: CalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('day');
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
  }>({ isOpen: false, appointment: null });
  const [busySlotDialog, setBusySlotDialog] = useState<{
    isOpen: boolean;
    selectedDate?: Date;
    existingSlot?: BusySlot;
  }>({ isOpen: false });
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(new Set());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    onFullscreenToggle(newFullscreenState);
  };

  // Memoized callback for SegmentPicker to prevent infinite re-renders
  const handleViewChange = useCallback((option: string) => {
    if (option === 'Tag') setView('day');
    else if (option === 'Woche') setView('week');
    else if (option === 'Monat') setView('month');
  }, []);

  // Memoized options to prevent infinite re-renders
  const calendarOptions = useMemo(() => ['Tag', 'Woche', 'Monat'], []);

  // Fetch appointments and busy slots from backend
  const fetchData = async () => {
    try {
      const [appointments, busySlots] = await Promise.all([
        appointmentService.getAppointments(),
        busySlotService.getBusySlots()
      ]);
      setAppointments(appointments || []);
      setBusySlots(busySlots || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Fehler beim Laden der Daten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // Legacy function for backward compatibility
  const fetchAppointments = fetchData;

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus as 'pending' | 'confirmed' | 'cancelled' | 'completed');
      fetchData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError(`Fehler beim Aktualisieren des Termins: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Busy slot handlers
  const handleSaveBusySlot = async (slotData: {
    busy_date: string;
    end_date?: string;
    start_time: string;
    end_time: string;
    title: string;
    description?: string;
  }) => {
    try {
      if (busySlotDialog.existingSlot) {
        await busySlotService.updateBusySlot(busySlotDialog.existingSlot.id, slotData);
      } else {
        await busySlotService.createBusySlot(slotData);
      }
      fetchData();
    } catch (error) {
      console.error('Error saving busy slot:', error);
      throw error;
    }
  };

  const handleDeleteBusySlot = async (slotId: string) => {
    try {
      await busySlotService.deleteBusySlot(slotId);
      fetchData();
    } catch (error) {
      console.error('Error deleting busy slot:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  // Navigate to specific date and switch to day view
  const navigateToDate = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if current date is today
  const isCurrentDateToday = () => {
    const today = new Date();
    const current = new Date(currentDate);
    
    switch (view) {
      case 'day':
        return current.toDateString() === today.toDateString();
      case 'week':
        const weekStart = new Date(current);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return today >= weekStart && today <= weekEnd;
      case 'month':
        return current.getMonth() === today.getMonth() && current.getFullYear() === today.getFullYear();
      default:
        return false;
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.appointment_date === dateStr);
  };

  // Get busy slots for a specific date
  const getBusySlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return busySlots.filter(slot => slot.busy_date === dateStr);
  };

  // Get appointments for a week
  const getAppointmentsForWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);
    
    const weekAppointments: { [key: string]: Appointment[] } = {};
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      const dateStr = weekDate.toISOString().split('T')[0];
      weekAppointments[dateStr] = getAppointmentsForDate(weekDate);
    }
    
    return { startOfWeek, appointments: weekAppointments };
  };

  // Get appointments for a month
  const getAppointmentsForMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const monthAppointments: { [key: string]: Appointment[] } = {};
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const monthDate = new Date(year, month, day);
      const dateStr = monthDate.toISOString().split('T')[0];
      monthAppointments[dateStr] = getAppointmentsForDate(monthDate);
    }
    
    return { firstDay, lastDay, appointments: monthAppointments };
  };

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    switch (view) {
      case 'day':
        return date.toLocaleDateString('de-AT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'week':
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return `${weekStart.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('de-AT', {
          year: 'numeric',
          month: 'long'
        });
      default:
        return '';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-white/20 text-white border-white/30';
    }
  };

  // Format time
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // Toggle appointment expansion
  const toggleAppointmentExpansion = (appointmentId: string) => {
    const newExpanded = new Set(expandedAppointments);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedAppointments(newExpanded);
  };

  // Render day view
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    const dayBusySlots = getBusySlotsForDate(currentDate);
    
    // Combine appointments and busy slots, sort by time
    const allItems = [
      ...dayAppointments.map(apt => ({ type: 'appointment' as const, data: apt, time: apt.appointment_time })),
      ...dayBusySlots.map(slot => ({ type: 'busy' as const, data: slot, time: slot.start_time }))
    ].sort((a, b) => a.time.localeCompare(b.time));
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-[0.1em] uppercase">
            {formatDateDisplay(currentDate)}
          </h2>
        </div>
        
        {allItems.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 uppercase tracking-[0.05em]">Keine Termine an diesem Tag</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allItems.map((item) => {
              if (item.type === 'busy') {
                const slot = item.data as BusySlot;
                return (
                  <div key={slot.id} className="border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                    {/* Desktop Layout */}
                    <div className="w-full p-4 hidden sm:block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-400" />
                            <span className="tracking-[0.05em] uppercase font-mono text-red-400">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarPlus className="h-4 w-4 text-red-400" />
                            <span className="tracking-[0.05em] uppercase text-red-400">
                              {slot.title}
                            </span>
                          </div>
                          <div className="border border-red-500/30 px-3 py-1 bg-red-500/20 text-red-400 uppercase tracking-[0.05em] text-xs">
                            BESETZT
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setBusySlotDialog({ isOpen: true, existingSlot: slot })}
                            className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 p-2 transition-colors"
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="w-full p-4 sm:hidden">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-400" />
                          <span className="tracking-[0.05em] uppercase text-sm text-red-400">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarPlus className="h-4 w-4 text-red-400" />
                          <span className="tracking-[0.05em] uppercase text-sm text-red-400">
                            {slot.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="border border-red-500/30 px-2 py-1 bg-red-500/20 text-red-400 uppercase tracking-[0.05em] text-xs">
                            BESETZT
                          </div>
                          <button
                            onClick={() => setBusySlotDialog({ isOpen: true, existingSlot: slot })}
                            className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 p-2 transition-colors"
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const appointment = item.data as Appointment;
                return (
                <div key={appointment.id} className="border border-white/20 hover:bg-white/5 transition-colors">
                  {/* Desktop Layout */}
                  <div className="w-full p-4 cursor-pointer hidden sm:block">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-white/60" />
                          <span className="tracking-[0.05em] uppercase font-mono">
                            {formatTime(appointment.appointment_time)}
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
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 tracking-[0.05em] uppercase text-sm">
                          {appointment.service?.service_group?.title || 'Service'}
                        </span>
                        <button
                          onClick={() => setPaymentDialog({ isOpen: true, appointment })}
                          className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 p-2 transition-colors"
                          title="Zahlung"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="w-full p-4 cursor-pointer sm:hidden" onClick={() => toggleAppointmentExpansion(appointment.id)}>
                    <div className="flex flex-col space-y-3">
                      {/* Date and Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-white/60" />
                        <span className="tracking-[0.05em] uppercase text-sm">
                          {formatTime(appointment.appointment_time)}
                        </span>
                      </div>
                      
                      {/* Client Name */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-white/60" />
                        <span className="tracking-[0.05em] uppercase text-sm">
                          {appointment.first_name} {appointment.last_name}
                        </span>
                      </div>
                      
                      {/* Service */}
                      <div className="text-white/60 tracking-[0.05em] uppercase text-sm">
                        {appointment.service?.service_group?.title || 'Service'}
                      </div>
                      
                      {/* Status and Payment Button */}
                      <div className="flex items-center justify-between">
                        <div className={`border px-2 py-1 ${getStatusColor(appointment.status)} uppercase tracking-[0.05em] text-xs`}>
                          {appointment.status}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentDialog({ isOpen: true, appointment });
                          }}
                          className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 p-2 transition-colors"
                          title="Zahlung"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details - Mobile */}
                  {expandedAppointments.has(appointment.id) && (
                    <div className="border-t border-white/20 p-4 bg-white/2 sm:hidden">
                      <div className="space-y-4">
                        {/* Customer Information */}
                        <div className="space-y-2">
                          <h3 className="tracking-[0.1em] uppercase border-b border-white/20 pb-2 text-sm">
                            Kundeninformationen
                          </h3>
                          <div className="space-y-2 text-white/70 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="uppercase">
                                {appointment.first_name} {appointment.last_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{appointment.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
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
                        <div className="space-y-2">
                          <h3 className="tracking-[0.1em] uppercase border-b border-white/20 pb-2 text-sm">
                            Service Details
                          </h3>
                          <div className="space-y-2 text-white/70 text-sm">
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

                        {/* Status Actions */}
                        <div className="pt-4 border-t border-white/20">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              disabled={appointment.status === 'confirmed'}
                              className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 px-4 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50 text-xs"
                            >
                              Bestätigen
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              disabled={appointment.status === 'completed'}
                              className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 px-4 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50 text-xs"
                            >
                              Abgeschlossen
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              disabled={appointment.status === 'cancelled'}
                              className="bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 px-4 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50 text-xs"
                            >
                              Stornieren
                            </button>
                            <button
                              onClick={() => setPaymentDialog({ isOpen: true, appointment })}
                              className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 px-4 py-2 tracking-[0.05em] transition-colors uppercase flex items-center gap-2 text-xs"
                            >
                              <CreditCard className="w-3 h-3" />
                              ZAHLUNG
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              }
            })}
          </div>
        )}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const { startOfWeek, appointments: weekAppointments } = getAppointmentsForWeek(currentDate);
    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-[0.1em] uppercase">
            {formatDateDisplay(currentDate)}
          </h2>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index);
            const dateStr = dayDate.toISOString().split('T')[0];
            const dayAppointments = weekAppointments[dateStr] || [];
            const dayBusySlots = getBusySlotsForDate(dayDate);
            const isToday = dayDate.toDateString() === new Date().toDateString();
            
            return (
              <div key={day} className="border border-white/10 min-h-[200px]">
                <div 
                  className={`p-2 text-center border-b border-white/20 cursor-pointer hover:bg-white/5 transition-colors ${isToday ? 'bg-blue-500/20' : ''}`}
                  onClick={() => navigateToDate(dayDate)}
                >
                  <div className="text-sm font-bold tracking-[0.05em] uppercase">{day}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>
                    {dayDate.getDate()}
                  </div>
                </div>
                <div className="p-1 space-y-1">
                  {/* Appointments */}
                  {dayAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-1 text-xs border ${getStatusColor(appointment.status)} cursor-pointer hover:opacity-80`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(appointment);
                        }}
                      >
                        <div className="font-mono">{formatTime(appointment.appointment_time)}</div>
                        <div className="truncate">{appointment.first_name} {appointment.last_name}</div>
                      </div>
                    ))}
                  
                  {/* Busy Slots */}
                  {dayBusySlots
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className="p-1 text-xs border border-red-500/30 bg-red-500/10 text-red-400 cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBusySlotDialog({ isOpen: true, existingSlot: slot });
                        }}
                      >
                        <div className="font-mono">{formatTime(slot.start_time)}</div>
                        <div className="truncate">{slot.title}</div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const { firstDay, appointments: monthAppointments } = getAppointmentsForMonth(currentDate);
    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    
    // Get the first Monday of the month (or previous month)
    const startDate = new Date(firstDay);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    const calendarDays = [];
    const calendarDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      calendarDays.push(new Date(calendarDate));
      calendarDate.setDate(calendarDate.getDate() + 1);
    }
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-[0.1em] uppercase">
            {formatDateDisplay(currentDate)}
          </h2>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-bold tracking-[0.05em] uppercase text-white/60 border-b border-white/20">
              {day}
            </div>
          ))}
          
          {calendarDays.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayAppointments = monthAppointments[dateStr] || [];
            const dayBusySlots = getBusySlotsForDate(date);
            const isCurrentMonth = date.getMonth() === firstDay.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[120px] border border-white/10 p-1 cursor-pointer hover:bg-white/5 transition-colors ${
                  isCurrentMonth ? 'bg-white/5' : 'bg-white/2'
                } ${isToday ? 'ring-2 ring-blue-400/50' : ''}`}
                onClick={() => navigateToDate(date)}
              >
                <div className={`text-sm font-bold mb-1 ${isCurrentMonth ? 'text-white' : 'text-white/40'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {/* Show appointments and busy slots combined, limit to 3 total */}
                  {[...dayAppointments.slice(0, 2), ...dayBusySlots.slice(0, 1)]
                    .sort((a, b) => {
                      const timeA = 'appointment_time' in a ? a.appointment_time : a.start_time;
                      const timeB = 'appointment_time' in b ? b.appointment_time : b.start_time;
                      return timeA.localeCompare(timeB);
                    })
                    .slice(0, 3)
                    .map((item) => {
                      if ('appointment_time' in item) {
                        // It's an appointment
                        const appointment = item as Appointment;
                        return (
                          <div
                            key={appointment.id}
                            className={`p-1 text-xs border ${getStatusColor(appointment.status)} cursor-pointer hover:opacity-80`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(appointment);
                            }}
                          >
                            <div className="font-mono">{formatTime(appointment.appointment_time)}</div>
                            <div className="truncate">{appointment.first_name}</div>
                          </div>
                        );
                      } else {
                        // It's a busy slot
                        const slot = item as BusySlot;
                        return (
                          <div
                            key={slot.id}
                            className="p-1 text-xs border border-red-500/30 bg-red-500/10 text-red-400 cursor-pointer hover:opacity-80"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBusySlotDialog({ isOpen: true, existingSlot: slot });
                            }}
                          >
                            <div className="font-mono">{formatTime(slot.start_time)}</div>
                            <div className="truncate">{slot.title}</div>
                          </div>
                        );
                      }
                    })}
                  
                  {(dayAppointments.length + dayBusySlots.length) > 3 && (
                    <div className="text-xs text-white/60 text-center">
                      +{(dayAppointments.length + dayBusySlots.length) - 3} weitere
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60 uppercase tracking-[0.05em]">Termine werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
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

  return (
    <div className="bg-black">
      {/* Header */}
      <TabHeader
        title="Kalender"
        subtitle={formatDateDisplay(currentDate)}
      >
        <Button 
          variant="primaryOutline"
          size="dashboard"
          icon={<CalendarPlus />}
          onClick={() => setBusySlotDialog({ isOpen: true, selectedDate: currentDate })}
          className="hidden sm:flex"
        >
          Zeitblock reservieren
        </Button>

        <Button 
          variant="primaryOutline"
          size="icon"
          iconOnly
          icon={<CalendarPlus />}
          onClick={() => setBusySlotDialog({ isOpen: true, selectedDate: currentDate })}
          title="Zeitblock reservieren"
          className="sm:hidden"
        />

        <Button 
          variant="primaryOutline"
          size="dashboard"
          icon={<RefreshCw />}
          onClick={fetchData}
          className="hidden sm:flex"
        >
          Aktualisieren
        </Button>

        <Button 
          variant="primaryOutline"
          size="icon"
          iconOnly
          icon={<RefreshCw />}
          onClick={fetchData}
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
          size="icon"
          iconOnly
          icon={isFullscreen ? <Minimize2 /> : <Maximize2 />}
          onClick={handleFullscreenToggle}
          title={isFullscreen ? 'Verkleinern' : 'Vollbild'}
          className="sm:hidden"
        />
      </TabHeader>

      {/* Content */}
      <div className="space-y-6">
        {/* View Toggle using SegmentPicker */}
        <div className="w-full">
          <SegmentPicker
            options={calendarOptions}
            selectedOption={view === 'day' ? 'Tag' : view === 'week' ? 'Woche' : 'Monat'}
            onOptionChange={handleViewChange}
            className="w-full"
            variant="calendar"
            primaryOptions={calendarOptions}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigateDate('prev')}
            className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black p-3 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className={`px-6 py-3 tracking-[0.05em] transition-colors uppercase ${
              isCurrentDateToday()
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                : 'bg-transparent border border-white/20 text-white hover:bg-white hover:text-black'
            }`}
          >
            Heute
          </button>
          
          <button
            onClick={() => navigateDate('next')}
            className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black p-3 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Content */}
        <div className="min-h-[400px]">
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl tracking-[0.1em] uppercase">Termin Details</h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black p-2 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="tracking-[0.1em] uppercase border-b border-white/20 pb-2">
                    Kundeninformationen
                  </h3>
                  <div className="space-y-2 text-white/70">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="uppercase">
                        {selectedAppointment.first_name} {selectedAppointment.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{selectedAppointment.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="uppercase">{selectedAppointment.phone}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="uppercase">Geschlecht: {selectedAppointment.gender}</p>
                      {selectedAppointment.service?.hair_length && (
                        <p className="uppercase">Haarlänge: {selectedAppointment.service.hair_length}</p>
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
                    <p className="uppercase">Service: {selectedAppointment.service?.service_group?.title || 'N/A'}</p>
                    <p className="uppercase">Dauer: {selectedAppointment.service?.duration_minutes || 'N/A'} Min</p>
                    <p className="uppercase">Preis: {selectedAppointment.service?.price_euros ? `${selectedAppointment.service.price_euros.toFixed(2)}€` : 'N/A'}</p>
                    {selectedAppointment.special_requests && (
                      <div>
                        <p className="uppercase text-white/90 mb-1">Besondere Wünsche:</p>
                        <p className="uppercase text-white/70">{selectedAppointment.special_requests}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="pt-4 border-t border-white/20">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                      disabled={selectedAppointment.status === 'confirmed'}
                      className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 px-6 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50"
                    >
                      Bestätigen
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                      disabled={selectedAppointment.status === 'completed'}
                      className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 px-6 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50"
                    >
                      Abgeschlossen
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
                      disabled={selectedAppointment.status === 'cancelled'}
                      className="bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 px-6 py-2 tracking-[0.05em] transition-colors uppercase disabled:opacity-50"
                    >
                      Stornieren
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppointment(null);
                        setPaymentDialog({ isOpen: true, appointment: selectedAppointment });
                      }}
                      className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 px-6 py-2 tracking-[0.05em] transition-colors uppercase flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      ZAHLUNG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Busy Slot Dialog */}
      <BusySlotDialog
        isOpen={busySlotDialog.isOpen}
        onClose={() => setBusySlotDialog({ isOpen: false })}
        selectedDate={busySlotDialog.selectedDate}
        existingSlot={busySlotDialog.existingSlot}
        onSave={handleSaveBusySlot}
        onDelete={busySlotDialog.existingSlot ? handleDeleteBusySlot : undefined}
      />
    </div>
  );
}
