'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Flag,
  Folder,
  Plus,
  Trash2,
  Play,
  Repeat,
  CheckCircle2,
  Circle,
  Clock,
  Tag as TagIcon
} from 'lucide-react';
import { TaskRow } from '@/server/db/tasks';
import { useTasks } from '@/context/TaskContext';
import { cn, getPriorityColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { MarqueeText } from '@/components/ui/MarqueeText';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface TaskDetailDrawerProps {
  task: TaskRow | null;
  onClose: () => void;
}

export function TaskDetailDrawer({ task, onClose }: TaskDetailDrawerProps) {
  const router = useRouter();
  const {
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    projects,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'NONE'>('NONE');
  const [projectId, setProjectId] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isDeleteTaskConfirmOpen, setIsDeleteTaskConfirmOpen] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setNotes(task.notes || '');
      setDueDate(task.due_date || '');
      setDueTime(task.due_time || '');
      setPriority(task.priority || 'NONE');
      setProjectId(task.project_id || '');
      setIsRecurring(task.is_recurring === 1);
      if (task.recurrence_rule) {
        try {
          const rule = JSON.parse(task.recurrence_rule);
          if (rule.frequency) setRecurringFreq(rule.frequency);
        } catch {
          // Ignore
        }
      }
    }
  }, [task]);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleNotesBlur = () => {
    if (notes !== (task.notes || '')) {
      updateTask(task.id, { notes: notes.trim() || null });
    }
  };

  const handleDueDateChange = (date: string) => {
    setDueDate(date);
    updateTask(task.id, { dueDate: date || null });
  };

  const handleDueTimeChange = (time: string) => {
    setDueTime(time);
    updateTask(task.id, { dueTime: time || null });
  };

  const handlePriorityChange = (p: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE') => {
    setPriority(p);
    updateTask(task.id, { priority: p });
  };

  const handleProjectChange = (pId: string) => {
    setProjectId(pId);
    updateTask(task.id, { projectId: pId || null });
  };

  const handleRecurringToggle = (enabled: boolean) => {
    setIsRecurring(enabled);
    const rule = enabled ? JSON.stringify({ frequency: recurringFreq, interval: 1 }) : null;
    updateTask(task.id, { isRecurring: enabled, recurrenceRule: rule });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter(s => s.is_completed === 1).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-right duration-250"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with primary background */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-indigo-600 dark:bg-indigo-700 text-white gap-3">
          {/* Left: title + marquee */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <MarqueeText
              text={title || task.title}
              className="text-sm font-bold text-white"
            />
          </div>

          {/* Right: Focus, Delete, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="subtle"
              leftIcon={<Play className="w-3.5 h-3.5" />}
              onClick={() => {
                router.push(`/pomodoro?taskId=${task.id}`);
                onClose();
              }}
              className="shrink-0 bg-white/20 hover:bg-white/30 text-white border-transparent text-xs"
            >
              Focus
            </Button>
            <button
              type="button"
              className="p-1.5 rounded-xl text-indigo-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Delete task"
              onClick={() => setIsDeleteTaskConfirmOpen(true)}
            >
              <Trash2 className="w-4 h-4 text-rose-300 hover:text-rose-200" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-xl text-indigo-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              onClick={onClose}
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
          {/* Title edit input */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Task Name
            </span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Edit task title..."
              className="w-full text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Metadata Grid (Responsive 1-col on mobile, 2-col on sm, custom proportions on desktop: Project larger, Priority smaller) */}
          <div className="grid grid-cols-12 gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            {/* Project (little bit big in desktop mode) */}
            <div className="col-span-12 sm:col-span-7 lg:col-span-4">
              <Select
                label="Project"
                leftIcon={<Folder className="w-3.5 h-3.5 text-indigo-500" />}
                value={projectId}
                onChange={(val: any) => handleProjectChange(val?.target ? val.target.value : val)}
              >
                <option value="">📥 Inbox (No project)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Priority (little bit small in desktop mode) */}
            <div className="col-span-12 sm:col-span-5 lg:col-span-2">
              <Select
                label="Priority"
                leftIcon={<Flag className="w-3.5 h-3.5 text-amber-500" />}
                value={priority}
                onChange={(val: any) => handlePriorityChange((val?.target ? val.target.value : val) as any)}
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>

            {/* Due Date */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={handleDueDateChange}
              />
            </div>

            {/* Due Time (Guaranteed right-aligned to prevent drawer overflow) */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <TimePicker
                label="Due Time"
                value={dueTime}
                onChange={handleDueTimeChange}
                align="right"
              />
            </div>
          </div>

          {/* Recurring section */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Recurring Task</span>
            </div>
            <div className="flex items-center gap-2">
              {isRecurring && (
                <Select
                  selectSize="sm"
                  value={recurringFreq}
                  onChange={(val: any) => {
                    const freq = val?.target ? val.target.value : val;
                    setRecurringFreq(freq as any);
                    const rule = JSON.stringify({ frequency: freq, interval: 1 });
                    updateTask(task.id, { recurrenceRule: rule });
                  }}
                  containerClassName="w-28"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              )}
              <Checkbox
                checked={isRecurring}
                onChange={handleRecurringToggle}
                size="sm"
              />
            </div>
          </div>

          {/* Checklist / Subtasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Subtasks ({completedCount}/{subtasks.length})
              </span>
              {subtasks.length > 0 && (
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {progressPercent}%
                </span>
              )}
            </div>

            {subtasks.length > 0 && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Subtask list */}
            <div className="space-y-1.5">
              {subtasks.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, s.id)}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer mr-2"
                  >
                    {s.is_completed === 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                    )}
                    <MarqueeText
                      text={s.title}
                      className={cn(
                        'text-xs font-medium flex-1',
                        s.is_completed === 1 ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'
                      )}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubtaskToDelete({ id: s.id, title: s.title })}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded cursor-pointer transition-opacity"
                    title="Delete subtask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Add a subtask"
                className="flex-1 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!newSubtaskTitle.trim()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add
              </Button>
            </form>
          </div>

          {/* Notes / Description */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Notes & Description
            </span>
            <textarea
              rows={5}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add details, notes, links..."
              className="w-full text-sm font-normal bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 resize-y min-h-[120px] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Confirm Modal for Task Deletion */}
      <ConfirmModal
        isOpen={isDeleteTaskConfirmOpen}
        onClose={() => setIsDeleteTaskConfirmOpen(false)}
        onConfirm={async () => {
          await deleteTask(task.id);
          setIsDeleteTaskConfirmOpen(false);
          onClose();
        }}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.title}"? This task will be removed.`}
        confirmText="Delete Task"
        variant="danger"
      />

      {/* Confirm Modal for Subtask Deletion */}
      <ConfirmModal
        isOpen={!!subtaskToDelete}
        onClose={() => setSubtaskToDelete(null)}
        onConfirm={async () => {
          if (subtaskToDelete) {
            await deleteSubtask(task.id, subtaskToDelete.id);
            setSubtaskToDelete(null);
          }
        }}
        title="Delete Subtask?"
        message={`Are you sure you want to delete "${subtaskToDelete?.title}"?`}
        confirmText="Delete Subtask"
        variant="danger"
      />
    </div>
  );
}
