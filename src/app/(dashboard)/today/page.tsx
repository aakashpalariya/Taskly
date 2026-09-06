'use client';

import React, { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { TaskList } from '@/components/tasks/TaskList';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, AlertCircle, Sparkles, LayoutList, Table as TableIcon } from 'lucide-react';

export default function TodayPage() {
  const { tasks, searchQuery, priorityFilter, sortBy } = useTasks();
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Filter tasks
  let todayTasks = tasks.filter(t => {
    if (t.is_completed === 1) return false;
    return t.due_date && t.due_date <= todayStr;
  });

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    todayTasks = todayTasks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.tags?.some(tag => tag.name.toLowerCase().includes(q))
    );
  }

  // Priority filter
  if (priorityFilter !== 'ALL') {
    todayTasks = todayTasks.filter(t => t.priority === priorityFilter);
  }

  // Sort
  if (sortBy === 'dueDate') {
    todayTasks.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
  } else if (sortBy === 'priority') {
    const pWeight = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
    todayTasks.sort((a, b) => (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0));
  } else if (sortBy === 'title') {
    todayTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    todayTasks.sort((a, b) => a.position - b.position);
  }

  const overdueTasks = todayTasks.filter(t => t.due_date && t.due_date < todayStr);
  const currentTodayTasks = todayTasks.filter(t => t.due_date === todayStr);

  const completedToday = tasks.filter(
    t => t.is_completed === 1 && t.completed_at && t.completed_at.startsWith(todayStr)
  ).length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <PageHeader
        title="Today"
        eyebrow={{
          icon: <Calendar className="w-3.5 h-3.5" />,
          label: formattedToday,
          color: 'text-amber-500',
        }}
        actions={
          <div className="flex items-center gap-2">
            {completedToday > 0 && (
              <Badge variant="emerald" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                {completedToday} done today
              </Badge>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table view"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        }
      />

      {/* Overdue alert banner if any */}
      {overdueTasks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Overdue Tasks ({overdueTasks.length})</span>
          </div>
          <TaskList
            tasks={overdueTasks}
            emptyTitle="No overdue tasks"
            emptySubtitle=""
            viewMode={viewMode}
          />
        </div>
      )}

      {/* Today's Tasks */}
      <div className="space-y-2.5">
        {overdueTasks.length > 0 && (
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Due Today ({currentTodayTasks.length})
          </h3>
        )}
        <TaskList
          tasks={overdueTasks.length > 0 ? currentTodayTasks : todayTasks}
          emptyTitle="Today is clear! 🎉"
          emptySubtitle="No tasks scheduled for today. Click + Add Task to get started."
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}
