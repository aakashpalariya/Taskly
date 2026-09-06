'use client';

import React, { forwardRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      indeterminate = false,
      onChange,
      label,
      description,
      size = 'md',
      disabled = false,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    const sizeStyles = {
      sm: {
        box: 'w-4 h-4 rounded-md',
        icon: 'w-2.5 h-2.5 stroke-[3]',
        text: 'text-xs',
      },
      md: {
        box: 'w-5 h-5 rounded-lg',
        icon: 'w-3.5 h-3.5 stroke-[3]',
        text: 'text-xs sm:text-sm',
      },
      lg: {
        box: 'w-6 h-6 rounded-xl',
        icon: 'w-4 h-4 stroke-[3]',
        text: 'text-sm sm:text-base',
      },
    }[size];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e.target.checked);
    };

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'inline-flex items-start gap-2.5 select-none cursor-pointer group',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          containerClassName
        )}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          {/* Accessible hidden native input */}
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only peer"
            {...props}
          />

          {/* Styled custom checkbox container */}
          <div
            className={cn(
              'flex items-center justify-center border transition-all duration-150',
              sizeStyles.box,
              checked || indeterminate
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs dark:bg-indigo-500 dark:border-indigo-500'
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 group-hover:border-indigo-500 dark:group-hover:border-indigo-400',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/40 peer-focus-visible:ring-offset-1 dark:peer-focus-visible:ring-offset-slate-900',
              className
            )}
          >
            {indeterminate ? (
              <Minus className={sizeStyles.icon} />
            ) : checked ? (
              <Check className={sizeStyles.icon} />
            ) : null}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <span
                className={cn(
                  'font-medium text-slate-800 dark:text-slate-200 transition-colors',
                  sizeStyles.text,
                  checked && 'text-slate-900 dark:text-white font-semibold'
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
