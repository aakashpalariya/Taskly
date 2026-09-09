'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: SelectOption[];
  children?: React.ReactNode;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  selectSize?: 'sm' | 'md' | 'lg';
  id?: string;
  name?: string;
}

export function Select({
  label,
  value: controlledValue,
  defaultValue,
  onChange,
  options: propOptions,
  children,
  placeholder = 'Select option...',
  leftIcon,
  error,
  helperText,
  disabled = false,
  required = false,
  className,
  containerClassName,
  selectSize = 'md',
  id,
  name,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  // Extract options from either props or children (<option> elements)
  const options: SelectOption[] = React.useMemo(() => {
    if (propOptions && propOptions.length > 0) {
      return propOptions;
    }
    const extracted: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const props = child.props as any;
        // Flatten children array into a clean string (handles {icon} {name} without double-comma)
        const rawChildren = props.children;
        let labelStr: string;
        if (Array.isArray(rawChildren)) {
          labelStr = rawChildren
            .map((c: any) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
            .join('')
            .replace(/\s+/g, ' ')
            .trim();
        } else {
          labelStr = String(rawChildren ?? props.label ?? props.value ?? '');
        }
        extracted.push({
          label: labelStr,
          value: String(props.value ?? ''),
          disabled: Boolean(props.disabled),
        });
      }
    });
    return extracted;
  }, [propOptions, children]);

  const [internalValue, setInternalValue] = useState<string>(
    controlledValue !== undefined ? controlledValue : defaultValue || (options[0]?.value ?? '')
  );

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeUp: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    placeUp: false,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = Math.min(options.length * 40 + 16, 260);
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setCoords({
      top: placeUp ? rect.top - dropdownHeight - 6 : rect.bottom + 6,
      left: Math.max(12, Math.min(window.innerWidth - rect.width - 12, rect.left)),
      width: rect.width,
      placeUp,
    });
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
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
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
  }, [isOpen, options.length]);

  const handleSelect = (val: string) => {
    setInternalValue(val);
    onChange?.(val);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'h-11 text-sm px-3.5',
    md: 'h-11 text-sm px-3.5',
    lg: 'h-12 text-sm sm:text-base px-4',
  }[selectSize];

  const optionTextSizeClass = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-sm sm:text-base',
  }[selectSize];

  return (
    <div className={cn('w-full space-y-1.5 text-left relative', containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Hidden input for form submits */}
      {name && <input type="hidden" name={name} value={selectedValue} />}

      {/* Custom Trigger Button */}
      <button
        id={selectId}
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
          'w-full flex items-center justify-between gap-2 rounded-xl transition-all cursor-pointer select-none text-left',
          'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
          'hover:border-slate-300 dark:hover:border-slate-700',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500',
          isOpen && 'ring-2 ring-indigo-500/40 border-indigo-500 dark:border-indigo-500 shadow-xs',
          disabled && 'opacity-50 bg-slate-50 dark:bg-slate-950 cursor-not-allowed',
          error && 'border-rose-500 ring-rose-500',
          sizeClasses,
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
          {leftIcon && <span className="shrink-0 text-slate-400 dark:text-slate-500">{leftIcon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span
            className={cn(
              'truncate font-normal',
              !selectedOption ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-indigo-600 dark:text-indigo-400'
          )}
        />
      </button>

      {/* Custom Styled Floating Menu via Portal (Guaranteed to NEVER be clipped by drawer/overflow) */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className={cn(
              'p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl',
              'max-h-60 overflow-y-auto space-y-0.5 animate-in fade-in zoom-in-95 duration-150'
            )}
          >
            {options.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === selectedValue;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl font-normal transition-all cursor-pointer text-left',
                      optionTextSizeClass,
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80',
                      opt.disabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}

      {error && (
        <p className="text-xs font-medium text-rose-500 animate-in fade-in duration-150">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
