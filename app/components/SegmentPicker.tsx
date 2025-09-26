import { 
  Calendar, 
  Settings, 
  Scissors, 
  Tag, 
  Palette,
  User,
  Users,
  CalendarDays,
  CalendarRange,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';

export interface SegmentOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  priority?: 'primary' | 'secondary';
}

interface SegmentPickerProps {
  options: SegmentOption[] | string[];
  selectedOption: string;
  onOptionChange: (option: string) => void;
  className?: string;
  variant?: 'admin' | 'calendar' | 'gender' | 'hair-length';
  primaryOptions?: string[];
}

export const SegmentPicker = memo(function SegmentPicker({ 
  options, 
  selectedOption, 
  onOptionChange, 
  className = "", 
  variant,
  primaryOptions = []
}: SegmentPickerProps) {

  // Icon mapping for different variants - memoized to prevent recreation
  const getIconForOption = useCallback((option: string, variant?: string) => {
    const iconMap: Record<string, Record<string, React.ComponentType<{ size?: number; className?: string }>>> = {
      admin: {
        'TERMINE': Calendar,
        'KALENDER': CalendarIcon,
        'SERVICES': Scissors,
        'KATEGORIEN': Tag,
        'EINSTELLUNGEN': Settings,
        'UI COMPONENTS': Palette
      },
      calendar: {
        'Tag': CalendarDays,
        'Woche': CalendarRange,
        'Monat': CalendarIcon
      },
      gender: {
        'DAMEN': User,
        'HERREN': Users
      },
      'hair-length': {
        'KURZ': ChevronUp,
        'MITTEL': ChevronRight,
        'LANG': ChevronDown
      }
    };

    return iconMap[variant || '']?.[option] || null;
  }, []);

  // Normalize options to SegmentOption format
  const normalizedOptions: SegmentOption[] = useMemo(() => {
    return options.map(option => {
      if (typeof option === 'string') {
        return {
          value: option,
          label: option,
          icon: getIconForOption(option, variant),
          priority: primaryOptions.includes(option) ? 'primary' : 'secondary'
        };
      }
      return option;
    });
  }, [options, variant, primaryOptions, getIconForOption]);

  // Filter options for mobile - only show primary options
  const mobileOptions = useMemo(() => {
    return normalizedOptions.filter(option => option.priority === 'primary');
  }, [normalizedOptions]);

  // Simplified approach - always show icons for secondary options, text for primary
  const shouldShowIconsForOption = (option: SegmentOption) => {
    return option.priority === 'secondary';
  };

  // Use mobile options on small screens, full options on larger screens
  const [isMobile, setIsMobile] = useState(false);

  // Memoized click handler
  const handleOptionClick = useCallback((optionValue: string) => {
    onOptionChange(optionValue);
  }, [onOptionChange]);

  // Compute display options directly without state
  const displayOptions = isMobile ? mobileOptions : normalizedOptions;

  // Handle resize events
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []); // Empty dependency array - only run once

  // Check if all options are icon-only (secondary priority)
  const allIconOnly = displayOptions.every(option => option.priority === 'secondary');
  
  return (
    <div className={`flex border border-white/20 ${className}`}>
      {displayOptions.map((option) => {
        // Determine display mode based on priority
        const shouldShowIcon = shouldShowIconsForOption(option) && option.icon;
        
        // Determine width class based on button type and context
        const getWidthClass = () => {
          return (allIconOnly || shouldShowIcon) ? 'flex-shrink-0' : 'flex-1';
        };
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleOptionClick(option.value)}
            className={`${getWidthClass()} px-6 py-3 tracking-[0.05em] uppercase transition-colors flex items-center justify-center gap-2 ${
              selectedOption === option.value
                ? 'bg-white text-black'
                : 'bg-transparent text-white hover:bg-white/10'
            } ${option.priority === 'secondary' ? 'px-4' : ''}`}
            title={shouldShowIcon ? option.label : undefined}
          >
            {shouldShowIcon && option.icon ? (
              <option.icon size={16} />
            ) : (
              option.label
            )}
          </button>
        );
      })}
    </div>
  );
});