import { ImageWithFallback } from './figma/ImageWithFallback';
import Image from 'next/image';

interface FooterProps {
  onPageChange: (page: string) => void;
}

export function Footer({ onPageChange }: FooterProps) {
  return (
    <footer className="border-t border-white/20 px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Logo Section */}
          <div className="flex flex-col items-start">
            <div className="h-8 w-8 mb-4">
              <ImageWithFallback
                src="/CBRC-LOGO S.png"
                alt="Salon Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-white/60 uppercase tracking-[0.05em]">
              COIFFEUR BY RABIA CAYLI  
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <button
                onClick={() => onPageChange('impressum')}
                className="text-white/60 hover:text-white transition-colors uppercase tracking-[0.05em] text-left"
              >
                Impressum
              </button>
              <button
                onClick={() => onPageChange('datenschutz')}
                className="text-white/60 hover:text-white transition-colors uppercase tracking-[0.05em] text-left"
              >
                Datenschutz
              </button>
              <button
                onClick={() => onPageChange('agb')}
                className="text-white/60 hover:text-white transition-colors uppercase tracking-[0.05em] text-left"
              >
                AGB
              </button>
            </div>

            {/* Social Media Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => window.open('https://wa.me/431234567', '_blank')}
                className="border border-white/20 p-3 hover:bg-white hover:text-black transition-colors"
                aria-label="WhatsApp"
              >
                <Image src="/whatsapp.svg" alt="WhatsApp" width={20} height={20} className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.open('https://www.instagram.com/your_salon_handle/', '_blank')}
                className="border border-white/20 p-3 hover:bg-white hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <Image src="/instagram.png" alt="Instagram" width={20} height={20} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/40 uppercase tracking-[0.05em]">
            © 2024 COIFFEUR BY RABIA CAYLI  . Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}