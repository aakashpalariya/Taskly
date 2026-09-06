'use client';

import React, { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { TaskList } from '@/components/tasks/TaskList';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, LayoutList, Table as TableIcon } from 'lucide-react';

export default function CompletedPage() {
  const { tasks, searchQuery } = useTasks();
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  let completedTasks = tasks.filter(t => t.is_completed === 1);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    completedTasks = completedTasks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.tags?.some(tag => tag.name.toLowerCase().includes(q))
    );
  }

  // Sort by completed_at desc
  completedTasks.sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Completed Tasks"
        eyebrow={{
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Archive',
          color: 'text-emerald-500',
        }}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">
              Total: {completedTasks.length}
            </Badge>

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

      <TaskList
        tasks={completedTasks}
        emptyTitle="No completed tasks yet"
        emptySubtitle="Check off tasks from Today or Inbox to build your achievement archive."
        isDraggable={false}
        viewMode={viewMode}
      />
    </div>
  );
}
