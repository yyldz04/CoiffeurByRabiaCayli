"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { serviceService, categoryService, Category } from "../utils/supabase/client";
import { ServiceVariant, ServiceGroupFormData } from "../types";

interface AddServiceGroupProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddServiceGroup({ onSuccess, onCancel }: AddServiceGroupProps) {
  const [formData, setFormData] = useState<ServiceGroupFormData>({
    title: "",
    description: "",
    category_id: "",
    gender_restriction: "DAMEN",
    order_index: 0,
    variants: []
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [serviceType, setServiceType] = useState<'hair_length_variants' | 'single_service'>('hair_length_variants');

  const [variants, setVariants] = useState<ServiceVariant[]>([
    { hair_length: 'KURZ', duration_minutes: 60, price_euros: 0 },
    { hair_length: 'MITTEL', duration_minutes: 90, price_euros: 0 },
    { hair_length: 'LANG', duration_minutes: 120, price_euros: 0 }
  ]);

  const [singleService, setSingleService] = useState<ServiceVariant>({
    hair_length: null,
    duration_minutes: 60,
    price_euros: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
        // Set first category as default if available
        if (categoriesData.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Fehler beim Laden der Kategorien');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [formData.category_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const serviceVariants = serviceType === 'single_service' 
        ? [singleService]
        : variants.filter(v => v.duration_minutes > 0 && v.price_euros > 0);

      await serviceService.createServiceGroup({
        ...formData,
        variants: serviceVariants
      });
      onSuccess();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Fehler beim Erstellen der Dienstleistung");
    } finally {
      setIsLoading(false);
    }
  };

  const updateVariant = (index: number, field: keyof ServiceVariant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const toggleVariant = (index: number) => {
    const newVariants = [...variants];
    if (newVariants[index].duration_minutes === 0) {
      newVariants[index] = { 
        ...newVariants[index], 
        duration_minutes: 60, 
        price_euros: 50 
      };
    } else {
      newVariants[index] = { 
        ...newVariants[index], 
        duration_minutes: 0, 
        price_euros: 0 
      };
    }
    setVariants(newVariants);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl tracking-[0.2em] mb-2 uppercase">Dienstleistung Hinzufügen</h1>
          <p className="text-white/60 uppercase">Neue Dienstleistungsgruppe erstellen</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-white/20 p-6 md:p-8">
            {/* Service Group Details */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block tracking-[0.05em] mb-2 uppercase">
                  Titel
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-transparent border border-white/20 px-8 py-3 focus:border-white focus:outline-none transition-colors"
                  placeholder="Z.B. Ansatzfarbe"
                  required
                />
              </div>

              <div>
                <label className="block tracking-[0.05em] mb-2 uppercase">
                  Beschreibung
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                  placeholder="Z.B. Färben, Waschen, Pflegen, Föhnen - nur Ansatz"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block tracking-[0.05em] mb-2 uppercase">
                    Kategorie
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                    required
                    disabled={isLoadingCategories}
                  >
                    {isLoadingCategories ? (
                      <option value="">Kategorien werden geladen...</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block tracking-[0.05em] mb-2 uppercase">
                    Geschlecht
                  </label>
                  <select
                    value={formData.gender_restriction}
                    onChange={(e) => setFormData({...formData, gender_restriction: e.target.value as 'DAMEN' | 'HERREN' | 'BEIDE'})}
                    className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                    required
                  >
                    <option value="DAMEN">DAMEN</option>
                    <option value="HERREN">HERREN</option>
                    <option value="BEIDE">BEIDE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block tracking-[0.05em] mb-2 uppercase">
                  Service-Typ
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as 'hair_length_variants' | 'single_service')}
                  className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                  required
                >
                  <option value="hair_length_variants">Haarlängen-Varianten (KURZ/MITTEL/LANG)</option>
                  <option value="single_service">Einzelner Service (ohne Haarlängen)</option>
                </select>
                <p className="text-white/60 text-sm mt-1 uppercase">
                  {serviceType === 'hair_length_variants' 
                    ? 'Für Damen-Services mit verschiedenen Haarlängen' 
                    : 'Für Herren-Services oder allgemeine Services'}
                </p>
              </div>
            </div>

            {/* Service Configuration */}
            <div className="space-y-4">
              <h3 className="text-xl tracking-[0.1em] uppercase mb-4">
                {serviceType === 'hair_length_variants' ? 'Haarlängen-Varianten' : 'Service-Details'}
              </h3>
              
              {serviceType === 'hair_length_variants' ? (
                // Hair Length Variants
                variants.map((variant, index) => (
                  <div key={index} className="border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg tracking-[0.05em] uppercase">
                        {variant.hair_length || 'Keine Variante'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => toggleVariant(index)}
                        className={`px-3 py-1 text-sm tracking-[0.05em] uppercase transition-colors ${
                          variant.duration_minutes > 0 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {variant.duration_minutes > 0 ? 'Aktiv' : 'Inaktiv'}
                      </button>
                    </div>

                    {variant.duration_minutes > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block tracking-[0.05em] mb-1 uppercase text-sm">
                            Dauer (Minuten)
                          </label>
                          <Input
                            type="number"
                            value={variant.duration_minutes}
                            onChange={(e) => updateVariant(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                            className="w-full bg-transparent border border-white/20 px-3 py-2 focus:border-white focus:outline-none transition-colors"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block tracking-[0.05em] mb-1 uppercase text-sm">
                            Preis (€)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price_euros}
                            onChange={(e) => updateVariant(index, 'price_euros', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border border-white/20 px-3 py-2 focus:border-white focus:outline-none transition-colors"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Single Service
                <div className="border border-white/10 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block tracking-[0.05em] mb-1 uppercase text-sm">
                        Dauer (Minuten)
                      </label>
                      <Input
                        type="number"
                        value={singleService.duration_minutes}
                        onChange={(e) => setSingleService({...singleService, duration_minutes: parseInt(e.target.value) || 0})}
                        className="w-full bg-transparent border border-white/20 px-3 py-2 focus:border-white focus:outline-none transition-colors"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block tracking-[0.05em] mb-1 uppercase text-sm">
                        Preis (€)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={singleService.price_euros}
                        onChange={(e) => setSingleService({...singleService, price_euros: parseFloat(e.target.value) || 0})}
                        className="w-full bg-transparent border border-white/20 px-3 py-2 focus:border-white focus:outline-none transition-colors"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="border border-red-500/30 bg-red-500/5 p-3 text-center mt-4">
                <p className="text-red-400 tracking-[0.05em] uppercase">{error}</p>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-transparent border border-white/20 px-8 py-3 tracking-[0.1em] hover:bg-white hover:text-black transition-colors uppercase"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-white text-black border border-white px-8 py-3 tracking-[0.1em] hover:bg-white/90 transition-colors uppercase disabled:opacity-50"
              >
                {isLoading ? "Erstellen..." : "Erstellen"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
