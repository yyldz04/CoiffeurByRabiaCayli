import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChevronRight } from "lucide-react";

interface HomePageProps {
  onPageChange?: (page: string) => void;
}

export function HomePage({ onPageChange }: HomePageProps) {
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwc2Fsb24lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc3NTcwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Hair salon interior"
    },
    {
      url: "https://images.unsplash.com/photo-1680772856779-43eef7cabf18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzYWxvbiUyMGNoYWlyc3xlbnwxfHx8fDE3NTc4NzU2NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Beauty salon chairs"
    },
    {
      url: "https://images.unsplash.com/photo-1595284843291-e8d7eb9ebe27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTc4NzU2NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Salon workspace"
    }
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto py-8 md:py-16 px-0 md:px-4 xl:px-0">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-2xl md:text-4xl tracking-[0.2em] mb-6 md:mb-8 uppercase">SCHÖNHEIT NEU DEFINIERT</h2>
          <p className="text-white/70 max-w-2xl mx-auto leading-relaxed uppercase">
            Erleben Sie Luxus und Präzision in unserem modernen Friseursalon. 
            Unsere erfahrene Stylistin kreiert personalisierte Looks, die Ihre natürliche Schönheit 
            mit zeitgemäßen Techniken und zeitloser Eleganz unterstreichen.
          </p>
        </div>

        {/* Gallery Section */}
        <div className="mb-16 md:mb-24">
          <h3 className="text-xl md:text-2xl tracking-[0.15em] mb-8 md:mb-12 text-center uppercase">UNSER SALON</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {galleryImages.map((image, index) => (
              <div key={index} className="aspect-square border border-white/20 overflow-hidden">
                <ImageWithFallback
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 mb-16 md:mb-24">
          <div className="border border-white/20 p-4 md:p-8 text-center">
            <h4 className="tracking-[0.1em] mb-2 md:mb-4 uppercase">SCHNEIDEN</h4>
            <p className="text-white/60 uppercase">Präzise Schnitte für Ihren Stil</p>
          </div>
          <div className="border border-white/20 p-4 md:p-8 text-center">
            <h4 className="tracking-[0.1em] mb-2 md:mb-4 uppercase">FÄRBEN</h4>
            <p className="text-white/60 uppercase">Experte Farbtechniken und Behandlungen</p>
          </div>
          <div className="border border-white/20 p-4 md:p-8 text-center">
            <h4 className="tracking-[0.1em] mb-2 md:mb-4 uppercase">STYLING</h4>
            <p className="text-white/60 uppercase">Professionelles Styling für jeden Anlass</p>
          </div>
          <div className="border border-white/20 p-4 md:p-8 text-center">
            <h4 className="tracking-[0.1em] mb-2 md:mb-4 uppercase">BEHANDLUNGEN</h4>
            <p className="text-white/60 uppercase">Pflegende Haar- und Kopfhautbehandlungen</p>
          </div>
        </div>
      </div>

      {/* Inclusive Welcome Section */}
      <div className="border-t border-white/20 px-0 md:px-4 xl:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl md:text-3xl tracking-[0.15em] mb-6 md:mb-8 uppercase">
            WILLKOMMEN FÜR ALLE
          </h3>
          <p className="text-white/70 max-w-2xl mx-auto leading-relaxed uppercase mb-8">
            Frauen mit Kopftuch sind bei uns herzlich willkommen und haben höchste Priorität. 
            Wir nehmen uns gerne die Zeit, um auch für Sie die perfekte Behandlung zu planen. 
            Bei Interesse an einem Termin kontaktieren Sie uns bitte über unsere Kontaktseite.
          </p>
          <button 
            onClick={() => onPageChange?.('contact')}
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:border-white/60 transition-all duration-300 group uppercase tracking-[0.1em] text-sm"
          >
            <ChevronRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            <span>ZUR KONTAKTSEITE</span>
            <ChevronRight className="w-4 h-4 opacity-100 translate-x-0 group-hover:opacity-0 group-hover:translate-x-4 transition-all duration-300" />
          </button>
        </div>
      </div>

      {/* Redken Partnership Section - Full Width at Bottom */}
      <div className="border-t border-white/20 px-0 md:px-4 xl:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl md:text-3xl tracking-[0.15em] mb-6 md:mb-8 uppercase">
            SALON <span className="text-white/40 mx-2">✕</span> BRAND
          </h3>
          <p className="text-white/70 max-w-2xl mx-auto leading-relaxed uppercase">
            Dank den hoch qualitativen Produkten von Redken bieten wir Ihnen erstklassige 
            Haarpflege und professionelle Styling-Lösungen. Unsere Partnerschaft mit 
            Redken garantiert Ihnen die neuesten Techniken und hochwertigsten Inhaltsstoffe 
            für perfekte Ergebnisse bei jeder Behandlung.
          </p>
        </div>
      </div>
    </>
  );
}