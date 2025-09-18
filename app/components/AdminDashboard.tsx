"use client";

import { useState, useEffect } from "react";
import { AppointmentsTab } from "./AppointmentsTab";
import { ServicesTab } from "./ServicesTab";
import { CategoriesTab } from "./CategoriesTab";
import { SegmentPicker } from "./SegmentPicker";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('TERMINE');

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cbrc_admin_logged_in");
    onLogout();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/20 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl tracking-[0.15em] uppercase">Dashboard</h1>
            <p className="text-white/60 uppercase tracking-[0.05em]">
              Coiffeur by Rabia Cayli
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-white/60 uppercase tracking-[0.05em]">Aktuelle Zeit</p>
              <p className="tracking-[0.05em] uppercase">
                {currentTime.toLocaleString('de-AT', {
                  timeZone: 'Europe/Vienna',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-transparent border border-white/20 px-8 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto py-6 px-0 md:px-4 xl:px-0">
        {/* Tab Navigation using SegmentPicker */}
        <div className="mb-8">
          <SegmentPicker
            options={['TERMINE', 'SERVICES', 'KATEGORIEN']}
            selectedOption={activeTab}
            onOptionChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'TERMINE' && <AppointmentsTab currentTime={currentTime} />}
        {activeTab === 'SERVICES' && <ServicesTab />}
        {activeTab === 'KATEGORIEN' && <CategoriesTab />}
      </div>
    </div>
  );
}