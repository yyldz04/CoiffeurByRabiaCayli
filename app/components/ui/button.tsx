import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive tracking-[0.05em] uppercase",
  {
    variants: {
      variant: {
        // Primary Actions
        primary: "bg-white text-black border border-white hover:bg-white/90 transition-colors",
        primaryOutline: "bg-transparent border border-white/20 text-white hover:bg-white hover:text-black transition-colors",
        
        // Status Actions
        success: "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors",
        warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors",
        danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors",
        info: "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors",
        cancel: "bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 transition-colors",
        
        // Destructive Actions
        destructive: "bg-red-600 text-white border border-red-600 hover:bg-red-700 transition-colors",
        
        // Secondary Actions
        secondary: "bg-transparent border border-white/20 text-white hover:bg-white hover:text-black transition-colors",
        ghost: "text-white/60 hover:text-white transition-colors",
        
        // Tab Navigation
        tabActive: "bg-white text-black",
        tabInactive: "bg-transparent text-white hover:bg-white/10",
        
        // Category Filters
        filterActive: "bg-white text-black border-white",
        filterInactive: "bg-transparent border-white/20 text-white hover:border-white/40",
        
        // Payment Actions
        payment: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors",
        
        // Development Tools
        devTools: "text-white/30 hover:text-white/60 transition-colors",
        
        // Import/Export
        import: "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 transition-colors",
        export: "bg-green-600 text-white border border-green-600 hover:bg-green-700 transition-colors",
        
        // Legacy variants for backward compatibility
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-2 text-sm",
        default: "px-4 py-2",
        lg: "px-6 py-3",
        xl: "px-8 py-3 text-base",
        icon: "size-9",
        iconSm: "size-8",
        iconLg: "size-10",
        iconXl: "size-12",
        // Dashboard specific sizes
        dashboard: "px-8 py-3",
        dashboardSm: "px-6 py-3",
        dashboardXs: "px-4 py-2",
        payment: "py-6",
      },
      state: {
        default: "",
        loading: "cursor-wait",
        disabled: "cursor-not-allowed",
        success: "cursor-default",
        error: "cursor-default",
      },
    },
    defaultVariants: {
      variant: "primaryOutline",
      size: "default",
      state: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    asChild = false, 
    loading = false,
    icon,
    iconPosition = "left",
    iconOnly = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Determine if button should be disabled
    const isDisabled = disabled || loading || state === "disabled";
    
    // Determine current state
    const currentState = loading ? "loading" : state || "default";
    
    // Handle icon positioning
    const renderIcon = () => {
      if (loading) {
        return <Loader2 className="animate-spin" />;
      }
      if (icon) {
        return icon;
      }
      return null;
    };
    
    // Handle icon-only buttons
    if (iconOnly) {
      return (
        <Comp
          className={cn(
            buttonVariants({ 
              variant, 
              size: size || "icon", 
              state: currentState, 
              className 
            })
          )}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {renderIcon()}
        </Comp>
      );
    }
    
    // Handle regular buttons with optional icons
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            state: currentState, 
            className 
          })
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {iconPosition === "left" && renderIcon()}
        {children}
        {iconPosition === "right" && renderIcon()}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
