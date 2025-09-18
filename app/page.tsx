"use client";

import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { ContactPage } from './components/ContactPage';
import { AppointmentPage } from './components/AppointmentPage';
import { ImpressumPage } from './components/ImpressumPage';
import { DatenschutzPage } from './components/DatenschutzPage';
import { AGBPage } from './components/AGBPage';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

export default function Page() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check admin login status on app load
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('cbrc_admin_logged_in') === 'true';
    setIsAdminLoggedIn(adminLoggedIn);
  }, []);

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