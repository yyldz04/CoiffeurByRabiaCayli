import { ReactNode } from "react";
import { Button } from "./ui/button";

interface TabHeaderProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function TabHeader({ title, subtitle, children }: TabHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl tracking-[0.2em] mb-2 uppercase">{title}</h1>
          <p className="text-white/60 uppercase">{subtitle}</p>
        </div>
        
        {/* Desktop buttons - full buttons on larger screens */}
        {children && (
          <div className="hidden sm:flex items-center gap-2">
            {children}
          </div>
        )}
        
        {/* Mobile buttons - icon-only buttons on small screens */}
        {children && (
          <div className="sm:hidden flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
