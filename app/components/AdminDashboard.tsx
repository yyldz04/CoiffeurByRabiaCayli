"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AppointmentsTab } from "./AppointmentsTab";
import { ServicesTab } from "./ServicesTab";
import { CategoriesTab } from "./CategoriesTab";
import { SettingsTab } from "./SettingsTab";
import { UIShowcaseTab } from "./UIShowcaseTab";
import { Calendar } from "./Calendar";
import { SegmentPicker } from "./SegmentPicker";
import { LogOut } from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('TERMINE');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Memoized callback for SegmentPicker to prevent infinite re-renders
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Memoized options and primary options to prevent infinite re-renders
  const adminOptions = useMemo(() => ['TERMINE', 'KALENDER', 'SERVICES', 'KATEGORIEN', 'EINSTELLUNGEN', 'UI COMPONENTS'], []);
  const primaryOptions = useMemo(() => ['TERMINE', 'KALENDER'], []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="border-b border-white/20 py-6 transition-all duration-300 responsive-padding">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl tracking-[0.15em] uppercase">Dashboard</h1>
              <p className="text-white/60 uppercase tracking-[0.05em]">
                COIFFEUR BY RABIA CAYLI 
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
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
              <div className="text-right sm:hidden">
                <p className="tracking-[0.05em] uppercase">
                  {currentTime.toLocaleDateString('de-AT', {
                    timeZone: 'Europe/Vienna',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
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
      <div className="max-w-6xl mx-auto py-6 transition-all duration-300 responsive-padding">
        {/* Tab Navigation using SegmentPicker - Only show when not in fullscreen */}
        {!isFullscreen && (
          <div className="mb-8">
            <SegmentPicker
              options={adminOptions}
              selectedOption={activeTab}
              onOptionChange={handleTabChange}
              variant="admin"
              primaryOptions={primaryOptions}
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'TERMINE' && <AppointmentsTab currentTime={currentTime} onFullscreenToggle={setIsFullscreen} />}
        {activeTab === 'KALENDER' && <Calendar onFullscreenToggle={setIsFullscreen} />}
        {activeTab === 'SERVICES' && <ServicesTab />}
        {activeTab === 'KATEGORIEN' && <CategoriesTab />}
        {activeTab === 'EINSTELLUNGEN' && <SettingsTab />}
        {activeTab === 'UI COMPONENTS' && <UIShowcaseTab />}
      </div>
    </div>
  );
}