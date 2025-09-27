"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ServicesTab } from "../../components/ServicesTab";
import { CategoriesTab } from "../../components/CategoriesTab";
import { SettingsTab } from "../../components/SettingsTab";
import { UIShowcaseTab } from "../../components/UIShowcaseTab";
import { CalendarTab } from "../../components/CalendarTab";
import { SegmentPicker } from "../../components/SegmentPicker";
import { LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPanelPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('SERVICES');
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
    router.push('/admin');
  };

  const handleBackToDashboard = () => {
    router.push('/admin');
  };

  // Memoized callback for SegmentPicker to prevent infinite re-renders
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Admin panel options - Services, Categories, Calendar Integration, Settings, UI Components
  const adminOptions = useMemo(() => ['SERVICES', 'KATEGORIEN', 'KALENDER-INTEGRATION', 'EINSTELLUNGEN', 'UI COMPONENTS'], []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="border-b border-white/20 py-6 transition-all duration-300 responsive-padding">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl tracking-[0.15em] uppercase">Admin Panel</h1>
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
                onClick={handleBackToDashboard}
                className="bg-transparent border border-white/20 px-8 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase hidden sm:block"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={handleBackToDashboard}
                className="bg-transparent border border-white/20 p-3 hover:bg-white hover:text-black transition-colors sm:hidden"
                title="Zurück zum Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
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

      {/* Admin Panel Content */}
      <div className="max-w-6xl mx-auto py-6 transition-all duration-300 responsive-padding">
        {/* Tab Navigation using SegmentPicker - Only show when not in fullscreen */}
        {!isFullscreen && (
          <div className="mb-8">
            <SegmentPicker
              options={adminOptions}
              selectedOption={activeTab}
              onOptionChange={handleTabChange}
              variant="admin"
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'SERVICES' && <ServicesTab />}
        {activeTab === 'KATEGORIEN' && <CategoriesTab />}
        {activeTab === 'KALENDER-INTEGRATION' && <CalendarTab />}
        {activeTab === 'EINSTELLUNGEN' && <SettingsTab />}
        {activeTab === 'UI COMPONENTS' && <UIShowcaseTab />}
      </div>
    </div>
  );
}
