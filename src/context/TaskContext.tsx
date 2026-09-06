'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { TaskRow, SubtaskRow } from '@/server/db/tasks';
import { ProjectRow } from '@/server/db/projects';
import { TagRow } from '@/server/db/tags';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { soundManager } from '@/lib/audio';
import { offlineDb } from '@/db/offline';

export type UpdateTaskFields = Partial<TaskRow> & {
  projectId?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  reminderAt?: string | null;
  isCompleted?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  estimatedMinutes?: number;
  actualMinutes?: number;
};

interface TaskContextType {
  tasks: TaskRow[];
  projects: ProjectRow[];
  tags: TagRow[];
  isLoading: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  sortBy: 'position' | 'dueDate' | 'priority' | 'title';
  setSortBy: (s: 'position' | 'dueDate' | 'priority' | 'title') => void;
  selectedTask: TaskRow | null;
  setSelectedTask: (task: TaskRow | null) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  defaultProjectId: string;
  setDefaultProjectId: (id: string) => void;
  
  // Task Actions
  refreshAll: () => Promise<void>;
  createTask: (data: any) => Promise<TaskRow | null>;
  updateTask: (id: string, fields: UpdateTaskFields) => Promise<TaskRow | null>;
  toggleTaskComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;

  // Subtask Actions
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // Project Actions
  createProject: (data: { name: string; color?: string; icon?: string; isFavorite?: boolean }) => Promise<ProjectRow | null>;
  updateProject: (id: string, data: Partial<ProjectRow>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Tag Actions
  createTag: (name: string, color?: string) => Promise<TagRow | null>;

  // Helpers
  triggerConfetti: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, currentUser } = useAuth();
  const { toast, showUndo } = useToast();

  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeView, setActiveView] = useState<string>('today');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'position' | 'dueDate' | 'priority' | 'title'>('position');

  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [defaultProjectId, setDefaultProjectId] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      soundManager.setEnabled(currentUser.soundEnabled);
    }
  }, [currentUser]);

  // Fetch all tasks from server & sync with offline DB
  const refreshTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/tasks?includeCompleted=true');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.tasks)) {
          setTasks(json.tasks);
          // Sync with Dexie IndexedDB
          try {
            await offlineDb.tasks.clear();
            await offlineDb.tasks.bulkPut(json.tasks);
          } catch {
            // Non-blocking
          }
        }
      }
    } catch {
      // Offline fallback: load from IndexedDB
      try {
        const cached = await offlineDb.tasks.toArray();
        if (cached && cached.length > 0) setTasks(cached);
      } catch {
        // Ignore
      }
    }
  }, [isAuthenticated]);

  const refreshProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.projects)) {
          setProjects(json.projects);
          try {
            await offlineDb.projects.clear();
            await offlineDb.projects.bulkPut(json.projects);
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      try {
        const cached = await offlineDb.projects.toArray();
        if (cached && cached.length > 0) setProjects(cached);
      } catch {
        // Ignore
      }
    }
  }, [isAuthenticated]);

  const refreshTags = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.tags)) {
          setTags(json.tags);
        }
      }
    } catch {
      // Ignore
    }
  }, [isAuthenticated]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([refreshTasks(), refreshProjects(), refreshTags()]);
    setIsLoading(false);
  }, [refreshTasks, refreshProjects, refreshTags]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setTasks([]);
      setProjects([]);
      setTags([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshAll]);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
    });
  }, []);

  // Task Actions
  const createTask = useCallback(async (data: any): Promise<TaskRow | null> => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.task) {
        setTasks(prev => [json.task, ...prev]);
        toast('Task created', { type: 'success' });
        return json.task;
      }
      toast(json.error || 'Failed to create task', { type: 'error' });
      return null;
    } catch {
      toast('Network error creating task', { type: 'error' });
      return null;
    }
  }, [toast]);

  const updateTask = useCallback(async (id: string, fields: UpdateTaskFields): Promise<TaskRow | null> => {
    const normalized: Partial<TaskRow> = { ...fields };
    if (fields.projectId !== undefined) normalized.project_id = fields.projectId;
    if (fields.dueDate !== undefined) normalized.due_date = fields.dueDate;
    if (fields.dueTime !== undefined) normalized.due_time = fields.dueTime;
    if (fields.reminderAt !== undefined) normalized.reminder_at = fields.reminderAt;
    if (fields.isCompleted !== undefined) normalized.is_completed = fields.isCompleted ? 1 : 0;
    if (fields.isRecurring !== undefined) normalized.is_recurring = fields.isRecurring ? 1 : 0;
    if (fields.recurrenceRule !== undefined) normalized.recurrence_rule = fields.recurrenceRule;
    if (fields.estimatedMinutes !== undefined) normalized.estimated_minutes = fields.estimatedMinutes;
    if (fields.actualMinutes !== undefined) normalized.actual_minutes = fields.actualMinutes;

    // Optimistic update
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...normalized } : t)));
    if (selectedTask?.id === id) {
      setSelectedTask(prev => (prev ? { ...prev, ...normalized } : null));
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const json = await res.json();
      if (json.success && json.task) {
        setTasks(prev => prev.map(t => (t.id === id ? json.task : t)));
        if (selectedTask?.id === id) setSelectedTask(json.task);
        return json.task;
      }
      refreshTasks();
      return null;
    } catch {
      refreshTasks();
      return null;
    }
  }, [selectedTask, refreshTasks]);

  const toggleTaskComplete = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextCompleted = task.is_completed === 1 ? 0 : 1;
    const isNowDone = nextCompleted === 1;

    if (isNowDone) {
      soundManager.playCompletion();
    }

    // Optimistic update
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, is_completed: nextCompleted, status: isNowDone ? 'DONE' : 'TODO' } : t)));
    if (selectedTask?.id === id) {
      setSelectedTask(prev => prev ? { ...prev, is_completed: nextCompleted, status: isNowDone ? 'DONE' : 'TODO' } : null);
    }

    // Check if user cleared all today's tasks
    if (isNowDone && activeView === 'today') {
      const remainingToday = tasks.filter(t => t.id !== id && t.is_completed === 0 && t.due_date && t.due_date <= new Date().toISOString().split('T')[0]);
      if (remainingToday.length === 0) {
        triggerConfetti();
      }
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: isNowDone }),
      });
      const json = await res.json();
      if (json.success) {
        if (isNowDone) {
          showUndo('Task completed', async () => {
            // Explicitly revert completion (isCompleted: false, status: 'TODO')
            setTasks(prev =>
              prev.map(t => (t.id === id ? { ...t, is_completed: 0, status: 'TODO', completed_at: null } : t))
            );
            if (selectedTask?.id === id) {
              setSelectedTask(prev =>
                prev ? { ...prev, is_completed: 0, status: 'TODO', completed_at: null } : null
              );
            }
            try {
              await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: false, status: 'TODO' }),
              });
            } catch (err) {
              console.error('Failed to undo completion:', err);
            }
            refreshTasks();
          });
        }
      } else {
        refreshTasks();
      }
    } catch {
      refreshTasks();
    }
  }, [tasks, selectedTask, activeView, triggerConfetti, showUndo, refreshTasks]);

  const deleteTask = useCallback(async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;

    // Optimistic remove
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showUndo(`Deleted "${target.title}"`, async () => {
          await fetch(`/api/tasks/${id}/restore`, { method: 'POST' });
          refreshTasks();
          toast('Task restored', { type: 'success' });
        });
      } else {
        refreshTasks();
      }
    } catch {
      refreshTasks();
    }
  }, [tasks, selectedTask, showUndo, refreshTasks, toast]);

  const restoreTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/restore`, { method: 'POST' });
      const json = await res.json();
      if (json.success && json.task) {
        setTasks(prev => [json.task, ...prev]);
        toast('Task restored', { type: 'success' });
      }
    } catch {
      toast('Failed to restore task', { type: 'error' });
    }
  }, [toast]);

  const reorderTasks = useCallback(async (orderedIds: string[]) => {
    // Reorder locally
    const idMap = new Map(tasks.map(t => [t.id, t]));
    const reordered: TaskRow[] = [];
    orderedIds.forEach(id => {
      const item = idMap.get(id);
      if (item) reordered.push(item);
    });
    // Append remaining
    tasks.forEach(t => {
      if (!orderedIds.includes(t.id)) reordered.push(t);
    });
    setTasks(reordered);

    try {
      await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds: orderedIds }),
      });
    } catch {
      // Revert if error
      refreshTasks();
    }
  }, [tasks, refreshTasks]);

  // Subtask Actions
  const addSubtask = useCallback(async (taskId: string, title: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      if (json.success && json.subtask) {
        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            const currentSubtasks = t.subtasks || [];
            return { ...t, subtasks: [...currentSubtasks, json.subtask] };
          }
          return t;
        }));
        if (selectedTask?.id === taskId) {
          setSelectedTask(prev => prev ? { ...prev, subtasks: [...(prev.subtasks || []), json.subtask] } : null);
        }
      }
    } catch {
      toast('Failed to add subtask', { type: 'error' });
    }
  }, [selectedTask, toast]);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    // Optimistic toggle
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const subtasks = (t.subtasks || []).map(s => s.id === subtaskId ? { ...s, is_completed: s.is_completed === 1 ? 0 : 1 } : s);
        return { ...t, subtasks };
      }
      return t;
    }));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => {
        if (!prev) return null;
        const subtasks = (prev.subtasks || []).map(s => s.id === subtaskId ? { ...s, is_completed: s.is_completed === 1 ? 0 : 1 } : s);
        return { ...prev, subtasks };
      });
    }

    try {
      await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtaskId }),
      });
    } catch {
      refreshTasks();
    }
  }, [selectedTask, refreshTasks]);

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: (t.subtasks || []).filter(s => s.id !== subtaskId) };
      }
      return t;
    }));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, subtasks: (prev.subtasks || []).filter(s => s.id !== subtaskId) } : null);
    }

    try {
      await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtaskId }),
      });
    } catch {
      refreshTasks();
    }
  }, [selectedTask, refreshTasks]);

  // Project Actions
  const createProject = useCallback(async (data: { name: string; color?: string; icon?: string; isFavorite?: boolean }) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.project) {
        setProjects(prev => [...prev, json.project]);
        toast('Project created', { type: 'success' });
        return json.project;
      }
      toast(json.error || 'Failed to create project', { type: 'error' });
      return null;
    } catch {
      toast('Network error creating project', { type: 'error' });
      return null;
    }
  }, [toast]);

  const updateProject = useCallback(async (id: string, data: Partial<ProjectRow>) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.project) {
        setProjects(prev => prev.map(p => p.id === id ? json.project : p));
        toast('Project updated', { type: 'success' });
      }
    } catch {
      toast('Failed to update project', { type: 'error' });
    }
  }, [toast]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) {
          setActiveProjectId(null);
          setActiveView('inbox');
        }
        refreshTasks();
        toast('Project deleted', { type: 'success' });
      }
    } catch {
      toast('Failed to delete project', { type: 'error' });
    }
  }, [activeProjectId, refreshTasks, toast]);

  // Tag Actions
  const createTag = useCallback(async (name: string, color?: string) => {
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });
      const json = await res.json();
      if (json.success && json.tag) {
        setTags(prev => [...prev.filter(t => t.id !== json.tag.id), json.tag]);
        return json.tag;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        tags,
        isLoading,
        activeView,
        setActiveView,
        activeProjectId,
        setActiveProjectId,
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        sortBy,
        setSortBy,
        selectedTask,
        setSelectedTask,
        quickAddOpen,
        setQuickAddOpen,
        commandPaletteOpen,
        setCommandPaletteOpen,
        defaultProjectId,
        setDefaultProjectId,
        refreshAll,
        createTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        restoreTask,
        reorderTasks,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        createProject,
        updateProject,
        deleteProject,
        createTag,
        triggerConfetti,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
}
