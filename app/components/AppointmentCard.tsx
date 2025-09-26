"use client";

import { Button } from "./ui/button";
import { StatusBadge } from "./StatusBadge";
import { ActiveBadge } from "./ActiveBadge";
import { Clock, User, Mail, Phone, CreditCard } from "lucide-react";
import { Appointment } from '../utils/supabase/client';

interface AppointmentCardProps {
  appointment: Appointment;
  currentTime: Date;
  isExpanded: boolean;
  isAutoExpanded: boolean;
  onToggle: (appointmentId: string) => void;
  onStatusUpdate: (appointmentId: string, newStatus: string) => void;
  onPaymentOpen: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  currentTime,
  isExpanded,
  isAutoExpanded,
  onToggle,
  onStatusUpdate,
  onPaymentOpen
}: AppointmentCardProps) {

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

  return (
    <div className={`font-sans border border-white/20 ${isAutoExpanded ? 'border-purple-400/50 bg-purple-400/5' : ''}`}>
      {/* Desktop Layout */}
      <div 
        className="w-full p-4 hover:bg-white/5 transition-colors cursor-pointer hidden sm:block"
        onClick={() => onToggle(appointment.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/60" />
              <span className="font-sans tracking-[0.05em] uppercase">
                {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-white/60" />
              <span className="font-sans tracking-[0.05em] uppercase">
                {appointment.first_name} {appointment.last_name}
              </span>
            </div>
            <StatusBadge status={appointment.status} size="xs" />
            {isAutoExpanded && <ActiveBadge size="xs" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-white/60 tracking-[0.05em] uppercase">
              {appointment.service?.service_group?.title || 'Service'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div 
        className="w-full p-4 hover:bg-white/5 transition-colors cursor-pointer sm:hidden"
        onClick={() => onToggle(appointment.id)}
      >
        <div className="flex flex-col space-y-3">
          {/* Date and Time */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/60" />
            <span className="font-sans tracking-[0.05em] uppercase text-sm">
              {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
            </span>
          </div>
          
          {/* Client Name */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-white/60" />
            <span className="font-sans tracking-[0.05em] uppercase text-sm">
              {appointment.first_name} {appointment.last_name}
            </span>
          </div>
          
          {/* Service */}
          <div className="font-sans text-white/60 tracking-[0.05em] uppercase text-sm">
            {appointment.service?.service_group?.title || 'Service'}
          </div>
          
          {/* Status and Payment Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusBadge status={appointment.status} size="xs" />
              {isAutoExpanded && <ActiveBadge size="xs" />}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onPaymentOpen(appointment);
                }}
                variant="payment"
                size="iconSm"
                iconOnly
                title="Zahlung"
              >
                <CreditCard />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-white/20 p-6 bg-white/2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-sans tracking-[0.1em] uppercase border-b border-white/20 pb-2">
                Kundeninformationen
              </h3>
              <div className="space-y-2 text-white/70">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-sans uppercase">
                    {appointment.first_name} {appointment.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-sans">{appointment.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-sans uppercase">{appointment.phone}</span>
                </div>
                <div className="space-y-1">
                  <p className="font-sans uppercase">Geschlecht: {appointment.gender}</p>
                  {appointment.service?.hair_length && (
                    <p className="font-sans uppercase">Haarlänge: {appointment.service.hair_length}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-4">
              <h3 className="font-sans tracking-[0.1em] uppercase border-b border-white/20 pb-2">
                Service Details
              </h3>
              <div className="space-y-2 text-white/70">
                <p className="font-sans uppercase">Service: {appointment.service?.service_group?.title || 'N/A'}</p>
                <p className="font-sans uppercase">Dauer: {appointment.service?.duration_minutes || 'N/A'} Min</p>
                <p className="font-sans uppercase">Preis: {appointment.service?.price_euros ? `${appointment.service.price_euros.toFixed(2)}€` : 'N/A'}</p>
                {appointment.special_requests && (
                  <div>
                    <p className="font-sans uppercase text-white/90 mb-1">Besondere Wünsche:</p>
                    <p className="font-sans uppercase text-white/70">{appointment.special_requests}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
                disabled={appointment.status === 'confirmed'}
                variant="success"
                size="sm"
              >
                Bestätigen
              </Button>
              <Button
                onClick={() => onStatusUpdate(appointment.id, 'completed')}
                disabled={appointment.status === 'completed'}
                variant="info"
                size="sm"
              >
                Abgeschlossen
              </Button>
              <Button
                onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                disabled={appointment.status === 'cancelled'}
                variant="cancel"
                size="sm"
              >
                Stornieren
              </Button>
              <Button
                onClick={() => onStatusUpdate(appointment.id, 'pending')}
                disabled={appointment.status === 'pending'}
                variant="secondary"
                size="sm"
              >
                Ausstehend
              </Button>
              <Button
                onClick={() => onPaymentOpen(appointment)}
                variant="payment"
                size="sm"
                icon={<CreditCard />}
              >
                ZAHLUNG
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-white/40 uppercase tracking-[0.05em] font-sans">
            Erstellt: {new Date(appointment.created_at).toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })}
          </div>
        </div>
      )}
    </div>
  );
}
