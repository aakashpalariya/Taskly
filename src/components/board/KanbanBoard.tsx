'use client';

import React, { useState } from 'react';
import { TaskRow } from '@/server/db/tasks';
import { useTasks } from '@/context/TaskContext';
import { TaskCard } from '../tasks/TaskCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react';

export function KanbanBoard() {
  const { tasks, updateTask, toggleTaskComplete, setQuickAddOpen, setSelectedTask } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const todoTasks = tasks.filter(t => t.is_completed === 0 && (t.status === 'TODO' || !t.status));
  const inProgressTasks = tasks.filter(t => t.is_completed === 0 && t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.is_completed === 1 || t.status === 'DONE');

  const columns = [
    {
      id: 'TODO',
      title: 'To Do',
      tasks: todoTasks,
      icon: Circle,
      color: 'text-slate-400',
      headerBg: 'bg-slate-100 dark:bg-slate-800/60',
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      tasks: inProgressTasks,
      icon: Clock,
      color: 'text-amber-500',
      headerBg: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
    {
      id: 'DONE',
      title: 'Completed',
      tasks: doneTasks,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = (targetColumnId: string) => {
    if (!draggedTaskId) return;

    if (targetColumnId === 'DONE') {
      const task = tasks.find(t => t.id === draggedTaskId);
      if (task && task.is_completed === 0) {
        toggleTaskComplete(draggedTaskId);
      }
    } else if (targetColumnId === 'IN_PROGRESS') {
      updateTask(draggedTaskId, { status: 'IN_PROGRESS', isCompleted: false });
    } else if (targetColumnId === 'TODO') {
      updateTask(draggedTaskId, { status: 'TODO', isCompleted: false });
    }

    setDraggedTaskId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-start">
      {columns.map(col => {
        const Icon = col.icon;
        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnColumn(col.id)}
            className="flex flex-col bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs min-h-[420px] sm:min-h-[480px]"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 ${col.headerBg}`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${col.color}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {col.title}
                </span>
                <Badge variant="slate" size="xs">
                  {col.tasks.length}
                </Badge>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setQuickAddOpen(true)}
                title="Add task"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Column Tasks */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {col.tasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onOpenDetail={task => setSelectedTask(task)}
                  isDraggable
                  onDragStart={handleDragStart}
                />
              ))}

              {col.tasks.length === 0 && (
                <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-400">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
