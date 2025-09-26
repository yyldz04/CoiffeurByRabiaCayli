"use client";

import { Button } from "./ui/button";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  LogOut, 
  CreditCard, 
  Settings, 
  Upload, 
  Download,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertTriangle
} from "lucide-react";

/**
 * Comprehensive Button Examples for Dashboard
 * 
 * This file demonstrates all the different button types, variants, sizes, and states
 * available in the unified button system.
 */
export function ButtonExamples() {
  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl tracking-[0.2em] mb-8 uppercase">Button System Examples</h1>
        
        {/* Primary Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Primary Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Add/Create Buttons */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Add/Create</h3>
              <Button variant="primaryOutline" size="dashboard" icon={<Plus className="w-4 h-4" />}>
                Hinzufügen
              </Button>
              <Button variant="primary" size="dashboard" icon={<Plus className="w-4 h-4" />}>
                Neue Kategorie
              </Button>
            </div>

            {/* Save/Submit Buttons */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Save/Submit</h3>
              <Button variant="success" size="dashboard" icon={<Save className="w-4 h-4" />}>
                Speichern
              </Button>
              <Button variant="primary" size="dashboard" loading>
                Speichern...
              </Button>
            </div>

            {/* Cancel Buttons */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Cancel</h3>
              <Button variant="secondary" size="dashboard">
                Abbrechen
              </Button>
              <Button variant="ghost" size="dashboard">
                Zurück
              </Button>
            </div>
          </div>
        </section>

        {/* Status Management */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Status Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Appointment Status */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Appointment Status</h3>
              <Button variant="success" size="dashboardSm">
                Bestätigen
              </Button>
              <Button variant="info" size="dashboardSm">
                Abgeschlossen
              </Button>
              <Button variant="cancel" size="dashboardSm">
                Stornieren
              </Button>
              <Button variant="secondary" size="dashboardSm">
                Ausstehend
              </Button>
            </div>

            {/* Service Toggle */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Service Toggle</h3>
              <Button variant="success" size="sm">
                Aktiv
              </Button>
              <Button variant="danger" size="sm">
                Inaktiv
              </Button>
            </div>

            {/* Action States */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Action States</h3>
              <Button variant="success" state="success" icon={<Check className="w-4 h-4" />}>
                Erfolgreich
              </Button>
              <Button variant="danger" state="error" icon={<X className="w-4 h-4" />}>
                Fehler
              </Button>
              <Button variant="warning" state="loading" icon={<AlertTriangle className="w-4 h-4" />}>
                Warnung
              </Button>
            </div>
          </div>
        </section>

        {/* Secondary Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Secondary Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Edit/Update */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Edit/Update</h3>
              <Button variant="ghost" size="icon" iconOnly icon={<Edit2 className="w-4 h-4" />} />
              <Button variant="ghost" size="iconSm" iconOnly icon={<Edit2 className="w-4 h-4" />} />
            </div>

            {/* Delete Actions */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Delete</h3>
              <Button variant="ghost" size="icon" iconOnly icon={<Trash2 className="w-4 h-4" />} />
              <Button variant="destructive" size="dashboard">
                Löschen
              </Button>
            </div>

            {/* Utility Actions */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Utility</h3>
              <Button variant="secondary" size="dashboard" icon={<RefreshCw className="w-4 h-4" />}>
                Aktualisieren
              </Button>
              <Button variant="secondary" size="dashboard" icon={<CalendarIcon className="w-4 h-4" />}>
                Kalender
              </Button>
            </div>
          </div>
        </section>

        {/* Navigation & Tabs */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Navigation & Tabs</h2>
          
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Tab Navigation</h3>
              <div className="flex border border-white/20">
                <Button variant="tabActive" size="dashboardSm" className="flex-1 rounded-none">
                  TERMINE
                </Button>
                <Button variant="tabInactive" size="dashboardSm" className="flex-1 rounded-none">
                  SERVICES
                </Button>
                <Button variant="tabInactive" size="dashboardSm" className="flex-1 rounded-none">
                  KATEGORIEN
                </Button>
                <Button variant="tabInactive" size="dashboardSm" className="flex-1 rounded-none">
                  EINSTELLUNGEN
                </Button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Category Filters</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="filterActive" size="sm">
                  Alle
                </Button>
                <Button variant="filterInactive" size="sm">
                  ALLGEMEIN
                </Button>
                <Button variant="filterInactive" size="sm">
                  HERREN
                </Button>
                <Button variant="filterInactive" size="sm">
                  FÄRBUNG
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Payment Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Triggers */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Payment Triggers</h3>
              <Button variant="payment" size="icon" iconOnly icon={<CreditCard className="w-4 h-4" />} />
              <Button variant="payment" size="dashboard" icon={<CreditCard className="w-4 h-4" />}>
                ZAHLUNG
              </Button>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Payment Methods</h3>
              <Button variant="secondary" size="payment">
                KARTE
              </Button>
              <Button variant="secondary" size="payment">
                BAR
              </Button>
            </div>
          </div>
        </section>

        {/* Development Tools */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Development Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dev Tools Toggle */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Dev Tools</h3>
              <Button variant="devTools" size="icon" iconOnly icon={<Settings className="w-4 h-4" />} />
            </div>

            {/* Import/Export */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Import/Export</h3>
              <Button variant="import" size="sm" icon={<Upload className="w-4 h-4" />}>
                YAML Import
              </Button>
              <Button variant="export" size="sm" icon={<Download className="w-4 h-4" />}>
                YAML Export
              </Button>
            </div>

            {/* Expand/Collapse */}
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Expand/Collapse</h3>
              <Button variant="ghost" size="icon" iconOnly icon={<ChevronDown className="w-5 h-5" />} />
              <Button variant="ghost" size="icon" iconOnly icon={<ChevronRight className="w-5 h-5" />} />
            </div>
          </div>
        </section>

        {/* Icon-Only Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Icon-Only Buttons</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="ghost" size="icon" iconOnly icon={<Edit2 className="w-4 h-4" />} />
            <Button variant="ghost" size="icon" iconOnly icon={<Trash2 className="w-4 h-4" />} />
            <Button variant="payment" size="icon" iconOnly icon={<CreditCard className="w-4 h-4" />} />
            <Button variant="devTools" size="icon" iconOnly icon={<Settings className="w-4 h-4" />} />
            <Button variant="secondary" size="icon" iconOnly icon={<RefreshCw className="w-4 h-4" />} />
            <Button variant="secondary" size="icon" iconOnly icon={<LogOut className="w-4 h-4" />} />
          </div>
        </section>

        {/* Different Sizes */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Different Sizes</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="primaryOutline" size="xs">Extra Small</Button>
              <Button variant="primaryOutline" size="sm">Small</Button>
              <Button variant="primaryOutline" size="default">Default</Button>
              <Button variant="primaryOutline" size="lg">Large</Button>
              <Button variant="primaryOutline" size="xl">Extra Large</Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="primaryOutline" size="dashboardXs">Dashboard XS</Button>
              <Button variant="primaryOutline" size="dashboardSm">Dashboard SM</Button>
              <Button variant="primaryOutline" size="dashboard">Dashboard</Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="primaryOutline" size="iconSm" iconOnly icon={<Plus className="w-4 h-4" />} />
              <Button variant="primaryOutline" size="icon" iconOnly icon={<Plus className="w-4 h-4" />} />
              <Button variant="primaryOutline" size="iconLg" iconOnly icon={<Plus className="w-4 h-4" />} />
              <Button variant="primaryOutline" size="iconXl" iconOnly icon={<Plus className="w-4 h-4" />} />
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Loading States</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="primaryOutline" size="dashboard" loading>
              Loading...
            </Button>
            <Button variant="success" size="dashboard" loading>
              Speichern...
            </Button>
            <Button variant="destructive" size="dashboard" loading>
              Löschen...
            </Button>
          </div>
        </section>

        {/* Disabled States */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Disabled States</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="primaryOutline" size="dashboard" disabled>
              Disabled Primary
            </Button>
            <Button variant="success" size="dashboard" disabled>
              Disabled Success
            </Button>
            <Button variant="destructive" size="dashboard" disabled>
              Disabled Destructive
            </Button>
          </div>
        </section>

        {/* Icon Positioning */}
        <section className="space-y-6">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Icon Positioning</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Left Icons (Default)</h3>
              <Button variant="primaryOutline" size="dashboard" icon={<Plus className="w-4 h-4" />}>
                Add Item
              </Button>
              <Button variant="success" size="dashboard" icon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg uppercase">Right Icons</h3>
              <Button variant="primaryOutline" size="dashboard" icon={<Plus className="w-4 h-4" />} iconPosition="right">
                Add Item
              </Button>
              <Button variant="secondary" size="dashboard" icon={<RefreshCw className="w-4 h-4" />} iconPosition="right">
                Refresh Data
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
