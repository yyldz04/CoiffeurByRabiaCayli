"use client";

import { Button } from "./ui/button";

interface StatusBadgeProps {
  status: string;
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
}

export function StatusBadge({ status, size = "xs", className }: StatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'cancel';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Bestätigt';
      case 'pending': return 'Ausstehend';
      case 'cancelled': return 'Storniert';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  return (
    <Button
      variant={getStatusVariant(status) as any}
      size={size}
      className={`pointer-events-none ${className || ''}`}
      disabled
    >
      {getStatusText(status)}
    </Button>
  );
}
