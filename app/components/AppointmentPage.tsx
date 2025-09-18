"use client";

import { useState, useEffect } from 'react';
import { SegmentPicker } from './SegmentPicker';
import { ExpandableServiceSection } from './ExpandableServiceSection';
import { BookingOverview } from './BookingOverview';
import { serviceService, Service, ServiceGroup } from '../utils/supabase/client';

export function AppointmentPage() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedGender, setSelectedGender] = useState('DAMEN');
  const [selectedHairLength, setSelectedHairLength] = useState('KURZ');
  const [showOverview, setShowOverview] = useState(false);
  const [allServices, setAllServices] = useState<Array<{
    id: string;
    name: string;
    duration: string;
    price: string;
    category: string;
    genderRestriction: string;
    hairLength: string | null;
  }>>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    requests: ''
  });

  // Load services from Supabase
  useEffect(() => {
    loadServicesFromSupabase();
  }, []);

  // Reset service selection when hair length changes
  useEffect(() => {
    setSelectedService('');
  }, [selectedHairLength]);

  const loadServicesFromSupabase = async () => {
    try {
      setIsLoadingServices(true);
      setServicesError(null);
      
      const serviceGroups = await serviceService.getServiceGroups();
      
      // Transform Supabase data to match the expected format
      const transformedServices: Array<{
        id: string;
        name: string;
        duration: string;
        price: string;
        category: string;
        genderRestriction: string;
        hairLength: string | null;
      }> = [];

      serviceGroups.forEach((group: ServiceGroup & { services: Service[] }) => {
        if (group.services && group.services.length > 0) {
          group.services.forEach((service: Service) => {
            transformedServices.push({
              id: service.id, // Use the actual service UUID, not composite ID
              name: group.title,
              duration: `${service.duration_minutes} min`,
              price: `${service.price_euros}€`,
              category: group.category?.name || 'UNKNOWN',
              genderRestriction: group.gender_restriction,
              hairLength: service.hair_length
            });
          });
        }
      });

      setAllServices(transformedServices);
    } catch (error) {
      console.error('Error loading services:', error);
      setServicesError('Fehler beim Laden der Dienstleistungen');
      setAllServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Filter services based on selected gender and hair length
  const getServicesForGender = () => {
    return allServices.filter(service => {
      // Filter by gender
      const genderMatch = service.genderRestriction === selectedGender || service.genderRestriction === 'BEIDE';
      
      // For women, also filter by hair length
      if (selectedGender === 'DAMEN') {
        const hairLengthMatch = service.hairLength === selectedHairLength || service.hairLength === null;
        return genderMatch && hairLengthMatch;
      }
      
      // For men, no hair length filtering needed
      return genderMatch;
    });
  };

  // Group women's services by category dynamically
  const getWomenServiceCategories = () => {
    const womenServices = getServicesForGender();
    const categories: { [key: string]: typeof womenServices } = {};
    
    // Dynamically group services by their category
    womenServices.forEach(service => {
      const categoryName = service.category || 'UNKNOWN';
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(service);
    });
    
    return categories;
  };

  const services = getServicesForGender();
  const womenServiceCategories = getWomenServiceCategories();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOverview(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const bookingData = {
    ...formData,
    gender: selectedGender,
    hairLength: selectedHairLength,
    service: selectedService
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-0 md:px-4 xl:px-0">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-4xl tracking-[0.2em] mb-6 md:mb-8 uppercase">TERMIN BUCHEN</h2>
        <p className="text-white/70 uppercase">Vereinbaren Sie Ihren Besuch bei unserer erfahrenen Stylistin</p>
      </div>

       <div className="border-t border-b border-white/20 bg-black p-6 md:p-12 md:border-l md:border-r">
        <form onSubmit={handleFormSubmit} className="space-y-12">
          {/* Gender Selection - Full Width */}
          <div>
            <label className="block tracking-[0.05em] mb-4 uppercase">GESCHLECHT</label>
            <SegmentPicker
              options={['DAMEN', 'HERREN']}
              selectedOption={selectedGender}
              onOptionChange={(value) => {
                setSelectedGender(value);
                setSelectedService(''); // Reset service selection when gender changes
              }}
            />
          </div>

          {/* Hair Length Selection - Only for Women */}
          {selectedGender === 'DAMEN' && (
            <div>
              <label className="block tracking-[0.05em] mb-4 uppercase">HAARLÄNGE</label>
              <SegmentPicker
                options={['KURZ', 'MITTEL', 'LANG']}
                selectedOption={selectedHairLength}
                onOptionChange={setSelectedHairLength}
              />
            </div>
          )}

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="firstName" className="block tracking-[0.05em] mb-2 uppercase">VORNAME</label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                placeholder="VORNAME"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block tracking-[0.05em] mb-2 uppercase">NACHNAME</label>
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                placeholder="NACHNAME"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="email" className="block tracking-[0.05em] mb-2 uppercase">E-MAIL</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                placeholder="IHRE.EMAIL@BEISPIEL.DE"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block tracking-[0.05em] mb-2 uppercase">TELEFON</label>
              <input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
                placeholder="030 123-4567"
              />
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block tracking-[0.05em] mb-4 uppercase font-normal">SERVICE AUSWÄHLEN</label>
            
            {isLoadingServices ? (
              <div className="border border-white/20 p-8 text-center">
                <p className="text-white/70 uppercase tracking-[0.05em]">Dienstleistungen werden geladen...</p>
              </div>
            ) : servicesError ? (
              <div className="border border-red-500/50 bg-red-500/10 p-8 text-center">
                <p className="text-red-400 uppercase tracking-[0.05em]">{servicesError}</p>
              </div>
            ) : services.length === 0 ? (
              <div className="border border-white/20 bg-white/5 p-8 text-center">
                <p className="text-white/70 uppercase tracking-[0.05em]">
                  Zurzeit werden unsere Dienstleistungen überarbeitet, bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.
                </p>
              </div>
            ) : selectedGender === 'HERREN' ? (
              // Simple grid for men's services
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`border border-white/20 p-4 md:p-6 cursor-pointer transition-colors ${
                      selectedService === service.id ? 'bg-white text-black' : 'hover:border-white/40'
                    }`}
                  >
                    <h4 className="tracking-[0.05em] mb-2 uppercase">{service.name}</h4>
                    <p className="text-sm opacity-70 uppercase">{service.duration}</p>
                    <p className="tracking-[0.05em] uppercase">{service.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              // Expandable sections for women's services - dynamically generated
              <div className="space-y-1">
                {Object.entries(womenServiceCategories).map(([categoryName, categoryServices]) => (
                  <ExpandableServiceSection
                    key={categoryName}
                    title={categoryName}
                    services={categoryServices}
                    selectedService={selectedService}
                    onServiceSelect={setSelectedService}
                    showWarning={categoryName === 'FÄRBUNG'} // Show warning only for coloring services
                  />
                ))}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="date" className="block tracking-[0.05em] mb-2 uppercase">WUNSCHDATUM</label>
              <input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="time" className="block tracking-[0.05em] mb-2 uppercase">WUNSCHZEIT</label>
              <select 
                required
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full bg-black border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors uppercase"
              >
                <option value="">ZEIT AUSWÄHLEN</option>
                <option value="09:00">9:00</option>
                <option value="09:30">9:30</option>
                <option value="10:00">10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="12:00">12:00</option>
                <option value="12:30">12:30</option>
                <option value="13:00">13:00</option>
                <option value="13:30">13:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
                <option value="17:00">17:00</option>
                <option value="17:30">17:30</option>
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label htmlFor="requests" className="block tracking-[0.05em] mb-2 uppercase">BESONDERE WÜNSCHE</label>
            <textarea
              id="requests"
              rows={3}
              value={formData.requests}
              onChange={(e) => handleInputChange('requests', e.target.value)}
              className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors resize-none"
              placeholder="BESONDERE WÜNSCHE ODER ANMERKUNGEN..."
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!selectedService || isLoadingServices || services.length === 0}
              className="bg-transparent border border-white/20 px-16 py-4 tracking-[0.1em] hover:bg-white hover:text-black transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              TERMIN BUCHEN
            </button>
          </div>
        </form>
      </div>

      {/* Booking Overview Modal */}
      <BookingOverview
        isOpen={showOverview}
        onClose={() => setShowOverview(false)}
        bookingData={bookingData}
        services={services}
      />
    </div>
  );
}