'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'emerald' | 'indigo' | 'amber' | 'sky' | 'rose' | 'purple' | 'slate' | 'teal';
  progress?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'indigo',
  progress,
  className,
}: StatCardProps) {
  const iconVariants = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50',
    sky: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-900/50',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/50',
    teal: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-900/50',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  };

  const progressBgMap = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    rose: 'bg-rose-500',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500',
    slate: 'bg-slate-500',
  };

  return (
    <div
      className={cn(
        'relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all group flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-start justify-between gap-1.5 sm:gap-2.5">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5 sm:mt-1 leading-tight truncate">
            {value}
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              'w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4.5 sm:[&>svg]:h-4.5',
              iconVariants[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || progress !== undefined) && (
        <div className="mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/70">
          {progress !== undefined && (
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 sm:h-1.5 rounded-full overflow-hidden mb-1 sm:mb-1.5">
              <div
                className={cn('h-full rounded-full transition-all duration-500', progressBgMap[variant])}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}

          {subtitle && (
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
