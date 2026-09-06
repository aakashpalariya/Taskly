'use client';

import React, { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { TaskList } from '@/components/tasks/TaskList';
import { PageHeader } from '@/components/ui/PageHeader';
import { Clock, LayoutList, Table as TableIcon } from 'lucide-react';

export default function UpcomingPage() {
  const { tasks, searchQuery, priorityFilter, sortBy } = useTasks();
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  let pendingTasks = tasks.filter(t => t.is_completed === 0 && t.due_date && t.due_date > todayStr);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    pendingTasks = pendingTasks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.tags?.some(tag => tag.name.toLowerCase().includes(q))
    );
  }

  if (priorityFilter !== 'ALL') {
    pendingTasks = pendingTasks.filter(t => t.priority === priorityFilter);
  }

  // Groups
  const tomorrowTasks = pendingTasks.filter(t => t.due_date === tomorrowStr);
  const next7DaysTasks = pendingTasks.filter(t => t.due_date! > tomorrowStr && t.due_date! <= nextWeekStr);
  const laterTasks = pendingTasks.filter(t => t.due_date! > nextWeekStr);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Upcoming"
        eyebrow={{
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Timeline',
          color: 'text-indigo-500',
        }}
        actions={
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
        }
      />

      {/* Tomorrow */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tomorrow ({tomorrowTasks.length})
        </h2>
        <TaskList
          tasks={tomorrowTasks}
          emptyTitle="Nothing due tomorrow"
          emptySubtitle="Enjoy your free time or schedule tasks in advance."
          viewMode={viewMode}
        />
      </div>

      {/* Next 7 Days */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          This Week ({next7DaysTasks.length})
        </h2>
        <TaskList
          tasks={next7DaysTasks}
          emptyTitle="Rest of the week looks open"
          emptySubtitle=""
          viewMode={viewMode}
        />
      </div>

      {/* Later */}
      {laterTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Later ({laterTasks.length})
          </h2>
          <TaskList
            tasks={laterTasks}
            emptyTitle="Nothing scheduled for later"
            emptySubtitle=""
            viewMode={viewMode}
          />
        </div>
      )}
    </div>
  );
}
