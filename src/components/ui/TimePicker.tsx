'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
  label?: string;
  value?: string | null; // HH:mm (24-hour format)
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  align?: 'left' | 'right' | 'auto';
}

export function TimePicker({
  label,
  value,
  onChange,
  required,
  error,
  disabled,
  className = '',
  placeholder = 'Select time',
  align = 'auto',
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number; isMobile: boolean }>({
    top: 0,
    left: 0,
    isMobile: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse value into 12-hour format: hour (1-12), minute (00-59), period (AM/PM)
  const parseTime = (timeStr?: string | null) => {
    if (!timeStr) return { hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' };
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    if (isNaN(h)) return { hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' };
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return { hour: h, minute: m, period: period as 'AM' | 'PM' };
  };

  const parsed = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(parsed.period);

  useEffect(() => {
    const p = parseTime(value);
    setSelectedHour(p.hour);
    setSelectedMinute(p.minute);
    setSelectedPeriod(p.period);
  }, [value]);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;
    const popoverWidth = 280;
    const popoverHeight = 310;

    if (isMobile) {
      setCoords({ top: 0, left: 0, isMobile: true });
      return;
    }

    // Desktop positioning
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

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

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

  const formatDisplay = (timeStr?: string | null) => {
    if (!timeStr) return placeholder;
    const { hour, minute, period } = parseTime(timeStr);
    return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
  };

  const applyTime = (h: number, m: number, p: 'AM' | 'PM') => {
    let hour24 = h;
    if (p === 'PM' && h < 12) hour24 += 12;
    if (p === 'AM' && h === 12) hour24 = 0;
    const formatted = `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange(formatted);
  };

  const handleHourSelect = (h: number) => {
    setSelectedHour(h);
    applyTime(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (m: number) => {
    setSelectedMinute(m);
    applyTime(selectedHour, m, selectedPeriod);
  };

  const handlePeriodToggle = (p: 'AM' | 'PM') => {
    setSelectedPeriod(p);
    applyTime(selectedHour, selectedMinute, p);
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className={cn('relative w-full space-y-1.5 text-left', className)}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Button Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            updatePosition();
            setIsOpen(!isOpen);
          }
        }}
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
        <span className="truncate">{formatDisplay(value)}</span>
        <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2" />
      </button>

      {/* Portal-based Popover: Immune to parent overflow-y-auto clipping and off-screen bugs */}
      {mounted &&
        isOpen &&
        createPortal(
          <>
            {/* Mobile Backdrop */}
            {coords.isMobile && (
              <div
                className="fixed inset-0 z-[99998] bg-slate-950/50 backdrop-blur-2xs animate-in fade-in duration-150"
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
                      maxWidth: '320px',
                      margin: '0 auto',
                      zIndex: 99999,
                    }
                  : {
                      position: 'fixed',
                      top: `${coords.top}px`,
                      left: `${coords.left}px`,
                      width: '280px',
                      zIndex: 99999,
                    }
              }
              className={cn(
                'p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3',
                'animate-in fade-in zoom-in-95 duration-150'
              )}
            >
              {/* Header: Displays selected time + AM/PM toggle */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <span className="text-sm font-black text-slate-900 dark:text-white tracking-wide">
                  {selectedHour}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod}
                </span>

                {/* AM / PM Segmented Control */}
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handlePeriodToggle('AM')}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                      selectedPeriod === 'AM'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodToggle('PM')}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                      selectedPeriod === 'PM'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Only Hour and Minute Columns */}
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                {/* Hour Column */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1.5">
                    Hour
                  </span>
                  <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto pr-0.5">
                    {hours.map((h) => {
                      const isSelected = selectedHour === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => handleHourSelect(h)}
                          className={cn(
                            'h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center',
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minute Column */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1.5">
                    Minute
                  </span>
                  <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto pr-0.5">
                    {minutes.map((m) => {
                      const isSelected = selectedMinute === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleMinuteSelect(m)}
                          className={cn(
                            'h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center',
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          {String(m).padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Done Confirmation Action */}
              <div className="pt-1 flex items-center gap-2">
                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                    }}
                    className="flex-1 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
