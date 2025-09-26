"use client";

import { Button } from "./ui/button";

interface ActiveBadgeProps {
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
}

export function ActiveBadge({ size = "xs", className }: ActiveBadgeProps) {
  return (
    <Button
      variant="info"
      size={size}
      className={`pointer-events-none bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 ${className || ''}`}
      disabled
    >
      Aktiv
    </Button>
  );
}
