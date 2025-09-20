"use client";

import { useState, useEffect } from "react";
import { AppointmentsTab } from "./AppointmentsTab";
import { ServicesTab } from "./ServicesTab";
import { CategoriesTab } from "./CategoriesTab";
import { SettingsTab } from "./SettingsTab";
import { SegmentPicker } from "./SegmentPicker";
import { LogOut, RefreshCw } from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('TERMINE');
  const [showCalendar, setShowCalendar] = useState(false);

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
      {/* Header - Only show when calendar is not active */}
      {!showCalendar && (
        <div className="border-b border-white/20 py-6 transition-all duration-300 responsive-padding">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl tracking-[0.15em] uppercase">Dashboard</h1>
              <p className="text-white/60 uppercase tracking-[0.05em]">
                COIFFEUR BY RABIA CAYLI 
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
                className="bg-transparent border border-white/20 px-8 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase hidden sm:block"
              >
                Abmelden
              </button>
              <button
                onClick={handleLogout}
                className="bg-transparent border border-white/20 p-3 hover:bg-white hover:text-black transition-colors sm:hidden"
                title="Abmelden"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className={showCalendar ? "" : "max-w-6xl mx-auto py-6 transition-all duration-300 responsive-padding"}>
        {/* Tab Navigation using SegmentPicker - Only show when calendar is not active */}
        {!showCalendar && (
          <div className="mb-8">
            <SegmentPicker
              options={['TERMINE', 'SERVICES', 'KATEGORIEN', 'EINSTELLUNGEN']}
              selectedOption={activeTab}
              onOptionChange={setActiveTab}
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'TERMINE' && <AppointmentsTab currentTime={currentTime} onCalendarToggle={setShowCalendar} />}
        {activeTab === 'SERVICES' && <ServicesTab />}
        {activeTab === 'KATEGORIEN' && <CategoriesTab />}
        {activeTab === 'EINSTELLUNGEN' && <SettingsTab />}
      </div>
    </div>
  );
}