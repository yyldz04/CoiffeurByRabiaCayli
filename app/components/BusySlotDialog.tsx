"use client";

import { useState } from "react";
import { Calendar, Clock, X, Save, Trash2 } from "lucide-react";

interface BusySlot {
  id?: string;
  busy_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
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
  const [formData, setFormData] = useState<Omit<BusySlot, 'id'>>({
    busy_date: existingSlot?.busy_date || selectedDate?.toISOString().split('T')[0] || '',
    end_date: existingSlot?.end_date || '',
    start_time: existingSlot?.start_time || '',
    end_time: existingSlot?.end_time || '',
    title: existingSlot?.title || 'Besetzt',
    description: existingSlot?.description || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate time range
      if (formData.start_time >= formData.end_time) {
        throw new Error('Endzeit muss nach der Startzeit liegen');
      }

      // Validate date range
      if (formData.end_date && formData.end_date < formData.busy_date) {
        throw new Error('Enddatum muss nach dem Startdatum liegen');
      }

      await onSave(formData);
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
  const handleDateInputChange = (field: 'busy_date' | 'end_date', value: string) => {
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

  const handleInputChange = (field: keyof Omit<BusySlot, 'id'>, value: string) => {
    if (field === 'busy_date' || field === 'end_date') {
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
                  value={formData.busy_date}
                  onChange={(e) => handleInputChange('busy_date', e.target.value)}
                  className="w-full bg-transparent border border-white/20 text-white px-3 py-2 focus:border-white/40 focus:outline-none"
                  required
                />
                <p className="text-xs text-white/50 mt-1">
                  Oder Tag.Monat eingeben (z.B. 15.12)
                </p>
              </div>
              <div>
                <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                  Enddatum (optional)
                </label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full bg-transparent border border-white/20 text-white px-3 py-2 focus:border-white/40 focus:outline-none"
                  placeholder="Für mehrtägige Blöcke"
                />
                <p className="text-xs text-white/50 mt-1">
                  Leer lassen für einzelne Tage
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
