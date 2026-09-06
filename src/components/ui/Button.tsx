'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  mobileFullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      mobileFullWidth = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold shadow-xs hover:shadow-indigo-500/20 disabled:bg-indigo-400 dark:disabled:bg-indigo-800',
      secondary:
        'bg-slate-100 hover:bg-slate-200/80 active:scale-[0.98] text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-100 font-semibold border border-slate-200/80 dark:border-slate-700',
      outline:
        'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70 active:scale-[0.98] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium',
      destructive:
        'bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-semibold shadow-xs disabled:bg-rose-400',
      subtle:
        'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 active:scale-[0.98] text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/50 dark:border-indigo-900/40',
    };

    // Standardized heights: sm (h-9), md (h-11 matching inputs & selects), lg (h-12)
    const sizeStyles: Record<ButtonSize, string> = {
      xs: 'h-7 px-2.5 text-[11px] rounded-lg gap-1.5',
      sm: 'h-9 px-3 text-xs rounded-xl gap-1.5',
      md: 'h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl gap-2',
      lg: 'h-12 px-5 text-sm sm:text-base font-semibold rounded-xl gap-2.5',
      icon: 'w-11 h-11 p-0 rounded-xl justify-center shrink-0',
      'icon-sm': 'w-9 h-9 p-0 rounded-xl justify-center shrink-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 dark:focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : mobileFullWidth ? 'w-full sm:w-auto justify-center' : '',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
