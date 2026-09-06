import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDueDate(dateStr?: string | null, timeStr?: string | null): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
} {
  if (!dateStr) {
    return { label: '', isOverdue: false, isToday: false, isTomorrow: false };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const isToday = dateStr === todayStr;
  const isTomorrow = dateStr === tomorrowStr;
  const isOverdue = dateStr < todayStr;

  let label = dateStr;
  if (isToday) {
    label = 'Today';
  } else if (isTomorrow) {
    label = 'Tomorrow';
  } else {
    // Format e.g. "Thu, Mar 5"
    try {
      const d = new Date(dateStr + 'T00:00:00');
      label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
    } catch {
      label = dateStr;
    }
  }

  if (timeStr) {
    label += ` at ${timeStr}`;
  }

  return { label, isOverdue, isToday, isTomorrow };
}

export function getPriorityColor(priority?: string): {
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  dotColor: string;
} {
  switch (priority) {
    case 'HIGH':
      return {
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
        badgeText: 'High',
        borderColor: 'border-l-rose-500',
        dotColor: 'bg-rose-500',
      };
    case 'MEDIUM':
      return {
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
        badgeText: 'Medium',
        borderColor: 'border-l-amber-500',
        dotColor: 'bg-amber-500',
      };
    case 'LOW':
      return {
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/50',
        badgeText: 'Low',
        borderColor: 'border-l-sky-500',
        dotColor: 'bg-sky-500',
      };
    default:
      return {
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        badgeText: 'None',
        borderColor: 'border-l-transparent',
        dotColor: 'bg-slate-400',
      };
  }
}
