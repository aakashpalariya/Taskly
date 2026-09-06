'use client';

import React, { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { TaskList } from '@/components/tasks/TaskList';
import { PageHeader } from '@/components/ui/PageHeader';
import { Inbox, LayoutList, Table as TableIcon } from 'lucide-react';

export default function InboxPage() {
  const { tasks, searchQuery, priorityFilter, sortBy } = useTasks();
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  let inboxTasks = tasks.filter(t => t.is_completed === 0 && !t.project_id);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    inboxTasks = inboxTasks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.tags?.some(tag => tag.name.toLowerCase().includes(q))
    );
  }

  if (priorityFilter !== 'ALL') {
    inboxTasks = inboxTasks.filter(t => t.priority === priorityFilter);
  }

  if (sortBy === 'dueDate') {
    inboxTasks.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
  } else if (sortBy === 'priority') {
    const pWeight = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
    inboxTasks.sort((a, b) => (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0));
  } else if (sortBy === 'title') {
    inboxTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    inboxTasks.sort((a, b) => a.position - b.position);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        eyebrow={{
          icon: <Inbox className="w-3.5 h-3.5" />,
          label: 'Default Capture',
          color: 'text-sky-500',
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

      <TaskList
        tasks={inboxTasks}
        emptyTitle="Inbox Zero achieved! 🚀"
        emptySubtitle="Capture any thought, idea or task here to organize later."
        viewMode={viewMode}
      />
    </div>
  );
}
