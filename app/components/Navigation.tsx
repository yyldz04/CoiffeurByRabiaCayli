"use client";

import { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent, pageId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPageChange(pageId);
    }
  };

  const pages = [
    { id: 'home', label: 'STARTSEITE' },
    { id: 'contact', label: 'KONTAKT' },
    { id: 'appointment', label: 'TERMIN' }
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  // Hidden admin access via triple-click on logo
  const handleLogoClick = () => {
    clickCountRef.current += 1;
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 3) {
        // Redirect to admin route instead of using page change
        window.location.href = '/admin';
      }
      clickCountRef.current = 0;
    }, 500);
  };

  return (
    <nav className={`sticky top-0 z-50 px-4 md:px-8 transition-all duration-300 ${
      isScrolled 
        ? 'py-6 border-b border-white/20 backdrop-blur-md bg-black/80' 
        : 'py-12'
    }`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo with hidden admin access */}
        <div 
          className={`cursor-pointer transition-all duration-300 ${
            isScrolled ? 'h-8 w-8' : 'h-16 w-16'
          } scale-150 origin-left`}
          onClick={handleLogoClick}
          title="COIFFEUR BY RABIA CAYLI "
        >
          <ImageWithFallback
            src="/CBRC-LOGO-S.png"
            alt="CBRC Logo"
            className="h-full w-full object-contain"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-12">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              onKeyDown={(e) => handleKeyDown(e, page.id)}
              className={`tracking-[0.1em] transition-colors hover:text-white/70 uppercase ${
                currentPage === page.id ? 'text-white' : 'text-white/60'
              }`}
              aria-current={currentPage === page.id ? 'page' : undefined}
              role="menuitem"
            >
              {page.label}
            </button>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t border-white/20 mt-6 pt-6"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col gap-6">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageChange(page.id)}
                onKeyDown={(e) => handleKeyDown(e, page.id)}
                className={`tracking-[0.1em] transition-colors hover:text-white/70 text-left uppercase ${
                  currentPage === page.id ? 'text-white' : 'text-white/60'
                }`}
                aria-current={currentPage === page.id ? 'page' : undefined}
                role="menuitem"
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}