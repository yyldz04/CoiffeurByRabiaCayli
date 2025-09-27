"use client";

import { useState } from "react";
import { Calendar, Clock, X, Save, Trash2 } from "lucide-react";

interface BusySlot {
  id?: string;
  start_datetime: string;  // ISO timestamp string
  end_datetime: string;    // ISO timestamp string
  title: string;
  description?: string;
}

interface BusySlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onSave: (slot: Omit<BusySlot, 'id'>) => Promise<void>;
  onDelete?: (slotId: string) => Promise<void>;
  existingSlot?: BusySlot;
}

export function BusySlotDialog({
  isOpen,
  onClose,
  selectedDate,
  onSave,
  onDelete,
  existingSlot
}: BusySlotDialogProps) {
  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to format time as HH:MM
  const formatTimeLocal = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Initialize form data from existing slot or selected date
  const initializeFormData = (): {
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    title: string;
    description: string;
  } => {
    if (existingSlot) {
      const startDate = new Date(existingSlot.start_datetime);
      const endDate = new Date(existingSlot.end_datetime);
      
      return {
        start_date: formatDateLocal(startDate),
        end_date: formatDateLocal(endDate),
        start_time: formatTimeLocal(startDate),
        end_time: formatTimeLocal(endDate),
        title: existingSlot.title,
        description: existingSlot.description || ''
      };
    } else if (selectedDate) {
      return {
        start_date: formatDateLocal(selectedDate),
        end_date: formatDateLocal(selectedDate),
        start_time: '09:00',
        end_time: '17:00',
        title: 'Besetzt',
        description: ''
      };
    } else {
      const today = new Date();
      return {
        start_date: formatDateLocal(today),
        end_date: formatDateLocal(today),
        start_time: '09:00',
        end_time: '17:00',
        title: 'Besetzt',
        description: ''
      };
    }
  };

  const [formData, setFormData] = useState(initializeFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate time range
      if (formData.start_date === formData.end_date) {
        if (formData.start_time >= formData.end_time) {
          throw new Error('Endzeit muss nach der Startzeit liegen');
        }
      }

      // Validate date range
      if (formData.end_date < formData.start_date) {
        throw new Error('Enddatum muss nach dem Startdatum liegen');
      }

      // Convert form data to TIMESTAMP format
      const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
      const endDateTime = `${formData.end_date}T${formData.end_time}:00`;

      const slotData: Omit<BusySlot, 'id'> = {
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        title: formData.title,
        description: formData.description || undefined
      };

      await onSave(slotData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSlot?.id || !onDelete) return;
    
    setError(null);
    setIsLoading(true);

    try {
      await onDelete(existingSlot.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-year functionality for date inputs
  const handleDateInputChange = (field: 'start_date' | 'end_date', value: string) => {
    // If user enters only day/month (DD-MM or DD.MM), append current year
    const currentYear = new Date().getFullYear();
    let processedValue = value;
    
    if (value && !value.includes('-') && (value.includes('.') || value.includes('/'))) {
      const parts = value.split(/[./]/);
      if (parts.length === 2 && parts[0].length <= 2 && parts[1].length <= 2) {
        // Format as DD-MM-YYYY
        processedValue = `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${currentYear}`;
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'start_date' || field === 'end_date') {
      handleDateInputChange(field, value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-white/20 max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl tracking-[0.1em] uppercase flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {existingSlot ? 'Zeitblock bearbeiten' : 'Zeitblock reservieren'}
            </h2>
            <button
              onClick={onClose}
              className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                  Startdatum
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full bg-transparent border border-white/20 text-white px-3 py-2 focus:border-white/40 focus:outline-none"
                  required
                />
                <p className="text-xs text-white/50 mt-1">
                  Oder Tag.Monat eingeben (z.B. 15.12)
                </p>
              </div>
              <div>
                <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                  Enddatum
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full bg-transparent border border-white/20 text-white px-3 py-2 focus:border-white/40 focus:outline-none"
                  required
                />
                <p className="text-xs text-white/50 mt-1">
                  Für mehrtägige Blöcke
                </p>
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                  Startzeit
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className="w-full bg-transparent border border-white/20 text-white px-10 py-2 focus:border-white/40 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                  Endzeit
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className="w-full bg-transparent border border-white/20 text-white px-10 py-2 focus:border-white/40 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-transparent border border-white/20 text-white px-3 py-2 focus:border-white/40 focus:outline-none"
                placeholder="z.B. Mittagspause, Privattermin"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                Beschreibung (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-transparent border border-white/20 text-white px-3 py-2 focus:border-white/40 focus:outline-none h-20 resize-none"
                placeholder="Zusätzliche Informationen..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 px-4 py-2 tracking-[0.05em] transition-colors uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Speichern...' : 'Speichern'}
              </button>
              
              {existingSlot && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 px-4 py-2 tracking-[0.05em] transition-colors uppercase flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
