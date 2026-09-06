'use client';

import React, { useState } from 'react';
import { Check, Calendar, Flag, Clock, MoreVertical, Trash2, Play, Repeat, CheckSquare, GripVertical } from 'lucide-react';
import { TaskRow } from '@/server/db/tasks';
import { useTasks } from '@/context/TaskContext';
import { formatDueDate, getPriorityColor, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { MarqueeText } from '@/components/ui/MarqueeText';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface TaskCardProps {
  task: TaskRow;
  onOpenDetail: (task: TaskRow) => void;
  onStartPomodoro?: (task: TaskRow) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
}

export function TaskCard({
  task,
  onOpenDetail,
  onStartPomodoro,
  isDraggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}: TaskCardProps) {
  const { toggleTaskComplete, deleteTask } = useTasks();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isDone = task.is_completed === 1;
  const { label: dueLabel, isOverdue, isToday } = formatDueDate(task.due_date, task.due_time);
  const priorityInfo = getPriorityColor(task.priority);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.is_completed === 1).length;

  return (
    <div
      draggable={isDraggable}
      onDragStart={e => onDragStart && onDragStart(e, task.id)}
      onDragOver={e => {
        if (onDragOver) {
          e.preventDefault();
          onDragOver(e);
        }
      }}
      onDrop={e => onDrop && onDrop(e, task.id)}
      className={cn(
        'group relative flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 border cursor-pointer',
        'bg-white dark:bg-slate-900 hover:shadow-md dark:hover:shadow-slate-950/50',
        isDone
          ? 'border-slate-200 dark:border-slate-800/60 opacity-60 bg-slate-50/50 dark:bg-slate-900/30'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900/60 shadow-xs'
      )}
      onClick={() => onOpenDetail(task)}
    >
      {/* Drag handle */}
      {isDraggable && (
        <div
          className="text-slate-300 dark:text-slate-700 group-hover:text-slate-500 transition-colors pt-1 cursor-grab shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Checkbox */}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          toggleTaskComplete(task.id);
        }}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer',
          isDone
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-transparent'
        )}
      >
        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <MarqueeText
            text={task.title}
            className={cn(
              'text-sm font-medium transition-all leading-snug flex-1',
              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
            )}
          />
          {task.is_recurring === 1 && (
            <span className="inline-flex items-center text-xs text-indigo-500 dark:text-indigo-400 shrink-0" title="Recurring task">
              <Repeat className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Notes preview with Marquee for long descriptions */}
        {task.notes && (
          <MarqueeText
            text={task.notes}
            className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-full"
          />
        )}

        {/* Metadata Chips */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
          {/* Due date */}
          {task.due_date && (
            <Badge
              variant={
                isDone
                  ? 'slate'
                  : isOverdue
                  ? 'rose'
                  : isToday
                  ? 'amber'
                  : 'default'
              }
              size="xs"
              icon={<Calendar className="w-3 h-3" />}
            >
              {dueLabel}
            </Badge>
          )}

          {/* Priority */}
          {task.priority !== 'NONE' && (
            <Badge
              variant={
                task.priority === 'HIGH'
                  ? 'rose'
                  : task.priority === 'MEDIUM'
                  ? 'amber'
                  : 'sky'
              }
              size="xs"
              icon={<Flag className="w-3 h-3" />}
            >
              {task.priority}
            </Badge>
          )}

          {/* Project */}
          {task.project_name && (
            <Badge variant="slate" size="xs">
              <span>{task.project_icon || '📁'}</span>
              <span>{task.project_name}</span>
            </Badge>
          )}

          {/* Subtasks status */}
          {subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <CheckSquare className="w-3 h-3 text-slate-400" />
              {completedSubtasks}/{subtasks.length}
            </span>
          )}

          {/* Estimated time */}
          {task.estimated_minutes > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              {task.estimated_minutes}m
            </span>
          )}

          {/* Tags */}
          {task.tags?.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
              style={{ backgroundColor: `${tag.color}18`, color: tag.color }}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons: always visible on mobile (stacked), hover on desktop (row) */}
      <div
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center gap-1 shrink-0 self-center"
        onClick={e => e.stopPropagation()}
      >
        {onStartPomodoro && !isDone && (
          <button
            onClick={() => onStartPomodoro(task)}
            title="Start Pomodoro Focus"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          title="Delete task"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          await deleteTask(task.id);
          setIsConfirmOpen(false);
        }}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.title}"?`}
        confirmText="Delete Task"
        variant="danger"
      />
    </div>
  );
}
