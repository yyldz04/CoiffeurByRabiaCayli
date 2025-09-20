async function checkMaintenanceMode(): Promise<{
  maintenance_mode: boolean;
  maintenance_message: string;
}> {
  try {
    // Use the internal API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/settings/public`, {
      cache: 'no-store' // Always get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch maintenance settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // Default to no maintenance mode on error
    return {
      maintenance_mode: false,
      maintenance_message: "Wir sind bald wieder da!"
    };
  }
}

interface MaintenanceCheckerProps {
  children: React.ReactNode;
}

export async function MaintenanceChecker({ children }: MaintenanceCheckerProps) {
  const settings = await checkMaintenanceMode();
  
  // If maintenance mode is active, show maintenance page
  if (settings.maintenance_mode) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Maintenance Message */}
          <div className="mb-12 mt-16">
            <h2 className="text-2xl md:text-3xl tracking-[0.1em] uppercase mb-6">
              {settings.maintenance_message}
            </h2>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8">
            <p className="text-xs text-white/40 uppercase tracking-[0.05em]">
              © {new Date().getFullYear()} Coiffeur by Rabia Cayli
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // If no maintenance mode, render children normally
  return <>{children}</>;
}
