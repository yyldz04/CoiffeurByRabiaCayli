"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { RefreshCw, Plus, Trash2, Settings, Copy, Calendar as CalendarIcon, Maximize2, Minimize2 } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

// Types
interface CalendarToken {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

interface NewTokenData {
  name: string;
  description: string;
  permissions: string[];
  expires_days?: number;
}

interface CalendarTabProps {
  onFullscreenToggle: (isFullscreen: boolean) => void;
}

export function CalendarTab({ onFullscreenToggle }: CalendarTabProps) {
  const [tokens, setTokens] = useState<CalendarToken[]>([]);
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tokens' | 'settings'>('tokens');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Token management state
  const [showCreateToken, setShowCreateToken] = useState(false);
  const [newToken, setNewToken] = useState<NewTokenData>({
    name: '',
    description: '',
    permissions: ['appointments', 'busy_slots'],
    expires_days: undefined
  });
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  
  // Settings state
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<CalendarSettings | null>(null);

  const handleFullscreenToggle = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    onFullscreenToggle(newFullscreenState);
  };

  // Fetch calendar tokens
  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/calendar/tokens');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tokens');
      }
      
      setTokens(data.tokens || []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setError(`Fehler beim Laden der Tokens: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Fetch calendar settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/calendar/settings');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings');
      }
      
      // Convert settings object to typed object
      const settingsObj: CalendarSettings = {
        calendar_name: data.settings.calendar_name?.value || 'CBRC Termine',
        calendar_description: data.settings.calendar_description?.value || 'Coiffeur by Rabia Cayli - Termine und Zeitblöcke',
        calendar_timezone: data.settings.calendar_timezone?.value || 'Europe/Vienna',
        calendar_contact_email: data.settings.calendar_contact_email?.value || '',
        calendar_contact_phone: data.settings.calendar_contact_phone?.value || '',
        calendar_website: data.settings.calendar_website?.value || '',
        calendar_location: data.settings.calendar_location?.value || '',
        calendar_refresh_interval: data.settings.calendar_refresh_interval?.value || '3600',
        calendar_max_events: data.settings.calendar_max_events?.value || '1000'
      };
      
      setSettings(settingsObj);
      setTempSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(`Fehler beim Laden der Einstellungen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Create new token
  const createToken = async () => {
    try {
      const response = await fetch('/api/calendar/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newToken),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create token');
      }
      
      setCreatedToken(data.token.token);
      setShowTokenDialog(true);
      setShowCreateToken(false);
      setNewToken({
        name: '',
        description: '',
        permissions: ['appointments', 'busy_slots'],
        expires_days: undefined
      });
      fetchTokens();
    } catch (error) {
      console.error('Error creating token:', error);
      setError(`Fehler beim Erstellen des Tokens: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Delete token
  const deleteToken = async (tokenId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Token löschen möchten?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/calendar/tokens/${tokenId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete token');
      }
      
      fetchTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
      setError(`Fehler beim Löschen des Tokens: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Toggle token status
  const toggleTokenStatus = async (tokenId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/calendar/tokens/${tokenId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update token');
      }
      
      fetchTokens();
    } catch (error) {
      console.error('Error updating token:', error);
      setError(`Fehler beim Aktualisieren des Tokens: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Update settings
  const updateSettings = async () => {
    if (!tempSettings) return;
    
    try {
      const response = await fetch('/api/calendar/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempSettings),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }
      
      setSettings(tempSettings);
      setEditingSettings(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(`Fehler beim Aktualisieren der Einstellungen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Generate calendar URL
  const generateCalendarUrl = (token: string | null) => {
    if (!token) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/calendar/feed.ics?token=${token}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchTokens(), fetchSettings()]);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60 uppercase tracking-[0.05em]">Kalender-Einstellungen werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 uppercase tracking-[0.05em]">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="primaryOutline"
          size="default"
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="Kalender-Integration"
        subtitle="iCal-Feeds für Apple Calendar, Google Calendar und andere Anwendungen"
      >
        <Button 
          variant="primaryOutline"
          size="dashboard"
          icon={<RefreshCw />}
          onClick={() => {
            fetchTokens();
            fetchSettings();
          }}
          className="hidden sm:flex"
        >
          Aktualisieren
        </Button>

        <Button 
          variant="primaryOutline"
          size="icon"
          iconOnly
          icon={<RefreshCw />}
          onClick={() => {
            fetchTokens();
            fetchSettings();
          }}
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

      {/* Tab Navigation */}
      <div className="flex border-b border-white/20">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-4 py-2 tracking-[0.05em] uppercase transition-colors ${
            activeTab === 'tokens'
              ? 'border-b-2 border-white text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Tokens
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 tracking-[0.05em] uppercase transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-white text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Einstellungen
        </button>
      </div>

      {/* Tokens Tab */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          {/* Create Token Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl tracking-[0.1em] uppercase">Kalender-Tokens</h2>
            <Button
              onClick={() => setShowCreateToken(true)}
              variant="primaryOutline"
              size="default"
              icon={<Plus />}
            >
              Neuen Token erstellen
            </Button>
          </div>

          {/* Tokens List */}
          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 uppercase tracking-[0.05em]">Keine Tokens vorhanden</p>
              <p className="text-white/40 text-sm mt-2">Erstellen Sie einen Token, um Kalender-Feeds zu aktivieren</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div key={token.id} className="border border-white/20 bg-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg tracking-[0.05em] uppercase">{token.name}</h3>
                      {token.description && (
                        <p className="text-white/60 text-sm">{token.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs uppercase tracking-[0.05em] border ${
                        token.is_active 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {token.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <Button
                        onClick={() => toggleTokenStatus(token.id, token.is_active)}
                        variant="secondary"
                        size="sm"
                      >
                        {token.is_active ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                      <Button
                        onClick={() => deleteToken(token.id)}
                        variant="secondary"
                        size="sm"
                        icon={<Trash2 />}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/60 uppercase tracking-[0.05em] mb-1">Berechtigungen:</p>
                      <p className="text-white/80">
                        {token.permissions.includes('appointments') && 'Termine '}
                        {token.permissions.includes('busy_slots') && 'Zeitblöcke'}
                      </p>
                    </div>
                    
                    {token.expires_at && (
                      <div>
                        <p className="text-white/60 uppercase tracking-[0.05em] mb-1">Läuft ab:</p>
                        <p className="text-white/80">
                          {new Date(token.expires_at).toLocaleDateString('de-AT')}
                        </p>
                      </div>
                    )}
                    
                    {token.last_used_at && (
                      <div>
                        <p className="text-white/60 uppercase tracking-[0.05em] mb-1">Zuletzt verwendet:</p>
                        <p className="text-white/80">
                          {new Date(token.last_used_at).toLocaleDateString('de-AT')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl tracking-[0.1em] uppercase">Kalender-Einstellungen</h2>
            <Button
              onClick={() => setEditingSettings(!editingSettings)}
              variant="primaryOutline"
              size="default"
              icon={<Settings />}
            >
              {editingSettings ? 'Abbrechen' : 'Bearbeiten'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Kalender-Name
                </label>
                <input
                  type="text"
                  value={editingSettings ? tempSettings?.calendar_name || '' : settings.calendar_name}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_name: e.target.value
                  })}
                  disabled={!editingSettings}
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={editingSettings ? tempSettings?.calendar_description || '' : settings.calendar_description}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_description: e.target.value
                  })}
                  disabled={!editingSettings}
                  rows={3}
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Zeitzone
                </label>
                <input
                  type="text"
                  value={editingSettings ? tempSettings?.calendar_timezone || '' : settings.calendar_timezone}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_timezone: e.target.value
                  })}
                  disabled={!editingSettings}
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Kontakt-E-Mail
                </label>
                <input
                  type="email"
                  value={editingSettings ? tempSettings?.calendar_contact_email || '' : settings.calendar_contact_email}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_contact_email: e.target.value
                  })}
                  disabled={!editingSettings}
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Kontakt-Telefon
                </label>
                <input
                  type="tel"
                  value={editingSettings ? tempSettings?.calendar_contact_phone || '' : settings.calendar_contact_phone}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_contact_phone: e.target.value
                  })}
                  disabled={!editingSettings}
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={editingSettings ? tempSettings?.calendar_website || '' : settings.calendar_website}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_website: e.target.value
                  })}
                  disabled={!editingSettings}
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Standort
                </label>
                <input
                  type="text"
                  value={editingSettings ? tempSettings?.calendar_location || '' : settings.calendar_location}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_location: e.target.value
                  })}
                  disabled={!editingSettings}
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Aktualisierungsintervall (Sekunden)
                </label>
                <input
                  type="number"
                  value={editingSettings ? tempSettings?.calendar_refresh_interval || '' : settings.calendar_refresh_interval}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_refresh_interval: e.target.value
                  })}
                  disabled={!editingSettings}
                  min="300"
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                  Maximale Anzahl Ereignisse
                </label>
                <input
                  type="number"
                  value={editingSettings ? tempSettings?.calendar_max_events || '' : settings.calendar_max_events}
                  onChange={(e) => editingSettings && setTempSettings({
                    ...tempSettings!,
                    calendar_max_events: e.target.value
                  })}
                  disabled={!editingSettings}
                  min="1"
                  max="5000"
                  className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em] disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {editingSettings && (
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  setTempSettings(settings);
                  setEditingSettings(false);
                }}
                variant="secondary"
                size="default"
              >
                Abbrechen
              </Button>
              <Button
                onClick={updateSettings}
                variant="primaryOutline"
                size="default"
              >
                Speichern
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Token Dialog */}
      <Dialog open={showCreateToken} onOpenChange={setShowCreateToken}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Token erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                Name
              </label>
              <input
                type="text"
                value={newToken.name}
                onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em]"
                placeholder="z.B. Apple Calendar Token"
              />
            </div>

            <div>
              <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                Beschreibung
              </label>
              <textarea
                value={newToken.description}
                onChange={(e) => setNewToken({ ...newToken, description: e.target.value })}
                rows={3}
                className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em]"
                placeholder="Optionale Beschreibung für den Token"
              />
            </div>

            <div>
              <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                Berechtigungen
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newToken.permissions.includes('appointments')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewToken({
                          ...newToken,
                          permissions: [...newToken.permissions, 'appointments']
                        });
                      } else {
                        setNewToken({
                          ...newToken,
                          permissions: newToken.permissions.filter(p => p !== 'appointments')
                        });
                      }
                    }}
                    className="text-white"
                  />
                  <span className="text-white/80">Termine</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newToken.permissions.includes('busy_slots')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewToken({
                          ...newToken,
                          permissions: [...newToken.permissions, 'busy_slots']
                        });
                      } else {
                        setNewToken({
                          ...newToken,
                          permissions: newToken.permissions.filter(p => p !== 'busy_slots')
                        });
                      }
                    }}
                    className="text-white"
                  />
                  <span className="text-white/80">Zeitblöcke</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-white/60 uppercase tracking-[0.05em] text-sm mb-2">
                Ablaufzeit (Tage) - Optional
              </label>
              <input
                type="number"
                value={newToken.expires_days || ''}
                onChange={(e) => setNewToken({ 
                  ...newToken, 
                  expires_days: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                min="1"
                className="w-full bg-black border border-white/20 text-white p-3 tracking-[0.05em]"
                placeholder="Leer lassen für unbegrenzte Gültigkeit"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                onClick={() => setShowCreateToken(false)}
                variant="secondary"
                size="default"
              >
                Abbrechen
              </Button>
              <Button
                onClick={createToken}
                variant="primaryOutline"
                size="default"
                disabled={!newToken.name.trim() || newToken.permissions.length === 0}
              >
                Token erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Token Created Dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Token erstellt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/80">
              Der Token wurde erfolgreich erstellt. Kopieren Sie ihn jetzt, da er nicht erneut angezeigt wird.
            </p>
            
            <div className="bg-black border border-white/20 p-4">
              <div className="flex items-center justify-between">
                <code className="text-white/80 text-sm break-all">{createdToken}</code>
                <Button
                  onClick={() => createdToken && copyToClipboard(createdToken)}
                  variant="secondary"
                  size="sm"
                  icon={<Copy />}
                >
                  Kopieren
                </Button>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 p-4">
              <h4 className="text-blue-400 uppercase tracking-[0.05em] text-sm mb-2">
                Kalender-URL:
              </h4>
              <div className="flex items-center justify-between">
                <code className="text-blue-300 text-sm break-all">
                  {generateCalendarUrl(createdToken)}
                </code>
                <Button
                  onClick={() => createdToken && copyToClipboard(generateCalendarUrl(createdToken))}
                  variant="secondary"
                  size="sm"
                  icon={<Copy />}
                >
                  Kopieren
                </Button>
              </div>
            </div>

            <div className="text-sm text-white/60">
              <p className="mb-2">
                <strong>So verwenden Sie den Token:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Kopieren Sie die Kalender-URL</li>
                <li>Öffnen Sie Ihre Kalender-App (Apple Calendar, Google Calendar, etc.)</li>
                <li>Fügen Sie die URL als &quot;Kalender abonnieren&quot; hinzu</li>
                <li>Der Kalender wird automatisch aktualisiert</li>
              </ol>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setShowTokenDialog(false)}
                variant="primaryOutline"
                size="default"
              >
                Verstanden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
