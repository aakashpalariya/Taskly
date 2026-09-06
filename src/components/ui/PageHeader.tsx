'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: React.ReactNode;
  eyebrow?: {
    icon?: React.ReactNode;
    label: string;
    color?: string; // e.g. "text-amber-500", "text-sky-500"
  };
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1',
        className
      )}
    >
      <div className="space-y-0.5 min-w-0 flex-1">
        {eyebrow && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider',
              eyebrow.color || 'text-indigo-500'
            )}
          >
            {eyebrow.icon && <span className="shrink-0">{eyebrow.icon}</span>}
            <span>{eyebrow.label}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
