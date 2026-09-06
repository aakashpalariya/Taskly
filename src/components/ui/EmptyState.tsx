'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl bg-white/40 dark:bg-slate-900/30',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs border border-indigo-100 dark:border-indigo-900/40">
        {icon || <Sparkles className="w-6 h-6" />}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          size="sm"
          variant="primary"
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
