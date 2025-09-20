"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, AlertTriangle } from "lucide-react";
import { Toggle } from "./ui/toggle";

interface SettingsData {
  maintenance_mode: boolean;
  maintenance_message: string;
  updated_at?: string;
}

export function SettingsTab() {
  const [settings, setSettings] = useState<SettingsData>({
    maintenance_mode: false,
    maintenance_message: "Wir sind bald wieder da!",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Einstellungen');
      }
      
      const data = await response.json();
      setSettings(data.settings || {
        maintenance_mode: false,
        maintenance_message: "Wir sind bald wieder da!",
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setError(`Fehler beim Laden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Speichern');
      }
      
      setSuccess('Einstellungen erfolgreich gespeichert!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(`Fehler beim Speichern: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof SettingsData, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/60 uppercase tracking-[0.05em]">Einstellungen werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl tracking-[0.2em] mb-2 uppercase flex items-center gap-3">
            Einstellungen
          </h1>
          <p className="text-white/60 uppercase">
            Website-Konfiguration und Wartungsmodus
          </p>
        </div>
        <button 
          onClick={loadSettings}
          disabled={isLoading || isSaving}
          className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black px-6 py-3 tracking-[0.05em] transition-colors uppercase flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-red-400 uppercase tracking-[0.05em]">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="border border-green-500/50 bg-green-500/10 p-4">
          <p className="text-green-400 uppercase tracking-[0.05em]">{success}</p>
        </div>
      )}

      {/* Maintenance Mode Section */}
      <div className="border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl tracking-[0.1em] uppercase">Wartungsmodus</h2>
        </div>
        
        <div className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg tracking-[0.05em] uppercase mb-2">Wartungsmodus aktivieren</h3>
              <p className="text-white/60 text-sm">
                Wenn aktiviert, wird die Website für Besucher gesperrt und zeigt eine Wartungsnachricht an.
              </p>
            </div>
            <Toggle
              active={settings.maintenance_mode}
              onToggle={(active) => handleInputChange('maintenance_mode', active)}
            />
          </div>

          {/* Warning when maintenance mode is active */}
          {settings.maintenance_mode && (
            <div className="border border-yellow-500/50 bg-yellow-500/10 p-4">
              <p className="text-yellow-400 uppercase tracking-[0.05em] text-sm">
                ⚠️ Wartungsmodus ist aktiv! Die Website ist für Besucher gesperrt.
              </p>
            </div>
          )}

          {/* Maintenance Message */}
          <div>
            <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
              Wartungsnachricht
            </label>
            <textarea
              value={settings.maintenance_message}
              onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
              className="w-full bg-transparent border border-white/20 text-white px-4 py-3 focus:border-white focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="z.B. 'Coming Soon', 'Wir sind bald wieder da!', etc."
            />
            <p className="text-xs text-white/50 mt-2">
              Diese Nachricht wird Besuchern angezeigt, wenn der Wartungsmodus aktiv ist.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center pt-6 border-t border-white/20">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 px-8 py-3 tracking-[0.05em] transition-colors uppercase flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Speichern...' : 'Einstellungen speichern'}
        </button>
      </div>

      {/* Last Updated */}
      {settings.updated_at && (
        <div className="text-center">
          <p className="text-xs text-white/40 uppercase tracking-[0.05em]">
            Zuletzt aktualisiert: {new Date(settings.updated_at).toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })}
          </p>
        </div>
      )}
    </div>
  );
}
