'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Calendar,
  Flag,
  Folder,
  Clock,
  Sparkles,
  Repeat,
  Tag as TagIcon,
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { parseNaturalLanguageTask, ParsedTask } from '@/lib/nlp';
import { cn, getPriorityColor } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

export function QuickAddModal() {
  const { quickAddOpen, setQuickAddOpen, createTask, projects, defaultProjectId } = useTasks();
  const [input, setInput] = useState('');
  const [notes, setNotes] = useState('');
  const [parsed, setParsed] = useState<ParsedTask | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('NONE');
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quickAddOpen) {
      // Pre-select default project (e.g. when opening from a project page)
      setSelectedProjectId(defaultProjectId || '');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setInput('');
      setInputError('');
      setNotes('');
      setParsed(null);
      setSelectedProjectId('');
      setSelectedPriority('NONE');
    }
  }, [quickAddOpen, defaultProjectId]);

  useEffect(() => {
    if (!input.trim()) {
      setParsed(null);
      return;
    }
    const result = parseNaturalLanguageTask(input);
    setParsed(result);

    if (result.priority !== 'NONE') {
      setSelectedPriority(result.priority);
    }
    if (result.projectName) {
      const match = projects.find(p => p.name.toLowerCase() === result.projectName?.toLowerCase());
      if (match) setSelectedProjectId(match.id);
    }
  }, [input, projects]);

  if (!quickAddOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) {
      setInputError('Task title cannot be empty');
      inputRef.current?.focus();
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    const parsedData = parsed || parseNaturalLanguageTask(input);

    await createTask({
      title: parsedData.title,
      notes: notes.trim() || null,
      dueDate: parsedData.dueDate || null,
      dueTime: parsedData.dueTime || null,
      priority: selectedPriority !== 'NONE' ? selectedPriority : parsedData.priority,
      projectId: selectedProjectId || null,
      projectName: !selectedProjectId && parsedData.projectName ? parsedData.projectName : undefined,
      tags: parsedData.tags,
      estimatedMinutes: parsedData.estimatedMinutes,
      isRecurring: parsedData.isRecurring,
      recurrenceRule: parsedData.recurrenceRule,
    });

    setSubmitting(false);
    setQuickAddOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuickAddOpen(false);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setQuickAddOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — primary indigo background */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-indigo-600 dark:bg-indigo-700">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-indigo-200" />
            Quick Add Task
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                if (inputError) setInputError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder='e.g. Call John tomorrow at 10 AM #work !high ~30m'
              className={cn(
                'w-full text-base font-medium bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400',
                inputError && 'placeholder:text-rose-400'
              )}
            />
            {inputError && (
              <p className="text-xs text-rose-500 font-medium mt-1">{inputError}</p>
            )}
          </div>

          <div>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Description or notes (optional)..."
              className="w-full text-xs font-normal bg-transparent border-none outline-none text-slate-600 dark:text-slate-300 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Live Natural Language Parsing Chips */}
          {parsed && (parsed.dueDate || parsed.priority !== 'NONE' || parsed.projectName || parsed.tags.length > 0 || parsed.estimatedMinutes > 0 || parsed.isRecurring) && (
            <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3" /> Detected:
              </span>

              {parsed.dueDate && (
                <Badge variant="indigo" size="xs" icon={<Calendar className="w-3 h-3" />}>
                  {parsed.dueDate} {parsed.dueTime ? `at ${parsed.dueTime}` : ''}
                </Badge>
              )}

              {parsed.priority !== 'NONE' && (
                <Badge
                  variant={
                    parsed.priority === 'HIGH'
                      ? 'rose'
                      : parsed.priority === 'MEDIUM'
                      ? 'amber'
                      : 'sky'
                  }
                  size="xs"
                  icon={<Flag className="w-3 h-3" />}
                >
                  {parsed.priority}
                </Badge>
              )}

              {parsed.projectName && (
                <Badge variant="slate" size="xs" icon={<Folder className="w-3 h-3 text-indigo-500" />}>
                  #{parsed.projectName}
                </Badge>
              )}

              {parsed.estimatedMinutes > 0 && (
                <Badge variant="slate" size="xs" icon={<Clock className="w-3 h-3 text-amber-500" />}>
                  {parsed.estimatedMinutes}m
                </Badge>
              )}

              {parsed.isRecurring && (
                <Badge variant="emerald" size="xs" icon={<Repeat className="w-3 h-3 text-emerald-500" />}>
                  Recurring
                </Badge>
              )}

              {parsed.tags.map(tag => (
                <Badge key={tag} variant="sky" size="xs" icon={<TagIcon className="w-3 h-3" />}>
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Quick Selectors & Submit — Project + Priority side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-1">
              {/* Project selector */}
              <Select
                selectSize="sm"
                value={selectedProjectId}
                onChange={(val: any) => setSelectedProjectId(val?.target ? val.target.value : val)}
                containerClassName="flex-1"
                leftIcon={<Folder className="w-3.5 h-3.5 text-indigo-400" />}
              >
                <option value="">Inbox</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </Select>

              {/* Priority selector */}
              <Select
                selectSize="sm"
                value={selectedPriority}
                onChange={(val: any) => setSelectedPriority(val?.target ? val.target.value : val)}
                containerClassName="flex-1"
                leftIcon={<Flag className="w-3.5 h-3.5 text-amber-400" />}
              >
                <option value="NONE">No Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuickAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!input.trim() || submitting}
                isLoading={submitting}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Task
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
