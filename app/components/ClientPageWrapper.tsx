"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';
import { HomePage } from './HomePage';
import { ContactPage } from './ContactPage';
import { AppointmentPage } from './AppointmentPage';
import { ImpressumPage } from './ImpressumPage';
import { DatenschutzPage } from './DatenschutzPage';
import { AGBPage } from './AGBPage';
import { Footer } from './Footer';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export function ClientPageWrapper({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check admin login status on app load - always call hooks at the top level
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('cbrc_admin_logged_in') === 'true';
    setIsAdminLoggedIn(adminLoggedIn);
  }, []);

  // Check if this is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // If this is an admin route, just render children without any wrapper
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Admin login handler
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentPage('admin');
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentPage('home');
  };

  // Handle page changes, including admin access
  const handlePageChange = (page: string) => {
    if (page === 'admin') {
      if (isAdminLoggedIn) {
        setCurrentPage('admin');
      } else {
        setCurrentPage('admin-login');
      }
    } else {
      setCurrentPage(page);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={handlePageChange} />;
      case 'contact':
        return <ContactPage />;
      case 'appointment':
        return <AppointmentPage />;
      case 'impressum':
        return <ImpressumPage />;
      case 'datenschutz':
        return <DatenschutzPage />;
      case 'agb':
        return <AGBPage />;
      case 'admin-login':
        return <AdminLogin onLogin={handleAdminLogin} />;
      case 'admin':
        return isAdminLoggedIn ? <AdminDashboard onLogout={handleAdminLogout} /> : <AdminLogin onLogin={handleAdminLogin} />;
      default:
        return <HomePage />;
    }
  };

  // Don't show navigation and footer for admin pages
  if (currentPage === 'admin-login' || currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-black text-white">
        {renderCurrentPage()}
      </div>
    );
  }

  // Render public pages normally
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      <Footer onPageChange={handlePageChange} />
    </div>
  );
}
