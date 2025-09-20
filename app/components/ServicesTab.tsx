import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Upload, Settings, Search, Banknote } from "lucide-react";
import { serviceService, ServiceGroup, Service, categoryService, Category } from "../utils/supabase/client";
import { AddServiceGroup } from "./AddServiceGroup";
import { EditServiceGroup } from "./EditServiceGroup";
import { DeleteServiceGroup } from "./DeleteServiceGroup";
import * as yaml from 'js-yaml';
import { PaymentDialog } from './PaymentDialog';

export function ServicesTab() {
  const [serviceGroups, setServiceGroups] = useState<(ServiceGroup & { services: Service[] })[]>([]);
  const [allServiceGroups, setAllServiceGroups] = useState<(ServiceGroup & { services: Service[] })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingServiceGroup, setEditingServiceGroup] = useState<(ServiceGroup & { services: Service[] }) | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDevTools, setShowDevTools] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    service: Service | null;
    serviceGroup: ServiceGroup | null;
  }>({ isOpen: false, service: null, serviceGroup: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load service groups and categories from Supabase
  useEffect(() => {
    loadServiceGroups();
    loadCategories();
  }, []);

  const loadServiceGroups = async () => {
    try {
      setIsLoading(true);
      const groups = await serviceService.getServiceGroups();
      setAllServiceGroups(groups);
      setServiceGroups(groups);
      // Expand all groups by default
      setExpandedGroups(new Set(groups.map((g: ServiceGroup & { services: Service[] }) => g.id)));
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Fehler beim Laden der Dienstleistungen");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
    } catch (error: unknown) {
      console.error("Error loading categories:", error);
    }
  };

  const filterServiceGroups = useCallback(() => {
    let filtered = allServiceGroups;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(group => group.category?.name === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(group => 
        group.title.toLowerCase().includes(term) ||
        group.description.toLowerCase().includes(term) ||
        group.category?.name.toLowerCase().includes(term) ||
        group.services.some(service => 
          service.hair_length?.toLowerCase().includes(term)
        )
      );
    }

    setServiceGroups(filtered);
  }, [allServiceGroups, selectedCategory, searchTerm]);

  // Filter service groups when search term or category changes
  useEffect(() => {
    filterServiceGroups();
  }, [searchTerm, selectedCategory, allServiceGroups, filterServiceGroups]);


  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getHairLengthLabel = (hairLength: string | null) => {
    switch (hairLength) {
      case 'KURZ': return 'K';
      case 'MITTEL': return 'M';
      case 'LANG': return 'L';
      default: return 'Standard';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ALLGEMEIN': return 'bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30';
      case 'HERREN': return 'bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30';
      case 'FÄRBUNG': return 'bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30';
      case 'DAUERHAFTE GLÄTTUNG & EXTENSIONS': return 'bg-orange-500/20 border-orange-500/50 text-orange-300 hover:bg-orange-500/30';
      case 'BEAUTY': return 'bg-pink-500/20 border-pink-500/50 text-pink-300 hover:bg-pink-500/30';
      case 'EVENTS': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30';
      case 'KIDS': return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30';
      case 'SCHNEIDEN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300 hover:bg-gray-500/30';
    }
  };

  const getCategoryActiveColor = (category: string) => {
    switch (category) {
      case 'ALLGEMEIN': return 'bg-blue-500 text-white';
      case 'HERREN': return 'bg-green-500 text-white';
      case 'FÄRBUNG': return 'bg-purple-500 text-white';
      case 'DAUERHAFTE GLÄTTUNG & EXTENSIONS': return 'bg-orange-500 text-white';
      case 'BEAUTY': return 'bg-pink-500 text-white';
      case 'EVENTS': return 'bg-yellow-500 text-white';
      case 'KIDS': return 'bg-cyan-500 text-white';
      case 'SCHNEIDEN': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'DAMEN': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'HERREN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'BEIDE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // YAML Import functionality
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("Keine Datei ausgewählt");
      return;
    }

    setIsImporting(true);
    setError("");

    try {
      const text = await file.text();
      const data = yaml.load(text);
      
      // Validate YAML structure - now supports flexible formats
      if (!data) {
        throw new Error("YAML-Datei ist leer oder ungültig");
      }

      // Check if user wants to clear existing data
      const shouldClear = confirm(
        "Möchten Sie alle bestehenden Dienstleistungen löschen bevor Sie die neuen importieren?\n\n" +
        "Klicken Sie 'OK' um alle bestehenden Daten zu löschen, oder 'Abbrechen' um nur neue hinzuzufügen."
      );

      // Call the API route for import
      const response = await fetch('/api/services/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-yaml',
        },
        body: yaml.dump({
          data,
          shouldClear
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Importieren der YAML-Datei');
      }

      // Reload services
      await loadServiceGroups();
      alert(`Import erfolgreich! ${result.importedCount} von ${result.totalCount} Dienstleistungsgruppe(n) importiert.`);
      
    } catch (error: unknown) {
      console.error("Import error:", error);
      const errorMessage = error instanceof Error ? error.message : "Fehler beim Importieren der YAML-Datei";
      setError(errorMessage);
      alert(`Import Fehler: ${errorMessage}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const exportServices = () => {
    const exportData = serviceGroups.map(group => ({
      title: group.title,
      description: group.description,
      category: group.category?.name || 'UNKNOWN',
      gender_restriction: group.gender_restriction,
      order_index: group.order_index,
      variants: group.services.map(service => ({
        hair_length: service.hair_length,
        duration_minutes: service.duration_minutes,
        price_euros: service.price_euros
      }))
    }));

    const blob = new Blob([yaml.dump(exportData, { indent: 2 })], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbrc-services-${new Date().toISOString().split('T')[0]}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isAddDialogOpen) {
    return (
      <AddServiceGroup
        onSuccess={() => {
          setIsAddDialogOpen(false);
          loadServiceGroups();
        }}
        onCancel={() => setIsAddDialogOpen(false)}
      />
    );
  }

  if (editingServiceGroup) {
    return (
      <EditServiceGroup
        serviceGroup={editingServiceGroup}
        onSuccess={() => {
          setEditingServiceGroup(null);
          loadServiceGroups();
        }}
        onCancel={() => setEditingServiceGroup(null)}
      />
    );
  }

  if (isDeleteDialogOpen) {
    return (
      <DeleteServiceGroup
        serviceGroups={serviceGroups}
        onSuccess={() => {
          setIsDeleteDialogOpen(false);
          loadServiceGroups();
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl tracking-[0.2em] mb-2 uppercase">Dienstleistungen</h1>
              <p className="text-white/60 uppercase">Verwalten Sie Ihre Salon-Dienstleistungen</p>
            </div>
          <div className="flex gap-4">
            {/* Dev Tools Toggle - Subtle */}
            <button
              onClick={() => setShowDevTools(!showDevTools)}
              className="text-white/30 hover:text-white/60 transition-colors p-2"
              title="Entwicklertools"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-transparent border border-white/20 px-8 py-3 tracking-[0.1em] hover:bg-white hover:text-black transition-colors uppercase"
              >
              <Plus className="w-4 h-4 inline mr-2" />
              Hinzufügen
            </button>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="bg-transparent border border-white/20 px-8 py-3 tracking-[0.1em] hover:bg-white hover:text-black transition-colors uppercase"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Löschen
            </button>
          </div>
          </div>

          {/* Search and Filter Section */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Dienstleistungen durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border border-white/20 px-10 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none uppercase tracking-[0.05em]"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 text-sm uppercase tracking-[0.05em] transition-colors border ${
                  selectedCategory === "all"
                    ? "bg-white text-black border-white"
                    : "bg-transparent border-white/20 text-white hover:border-white/40"
                }`}
              >
                Alle
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 text-sm uppercase tracking-[0.05em] transition-colors border ${
                    selectedCategory === category.name
                      ? getCategoryActiveColor(category.name)
                      : getCategoryColor(category.name)
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dev Tools Panel */}
        {showDevTools && (
          <div className="mb-6 p-4 bg-white/5 border border-white/20">
            <h3 className="text-lg tracking-[0.05em] uppercase mb-3 text-white/80">
              Entwicklertools
            </h3>
            <div className="flex gap-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".yaml,.yml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="bg-blue-600 text-white border border-blue-600 px-4 py-2 tracking-[0.05em] hover:bg-blue-700 transition-colors uppercase disabled:opacity-50 text-sm"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  {isImporting ? "Importiere..." : "YAML Import"}
                </button>
              </div>
              <button
                onClick={exportServices}
                className="bg-green-600 text-white border border-green-600 px-4 py-2 tracking-[0.05em] hover:bg-green-700 transition-colors uppercase text-sm"
              >
                YAML Export
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2">
              YAML Format: Array von ServiceGroups. order_index ist optional (wird automatisch vergeben wenn nicht gesetzt)
            </p>
          </div>
        )}

        {error && (
          <div className="border border-red-500/30 bg-red-500/5 p-4 text-center mb-6">
            <p className="text-red-400 tracking-[0.05em] uppercase">{error}</p>
          </div>
        )}

        {/* Service Groups */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-white/60 tracking-[0.05em] uppercase">Lade Dienstleistungen...</p>
          </div>
        ) : serviceGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 tracking-[0.05em] uppercase mb-4">
              Keine Dienstleistungen gefunden
            </p>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-white text-black border border-white px-6 py-2 tracking-[0.1em] hover:bg-white/90 transition-colors uppercase"
            >
              Erste Dienstleistung hinzufügen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {serviceGroups.map((group) => (
              <div key={group.id} className="border border-white/20">
                {/* Group Header */}
                <div className="p-4 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleGroupExpansion(group.id)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        {expandedGroups.has(group.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <h3 className="text-xl tracking-[0.05em] uppercase">{group.title}</h3>
                        <p className="text-white/60 text-sm">{group.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 uppercase tracking-[0.05em] border ${getCategoryColor(group.category?.name || 'UNKNOWN')}`}>
                            {group.category?.name || 'UNKNOWN'}
                          </span>
                          <span className={`text-xs px-2 py-1 uppercase tracking-[0.05em] border ${getGenderColor(group.gender_restriction)}`}>
                            {group.gender_restriction}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white/60">
                        {group.services.length} Variante{group.services.length !== 1 ? 'n' : ''}
                      </span>
                      <button
                        onClick={() => setEditingServiceGroup(group)}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Services */}
                {expandedGroups.has(group.id) && (
                  <div className="p-4 bg-white/2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.services.map((service) => (
                        <div key={service.id} className="border border-white/10 p-3 bg-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg tracking-[0.05em] uppercase">
                              {getHairLengthLabel(service.hair_length)}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 uppercase tracking-[0.05em] border ${
                                service.is_active 
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}>
                                {service.is_active ? 'Aktiv' : 'Inaktiv'}
                              </span>
                              <button
                                onClick={() => setPaymentDialog({ isOpen: true, service, serviceGroup: group })}
                                className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                                title="Zahlung"
                              >
                                <Banknote className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-white/80">
                              <span className="text-white/60">Dauer:</span> {service.duration_minutes} Min
                            </p>
                            <p className="text-white/80">
                              <span className="text-white/60">Preis:</span> {service.price_euros.toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {serviceGroups.length > 0 && (
          <div className="mt-8 p-4 bg-white/5 border border-white/20">
            <h3 className="text-lg tracking-[0.05em] uppercase mb-2">Zusammenfassung</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-white/60">Dienstleistungsgruppen:</p>
                <p className="text-xl font-bold">{serviceGroups.length}</p>
              </div>
              <div>
                <p className="text-white/60">Gesamte Varianten:</p>
                <p className="text-xl font-bold">
                  {serviceGroups.reduce((sum, group) => sum + group.services.length, 0)}
                </p>
              </div>
              <div>
                <p className="text-white/60">Aktive Varianten:</p>
                <p className="text-xl font-bold">
                  {serviceGroups.reduce((sum, group) => 
                    sum + group.services.filter(s => s.is_active).length, 0
                  )}
                </p>
              </div>
              <div>
                <p className="text-white/60">Kategorien:</p>
                <p className="text-xl font-bold">
                  {new Set(serviceGroups.map(g => g.category?.name || 'UNKNOWN')).size}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Payment Dialog */}
        <PaymentDialog
          isOpen={paymentDialog.isOpen}
          onClose={() => setPaymentDialog({ isOpen: false, service: null, serviceGroup: null })}
          amount={paymentDialog.service?.price_euros || 0}
          appointmentId=""
          serviceName={paymentDialog.serviceGroup?.title || 'N/A'}
          customerName="Direkte Zahlung"
        />
      </div>
    </div>
  );
}