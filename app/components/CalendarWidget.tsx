"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarWidgetProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  disabledDates?: string[];
  minDate?: string;
  maxDate?: string;
}

export function CalendarWidget({ 
  selectedDate, 
  onDateSelect, 
  disabledDates = [], 
  minDate,
  maxDate 
}: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayStr = formatDateLocal(today);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    
    // Get the first Monday of the month (or previous month)
    const startDate = new Date(firstDay);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    const calendarDays = [];
    const calendarDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      calendarDays.push(new Date(calendarDate));
      calendarDate.setDate(calendarDate.getDate() + 1);
    }
    
    return calendarDays;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const navigateMonth = (direction: 'prev' | 'next', event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const isDateDisabled = (date: Date) => {
    const dateStr = formatDateLocal(date);
    
    // Check if date is in the past
    if (dateStr < todayStr) return true;
    
    // Check if date is in disabled dates
    if (disabledDates.includes(dateStr)) return true;
    
    // Check min/max date constraints
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    
    return false;
  };

  const isDateSelected = (date: Date) => {
    return formatDateLocal(date) === selectedDate;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date) => {
    return formatDateLocal(date) === todayStr;
  };

  const handleDateClick = (date: Date, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDateDisabled(date)) {
      onDateSelect(formatDateLocal(date));
    }
  };

  return (
    <div className="bg-black border border-white/20 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={(e) => navigateMonth('prev', e)}
          className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black p-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h3 className="text-lg font-bold tracking-[0.1em] uppercase">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={(e) => navigateMonth('next', e)}
          className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black p-2 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <div key={day} className="p-2 text-center text-xs font-bold tracking-[0.05em] uppercase text-white/60">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const currentMonth = isCurrentMonth(date);
          const today = isToday(date);

          return (
            <button
              key={index}
              onClick={(e) => handleDateClick(date, e)}
              disabled={disabled}
              className={`
                p-2 text-sm font-bold transition-colors
                ${disabled 
                  ? 'text-white/20 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
                ${selected 
                  ? 'bg-white text-black ring-2 ring-white hover:bg-white hover:text-black' 
                  : 'text-white hover:bg-white/10 hover:text-white'
                }
                ${!currentMonth ? 'text-white/40' : ''}
                ${today && !selected ? 'bg-white/10 text-white' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="flex items-center justify-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white"></div>
            <span>Ausgewählt</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white/10"></div>
            <span>Heute</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white/20"></div>
            <span>Nicht verfügbar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
