"use client";

import { useState } from 'react';

interface ToggleProps {
  active: boolean;
  onToggle: (active: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ active, onToggle, disabled = false, className = "" }: ToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      onToggle(!active);
    }
  };

  return (
    <div className={`flex border border-white/20 ${className}`}>
      {/* Left option - OFF/Inactive */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex-1 px-6 py-3 tracking-[0.05em] uppercase transition-colors
          focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black
          disabled:opacity-50 disabled:cursor-not-allowed
          ${!active
            ? 'bg-white text-black'
            : 'bg-transparent text-white hover:bg-white/10'
          }
        `}
        role="switch"
        aria-checked={active}
      >
        OFF
      </button>
      
      {/* Right option - ON/Active */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex-1 px-6 py-3 tracking-[0.05em] uppercase transition-colors
          focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black
          disabled:opacity-50 disabled:cursor-not-allowed
          ${active
            ? 'bg-white text-black'
            : 'bg-transparent text-white hover:bg-white/10'
          }
        `}
        role="switch"
        aria-checked={active}
      >
        ON
      </button>
    </div>
  );
}

// Alternative version with labels
interface ToggleWithLabelsProps extends ToggleProps {
  leftLabel?: string;
  rightLabel?: string;
}

export function ToggleWithLabels({ 
  active, 
  onToggle, 
  disabled = false, 
  className = "",
  leftLabel = "OFF",
  rightLabel = "ON"
}: ToggleWithLabelsProps) {
  const handleToggle = () => {
    if (!disabled) {
      onToggle(!active);
    }
  };

  return (
    <div className={`flex border border-white/20 ${className}`}>
      {/* Left option */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex-1 px-6 py-3 tracking-[0.05em] uppercase transition-colors
          focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black
          disabled:opacity-50 disabled:cursor-not-allowed
          ${!active
            ? 'bg-white text-black'
            : 'bg-transparent text-white hover:bg-white/10'
          }
        `}
        role="switch"
        aria-checked={active}
      >
        {leftLabel}
      </button>
      
      {/* Right option */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex-1 px-6 py-3 tracking-[0.05em] uppercase transition-colors
          focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black
          disabled:opacity-50 disabled:cursor-not-allowed
          ${active
            ? 'bg-white text-black'
            : 'bg-transparent text-white hover:bg-white/10'
          }
        `}
        role="switch"
        aria-checked={active}
      >
        {rightLabel}
      </button>
    </div>
  );
}
