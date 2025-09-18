"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { appointmentService } from '../utils/supabase/client';
// import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  hairLength: string;
  service: string;
  date: string;
  time: string;
  requests: string;
}

interface BookingOverviewProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingData;
  services: Array<{ id: string; name: string; duration: string; price: string }>;
}

export function BookingOverview({ isOpen, onClose, bookingData, services }: BookingOverviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const selectedServiceData = services.find(s => s.id === bookingData.service);

  const handleSubmitAppointment = async () => {
    if (!selectedServiceData) {
      setSubmitError('Service-Details nicht gefunden');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const appointmentPayload = {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
        service: bookingData.service,
        gender: bookingData.gender,
        hairLength: bookingData.hairLength,
        date: bookingData.date,
        time: bookingData.time,
        requests: bookingData.requests,
        serviceDetails: {
          serviceName: selectedServiceData.name,
          serviceDuration: selectedServiceData.duration,
          servicePrice: selectedServiceData.price
        }
      };

      // Check for conflicts first
      const hasConflict = await appointmentService.checkConflicts(bookingData.date, bookingData.time);
      if (hasConflict) {
        throw new Error('This time slot is already booked. Please choose a different time.');
      }

      // Create the appointment
      const result = await appointmentService.createAppointment(appointmentPayload);

      setSubmitSuccess(true);
      console.log('Appointment registered successfully:', result);

      // Show success message for a moment then close
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error submitting appointment:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Unbekannter Fehler';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('error' in error) {
          errorMessage = String(error.error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-black border border-white/20 text-white max-w-2xl">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl tracking-[0.15em] uppercase mb-4">TERMIN GEBUCHT!</h2>
            <p className="text-white/70 uppercase">
              Ihr Termin wurde erfolgreich registriert. Sie erhalten eine Bestätigung per E-Mail.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-[0.15em] uppercase text-center">
            ÜBERSICHT
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 mt-6">
          {/* Personal Information */}
          <div className="border border-white/20 p-6">
            <h3 className="tracking-[0.1em] mb-4 uppercase">Persönliche Daten</h3>
            <div className="space-y-2 text-white/70">
              <p className="uppercase">{bookingData.firstName} {bookingData.lastName}</p>
              <p className="uppercase">{bookingData.email}</p>
              <p className="uppercase">{bookingData.phone}</p>
            </div>
          </div>

          {/* Service Details */}
          <div className="border border-white/20 p-6">
            <h3 className="tracking-[0.1em] mb-4 uppercase">Service Details</h3>
            <div className="space-y-2 text-white/70">
              <p className="uppercase">Geschlecht: {bookingData.gender}</p>
              {bookingData.gender === 'DAMEN' && (
                <p className="uppercase">Haarlänge: {bookingData.hairLength}</p>
              )}
              {selectedServiceData && (
                <>
                  <p className="uppercase">Service: {selectedServiceData.name}</p>
                  <p className="uppercase">Dauer: {selectedServiceData.duration}</p>
                  <p className="uppercase">Preis: {selectedServiceData.price}</p>
                </>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="border border-white/20 p-6">
            <h3 className="tracking-[0.1em] mb-4 uppercase">Termin Details</h3>
            <div className="space-y-2 text-white/70">
              <p className="uppercase">Datum: {bookingData.date}</p>
              <p className="uppercase">Uhrzeit: {bookingData.time}</p>
              {bookingData.requests && (
                <p className="uppercase">Besondere Wünsche: {bookingData.requests}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="border border-red-500/30 bg-red-500/5 p-4 text-center">
              <p className="text-red-400 tracking-[0.05em] uppercase">
                {submitError}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent border border-white/20 px-8 py-3 tracking-[0.1em] hover:bg-white hover:text-black transition-colors uppercase disabled:opacity-50"
            >
              Bearbeiten
            </button>
            <button
              onClick={handleSubmitAppointment}
              disabled={isSubmitting}
              className="bg-white text-black border border-white px-8 py-3 tracking-[0.1em] hover:bg-white/90 transition-colors uppercase disabled:opacity-50"
            >
              {isSubmitting ? 'WIRD GEBUCHT...' : 'BESTÄTIGEN'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}