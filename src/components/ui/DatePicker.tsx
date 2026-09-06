'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  label?: string;
  value: string; // ISO date string 'YYYY-MM-DD'
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  align?: 'left' | 'right' | 'auto';
}

export function DatePicker({
  label,
  value,
  onChange,
  required,
  error,
  disabled,
  className = '',
  align = 'auto',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; isMobile: boolean }>({
    top: 0,
    left: 0,
    isMobile: false,
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    try {
      return value ? parseISO(value) : new Date();
    } catch {
      return new Date();
    }
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;
    const popoverWidth = 320;
    const popoverHeight = 340;

    if (isMobile) {
      setCoords({ top: 0, left: 0, isMobile: true });
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const placeUp = spaceBelow < popoverHeight && rect.top > popoverHeight;
    const top = placeUp ? rect.top - popoverHeight - 8 : rect.bottom + 8;

    let left = rect.left;
    if (align === 'right' || rect.right + popoverWidth > window.innerWidth - 16) {
      left = Math.max(12, rect.right - popoverWidth);
    } else {
      left = Math.max(12, Math.min(window.innerWidth - popoverWidth - 12, rect.left));
    }

    setCoords({ top, left, isMobile: false });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleResizeOrScroll = () => updatePosition();
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedDate = value ? parseISO(value) : new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handleSelectDay = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const formattedDisplay = value ? format(parseISO(value), 'dd MMM yyyy') : 'Select date';

  return (
    <div className={`relative w-full space-y-1.5 text-left ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-11 flex items-center justify-between px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none',
          isOpen
            ? 'ring-2 ring-indigo-500 border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-rose-500 ring-rose-500',
          !value && 'text-slate-400 dark:text-slate-500'
        )}
      >
        <span className="truncate">{formattedDisplay}</span>
        <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2" />
      </button>

      {/* Portal-based Floating Calendar Popover: Immune to parent overflow clipping */}
      {mounted &&
        isOpen &&
        createPortal(
          <>
            {/* Backdrop for Mobile */}
            {coords.isMobile && (
              <div
                className="fixed inset-0 z-[99998] bg-slate-950/50 backdrop-blur-2xs sm:hidden"
                onClick={() => setIsOpen(false)}
              />
            )}

            <div
              ref={popoverRef}
              style={
                coords.isMobile
                  ? {
                      position: 'fixed',
                      bottom: '24px',
                      left: '16px',
                      right: '16px',
                      maxWidth: '340px',
                      margin: '0 auto',
                      zIndex: 99999,
                    }
                  : {
                      position: 'fixed',
                      top: `${coords.top}px`,
                      left: `${coords.left}px`,
                      width: '320px',
                      zIndex: 99999,
                    }
              }
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              {/* Header Month / Year Navigation */}
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {format(currentMonth, 'MMMM yyyy')}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((day) => {
                  const isSelected = value ? isSameDay(day, selectedDate) : false;
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isCurrentDay = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        'h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer',
                        isSelected &&
                          'bg-indigo-600 text-white font-bold shadow-xs hover:bg-indigo-700',
                        !isSelected &&
                          isCurrentDay &&
                          'border border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-bold',
                        !isSelected &&
                          !isCurrentDay &&
                          isCurrentMonth &&
                          'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
                        !isSelected &&
                          !isCurrentDay &&
                          !isCurrentMonth &&
                          'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              {/* Shortcuts footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    onChange(format(now, 'yyyy-MM-dd'));
                    setCurrentMonth(now);
                    setIsOpen(false);
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Select Today
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

      {error && <p className="text-xs text-rose-500 font-semibold mt-1">{error}</p>}
    </div>
  );
}
