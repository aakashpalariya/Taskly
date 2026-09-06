'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Flag
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { TaskRow } from '@/server/db/tasks';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/Button';

export function TaskCalendar() {
  const { tasks, setSelectedTask, setQuickAddOpen, createTask } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Compute days for the month grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true, isToday: dateStr === todayStr });
  }

  // Next month leading days to complete grid
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr });
  }

  // Group tasks by date
  const tasksByDate = new Map<string, TaskRow[]>();
  tasks.forEach(t => {
    if (t.due_date) {
      if (!tasksByDate.has(t.due_date)) tasksByDate.set(t.due_date, []);
      tasksByDate.get(t.due_date)!.push(t);
    }
  });

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60';
      case 'LOW':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/60';
      default:
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {monthName} {year}
          </h2>
          <Button
            size="xs"
            variant="outline"
            onClick={goToToday}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={prevMonth}
            title="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={nextMonth}
            title="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-center text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 py-2 sm:py-2.5">
        {[
          { full: 'Sun', short: 'S' },
          { full: 'Mon', short: 'M' },
          { full: 'Tue', short: 'T' },
          { full: 'Wed', short: 'W' },
          { full: 'Thu', short: 'T' },
          { full: 'Fri', short: 'F' },
          { full: 'Sat', short: 'S' },
        ].map(d => (
          <div key={d.full}>
            <span className="hidden sm:inline">{d.full}</span>
            <span className="sm:hidden">{d.short}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60 min-h-[460px] sm:min-h-[560px]">
        {days.map((day, idx) => {
          const dayTasks = tasksByDate.get(day.dateStr) || [];
          return (
            <div
              key={idx}
              className={cn(
                'min-h-[100px] p-2 flex flex-col justify-between transition-colors group relative',
                !day.isCurrentMonth && 'bg-slate-50/40 dark:bg-slate-950/20 text-slate-400 opacity-60',
                day.isToday && 'bg-indigo-50/30 dark:bg-indigo-950/20'
              )}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                    day.isToday
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  {day.dayNum}
                </span>

                <button
                  onClick={() => {
                    createTask({ title: 'New Task', dueDate: day.dateStr });
                  }}
                  title="Add task on this day"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-opacity cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      'w-full text-left px-2 py-1 rounded-md text-[11px] font-medium truncate block border transition-all cursor-pointer',
                      task.is_completed === 1 ? 'line-through opacity-50 bg-slate-100 dark:bg-slate-800 text-slate-400' : getPriorityBg(task.priority)
                    )}
                  >
                    {task.title}
                  </button>
                ))}

                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-medium px-1">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
