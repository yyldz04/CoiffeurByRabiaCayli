"use client";

import { useState, useEffect } from "react";
import { Clock, Loader2 } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface TimeSlotsProps {
  selectedDate: string;
  serviceDuration: number; // in minutes
  onTimeSelect: (time: string) => void;
  selectedTime?: string;
}

export function TimeSlots({ selectedDate, serviceDuration, onTimeSelect, selectedTime }: TimeSlotsProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Business hours (9 AM to 6 PM)
  const BUSINESS_START = 9;
  const BUSINESS_END = 18;

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDate, serviceDuration]);

  const fetchAvailableTimeSlots = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/time-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          duration: serviceDuration
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch time slots');
      }

      const data = await response.json();
      setTimeSlots(data.timeSlots || []);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch time slots');
      // Fallback to generating basic time slots
      generateBasicTimeSlots();
    } finally {
      setLoading(false);
    }
  };

  const generateBasicTimeSlots = () => {
    const slots: TimeSlot[] = [];
    
    for (let hour = BUSINESS_START; hour < BUSINESS_END; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot + duration would exceed business hours
        const endHour = hour + Math.floor((minute + serviceDuration) / 60);
        const endMinute = (minute + serviceDuration) % 60;
        
        if (endHour < BUSINESS_END || (endHour === BUSINESS_END && endMinute === 0)) {
          slots.push({
            time: timeStr,
            available: true
          });
        }
      }
    }
    
    setTimeSlots(slots);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  if (!selectedDate) {
    return (
      <div className="bg-black border border-white/20 p-6 text-center">
        <Clock className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <p className="text-white/60 uppercase tracking-[0.05em]">
          Wählen Sie zuerst ein Datum aus
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-white/20 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-white/60" />
        <h3 className="text-lg font-bold tracking-[0.1em] uppercase">
          Verfügbare Zeiten für {new Date(selectedDate).toLocaleDateString('de-AT')}
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
          <span className="ml-2 text-white/60 uppercase tracking-[0.05em]">
            Lade verfügbare Zeiten...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-400 uppercase tracking-[0.05em] text-sm mb-2">
            {error}
          </p>
          <p className="text-white/60 uppercase tracking-[0.05em] text-xs">
            Grundlegende Zeiten werden angezeigt
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              slot.available && onTimeSelect(slot.time);
            }}
            disabled={!slot.available}
            className={`
              p-3 text-sm font-mono transition-colors border
              ${slot.available
                ? selectedTime === slot.time
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white/40'
                : 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
              }
            `}
            title={slot.reason || (slot.available ? 'Verfügbar' : 'Nicht verfügbar')}
          >
            {formatTime(slot.time)}
          </button>
        ))}
      </div>

      {timeSlots.length === 0 && !loading && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 uppercase tracking-[0.05em]">
            Keine verfügbaren Zeiten an diesem Tag
          </p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="flex items-center justify-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white"></div>
            <span>Ausgewählt</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-transparent border border-white/20"></div>
            <span>Verfügbar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white/5"></div>
            <span>Besetzt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
