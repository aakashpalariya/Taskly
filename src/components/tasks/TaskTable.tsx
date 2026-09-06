'use client';

import React, { useState } from 'react';
import { TaskRow } from '@/server/db/tasks';
import { useTasks } from '@/context/TaskContext';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MarqueeText } from '@/components/ui/MarqueeText';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatDueDate, getPriorityColor, cn } from '@/lib/utils';
import {
  Check,
  Calendar,
  Clock,
  Play,
  Trash2,
  Repeat,
  CheckSquare,
  MoreVertical,
  Edit2,
  Folder,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TaskTableProps {
  tasks: TaskRow[];
  onOpenDetail: (task: TaskRow) => void;
}

export function TaskTable({ tasks, onOpenDetail }: TaskTableProps) {
  const router = useRouter();
  const { toggleTaskComplete, deleteTask } = useTasks();
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'rose';
      case 'MEDIUM':
        return 'amber';
      case 'LOW':
        return 'sky';
      default:
        return 'slate';
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View (md and up) */}
      <div className="hidden md:block">
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Status</TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="w-36">Project</TableHead>
                <TableHead className="w-28">Priority</TableHead>
                <TableHead className="w-36">Due Date</TableHead>
                <TableHead className="w-24 text-center">Subtasks</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const isDone = task.is_completed === 1;
                const { label: dueLabel, isOverdue, isToday } = formatDueDate(
                  task.due_date,
                  task.due_time
                );
                const subtasks = task.subtasks || [];
                const completedSubtasks = subtasks.filter((s) => s.is_completed === 1).length;

                return (
                  <TableRow
                    key={task.id}
                    className={cn(
                      'cursor-pointer group',
                      isDone && 'opacity-60 bg-slate-50/40 dark:bg-slate-900/30'
                    )}
                    onClick={() => onOpenDetail(task)}
                  >
                    {/* Checkbox */}
                    <TableCell
                      className="text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                    >
                      <button
                        type="button"
                        className={cn(
                          'w-5 h-5 mx-auto rounded-md border flex items-center justify-center transition-all cursor-pointer',
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-transparent'
                        )}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </TableCell>

                    {/* Title & Notes */}
                    <TableCell className="max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-2">
                        <MarqueeText
                          text={task.title}
                          className={cn(
                            'font-semibold text-xs sm:text-sm flex-1',
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          )}
                        />
                        {task.is_recurring === 1 && (
                          <span title="Recurring task" className="shrink-0">
                            <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                          </span>
                        )}
                      </div>
                      {task.notes && (
                        <MarqueeText
                          text={task.notes}
                          className="text-xs text-slate-400 dark:text-slate-500 mt-0.5"
                        />
                      )}
                    </TableCell>

                    {/* Project */}
                    <TableCell>
                      {task.project_name ? (
                        <Badge variant="slate" size="xs">
                          <span>{task.project_icon || '📁'}</span>
                          <span className="truncate max-w-[100px]">{task.project_name}</span>
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      {task.priority !== 'NONE' ? (
                        <Badge variant={getPriorityBadgeVariant(task.priority)} size="xs">
                          {task.priority}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Due Date */}
                    <TableCell>
                      {task.due_date ? (
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
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Subtasks */}
                    <TableCell className="text-center">
                      {subtasks.length > 0 ? (
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {completedSubtasks}/{subtasks.length}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isDone && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Start Pomodoro Focus"
                            onClick={() => router.push(`/pomodoro?taskId=${task.id}`)}
                          >
                            <Play className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          </Button>
                        )}
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="View Details"
                          onClick={() => onOpenDetail(task)}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete task"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToDelete({ id: task.id, title: task.title });
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Mobile Stacked Responsive Table View (below md) */}
      <div className="md:hidden space-y-2.5">
        {tasks.map((task) => {
          const isDone = task.is_completed === 1;
          const { label: dueLabel, isOverdue, isToday } = formatDueDate(
            task.due_date,
            task.due_time
          );
          const subtasks = task.subtasks || [];
          const completedSubtasks = subtasks.filter((s) => s.is_completed === 1).length;

          return (
            <div
              key={task.id}
              onClick={() => onOpenDetail(task)}
              className={cn(
                'p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs space-y-2.5',
                isDone
                  ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-70'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300'
              )}
            >
              {/* Top row: Checkbox + Title + Recurring + Delete */}
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-colors',
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    )}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <MarqueeText
                        text={task.title}
                        className={cn(
                          'text-xs font-semibold flex-1',
                          isDone
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-slate-100'
                        )}
                      />
                      {task.is_recurring === 1 && (
                        <Repeat className="w-3 h-3 text-indigo-500 shrink-0" />
                      )}
                    </div>
                    {task.notes && (
                      <MarqueeText
                        text={task.notes}
                        className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-full"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {!isDone && (
                    <button
                      onClick={() => router.push(`/pomodoro?taskId=${task.id}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      title="Focus in Pomodoro"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskToDelete({ id: task.id, title: task.title });
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Badges row: Project, Priority, Due Date, Subtasks */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
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

                {task.priority !== 'NONE' && (
                  <Badge variant={getPriorityBadgeVariant(task.priority)} size="xs">
                    {task.priority}
                  </Badge>
                )}

                {task.project_name && (
                  <Badge variant="slate" size="xs">
                    <span>{task.project_icon || '📁'}</span>
                    <span>{task.project_name}</span>
                  </Badge>
                )}

                {subtasks.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <CheckSquare className="w-3 h-3" />
                    {completedSubtasks}/{subtasks.length}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Common Confirm Modal for Task Table Deletion */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (taskToDelete) {
            await deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        title="Delete Task?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
        variant="danger"
      />
    </div>
  );
}
