'use client';

import React, { useState } from 'react';
import { TaskRow } from '@/server/db/tasks';
import { TaskCard } from './TaskCard';
import { useTasks } from '@/context/TaskContext';
import { Sparkles, CheckCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { EmptyState } from '@/components/ui/EmptyState';
import { TaskTable } from './TaskTable';

interface TaskListProps {
  tasks: TaskRow[];
  emptyTitle?: string;
  emptySubtitle?: string;
  isDraggable?: boolean;
  viewMode?: 'list' | 'table';
}

export function TaskList({
  tasks,
  emptyTitle = 'All caught up!',
  emptySubtitle = 'No pending tasks in this view. Enjoy your day or add a new task.',
  isDraggable = true,
  viewMode = 'list',
}: TaskListProps) {
  const router = useRouter();
  const { setSelectedTask, reorderTasks, setQuickAddOpen } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetId) return;

    const currentIds = tasks.map(t => t.id);
    const fromIndex = currentIds.indexOf(draggedTaskId);
    const toIndex = currentIds.indexOf(targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const reordered = [...currentIds];
      const [removed] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, removed);
      reorderTasks(reordered);
    }
    setDraggedTaskId(null);
  };

  if (tasks.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptySubtitle}
        action={{
          label: 'Add a task',
          onClick: () => setQuickAddOpen(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />
    );
  }

  if (viewMode === 'table') {
    return <TaskTable tasks={tasks} onOpenDetail={t => setSelectedTask(t)} />;
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onOpenDetail={t => setSelectedTask(t)}
          onStartPomodoro={t => router.push(`/pomodoro?taskId=${t.id}`)}
          isDraggable={isDraggable}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
