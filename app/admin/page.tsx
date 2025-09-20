"use client";

import { useState, useEffect } from 'react';
import { AdminLogin } from '../components/AdminLogin';
import { AdminDashboard } from '../components/AdminDashboard';

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin login status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const adminLoggedIn = localStorage.getItem('cbrc_admin_logged_in') === 'true';
        setIsAdminLoggedIn(adminLoggedIn);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAdminLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Admin login handler
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    // Redirect to home page after logout
    window.location.href = '/';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60 uppercase tracking-[0.05em]">Laden...</p>
        </div>
      </div>
    );
  }

  // Show login or dashboard based on auth status
  return (
    <>
      {isAdminLoggedIn ? (
        <AdminDashboard onLogout={handleAdminLogout} />
      ) : (
        <AdminLogin onLogin={handleAdminLogin} />
      )}
    </>
  );
}