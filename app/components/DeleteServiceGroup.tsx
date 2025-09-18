"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { serviceService, ServiceGroup, Service } from "../utils/supabase/client";

interface DeleteServiceGroupProps {
  serviceGroups: (ServiceGroup & { services: Service[] })[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeleteServiceGroup({ serviceGroups, onSuccess, onCancel }: DeleteServiceGroupProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGroupToggle = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
      // Also remove all services from this group
      const group = serviceGroups.find(g => g.id === groupId);
      if (group) {
        setSelectedServices(selectedServices.filter(id => 
          !group.services.some(s => s.id === id)
        ));
      }
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleDelete = async () => {
    if (selectedGroups.length === 0 && selectedServices.length === 0) {
      setError("Bitte wählen Sie mindestens eine Dienstleistung aus");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Delete entire groups first
      for (const groupId of selectedGroups) {
        await serviceService.deleteServiceGroup(groupId);
      }

      // Delete individual services
      if (selectedServices.length > 0) {
        await serviceService.deleteServices(selectedServices);
      }

      onSuccess();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Fehler beim Löschen der Dienstleistungen");
    } finally {
      setIsLoading(false);
    }
  };

  const getHairLengthLabel = (hairLength: string | null) => {
    switch (hairLength) {
      case 'KURZ': return 'K';
      case 'MITTEL': return 'M';
      case 'LANG': return 'L';
      default: return 'Standard';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl tracking-[0.2em] mb-2 uppercase">Dienstleistungen Löschen</h1>
          <p className="text-white/60 uppercase">Wählen Sie die zu löschenden Dienstleistungen aus</p>
        </div>

        <div className="border border-white/20 p-6 md:p-8">
          <div className="space-y-6">
            {serviceGroups.map((group) => (
              <div key={group.id} className="border border-white/10 p-4">
                {/* Group Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                      className="w-4 h-4 text-white bg-transparent border-white/30 focus:ring-white focus:ring-2"
                    />
                    <div>
                      <h3 className="text-xl tracking-[0.05em] uppercase">{group.title}</h3>
                      <p className="text-white/60 text-sm">{group.description}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-white/10 px-2 py-1 uppercase tracking-[0.05em]">
                          {group.category?.name || 'UNKNOWN'}
                        </span>
                        <span className="text-xs bg-white/10 px-2 py-1 uppercase tracking-[0.05em]">
                          {group.gender_restriction}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">
                      {group.services.length} Variante{group.services.length !== 1 ? 'n' : ''}
                    </p>
                  </div>
                </div>

                {/* Services */}
                {group.services.length > 0 && (
                  <div className="ml-8 space-y-2">
                    <h4 className="text-sm tracking-[0.05em] uppercase text-white/60 mb-2">
                      Einzelne Varianten löschen:
                    </h4>
                    {group.services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-2 bg-white/5">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            disabled={selectedGroups.includes(group.id)}
                            className="w-4 h-4 text-white bg-transparent border-white/30 focus:ring-white focus:ring-2 disabled:opacity-50"
                          />
                          <span className="text-sm tracking-[0.05em] uppercase">
                            {getHairLengthLabel(service.hair_length)}
                          </span>
                        </div>
                        <div className="text-right text-sm">
                          <p>{service.duration_minutes} Min</p>
                          <p className="text-white/60">{service.price_euros.toFixed(2)}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="border border-red-500/30 bg-red-500/5 p-3 text-center mt-6">
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
              type="button"
              onClick={handleDelete}
              disabled={isLoading || (selectedGroups.length === 0 && selectedServices.length === 0)}
              className="flex-1 bg-red-600 text-white border border-red-600 px-8 py-3 tracking-[0.1em] hover:bg-red-700 transition-colors uppercase disabled:opacity-50"
            >
              {isLoading ? "Löschen..." : "Ausgewählte Löschen"}
            </Button>
          </div>

          {/* Summary */}
          {(selectedGroups.length > 0 || selectedServices.length > 0) && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30">
              <h4 className="text-yellow-400 tracking-[0.05em] uppercase mb-2">
                Zusammenfassung:
              </h4>
              <ul className="text-sm text-white/80 space-y-1">
                {selectedGroups.length > 0 && (
                  <li>• {selectedGroups.length} Dienstleistungsgruppe{selectedGroups.length !== 1 ? 'n' : ''} (mit allen Varianten)</li>
                )}
                {selectedServices.length > 0 && (
                  <li>• {selectedServices.length} einzelne Variante{selectedServices.length !== 1 ? 'n' : ''}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
