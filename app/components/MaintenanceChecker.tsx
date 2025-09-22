import { supabaseAdmin } from '../utils/supabase/client';

async function checkMaintenanceMode(): Promise<{
  maintenance_mode: boolean;
  maintenance_message: string;
}> {
  try {
    // Direct database query instead of HTTP request
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('maintenance_mode, maintenance_message')
      .single();

    if (error) {
      // If no settings exist, return defaults (no maintenance mode)
      if (error.code === 'PGRST116') {
        return {
          maintenance_mode: false,
          maintenance_message: "Wir sind bald wieder da!"
        };
      }
      throw error;
    }

    return {
      maintenance_mode: data.maintenance_mode || false,
      maintenance_message: data.maintenance_message || "Wir sind bald wieder da!"
    };
    
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
