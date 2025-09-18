import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
}

interface ExpandableServiceSectionProps {
  title: string;
  services: Service[];
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
  showWarning?: boolean;
}

export function ExpandableServiceSection({ 
  title, 
  services, 
  selectedService, 
  onServiceSelect,
  showWarning = false
}: ExpandableServiceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-white/20">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-colors"
      >
        <h4 className="tracking-[0.05em] uppercase">{title}</h4>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
      
      {isExpanded && (
        <div className="border-t border-white/20 p-4 md:p-6">
          {showWarning && (
            <div className="border border-red-500/30 bg-red-500/5 p-4 mb-6 text-center">
              <p className="text-red-400 tracking-[0.05em] uppercase">
                FÄRBUNG IST NUR AB 16 JAHREN GESTATTET
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => onServiceSelect(service.id)}
                className={`border border-white/20 p-4 cursor-pointer transition-colors ${
                  selectedService === service.id ? 'bg-white text-black' : 'hover:border-white/40'
                }`}
              >
                <h5 className="tracking-[0.05em] mb-2 uppercase">{service.name}</h5>
                <p className="text-sm opacity-70 uppercase">{service.duration}</p>
                <p className="tracking-[0.05em] uppercase">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}