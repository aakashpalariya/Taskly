'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasks } from '@/context/TaskContext';
import { TaskList } from '@/components/tasks/TaskList';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Folder, Trash2, Edit2, Check, Plus, LayoutList, Table as TableIcon } from 'lucide-react';

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const {
    projects,
    tasks,
    deleteProject,
    updateProject,
    createTask,
    searchQuery,
    priorityFilter,
    sortBy,
    setDefaultProjectId,
  } = useTasks();

  const project = projects.find(p => p.id === projectId);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  React.useEffect(() => {
    if (projectId) {
      setDefaultProjectId(projectId);
    }
    return () => {
      setDefaultProjectId('');
    };
  }, [projectId, setDefaultProjectId]);

  let projectTasks = tasks.filter(t => t.project_id === projectId && t.is_completed === 0);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    projectTasks = projectTasks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.tags?.some(tag => tag.name.toLowerCase().includes(q))
    );
  }

  if (priorityFilter !== 'ALL') {
    projectTasks = projectTasks.filter(t => t.priority === priorityFilter);
  }

  if (sortBy === 'dueDate') {
    projectTasks.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
  } else if (sortBy === 'priority') {
    const pWeight = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
    projectTasks.sort((a, b) => (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0));
  } else if (sortBy === 'title') {
    projectTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    projectTasks.sort((a, b) => a.position - b.position);
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Project not found or deleted.
      </div>
    );
  }

  const handleSaveName = async () => {
    if (name.trim()) {
      await updateProject(projectId, { name: name.trim() });
    }
    setIsEditing(false);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    await createTask({
      title: quickTitle.trim(),
      projectId: projectId,
    });
    setQuickTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={
          isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                className="text-xl font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <Button size="icon-sm" variant="primary" onClick={handleSaveName}>
                <Check className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span>{project.name}</span>
              <button
                onClick={() => {
                  setName(project.name);
                  setIsEditing(true);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Rename Project"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        }
        eyebrow={{
          icon: <span>{project.icon || '📁'}</span>,
          label: 'Project Workspace',
          color: 'text-indigo-500',
        }}
        description={`${projectTasks.length} pending task${projectTasks.length === 1 ? '' : 's'}`}
        actions={
          <div className="flex items-center gap-2">
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

            <Button
              size="icon-sm"
              variant="ghost"
              title="Delete Project"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
            </Button>
          </div>
        }
      />

      {/* Inline Quick Add into Project */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          placeholder={`+ Add task to ${project.name}...`}
          className="flex-1 h-11 text-xs sm:text-sm px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-2xs"
        />
        <Button
          type="submit"
          size="md"
          variant="primary"
          disabled={!quickTitle.trim()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add
        </Button>
      </form>

      {/* Tasks List */}
      <TaskList
        tasks={projectTasks}
        emptyTitle={`No tasks in ${project.name}`}
        emptySubtitle="Add your first task above to start tracking project progress."
        viewMode={viewMode}
      />

      {/* Common Confirm Modal for Project Deletion */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={async () => {
          await deleteProject(projectId);
          setIsDeleteConfirmOpen(false);
          router.push('/inbox');
        }}
        title="Delete Project?"
        message={`Are you sure you want to delete project "${project.name}"? Any remaining tasks will be moved to your Inbox.`}
        confirmText="Delete Project"
        variant="danger"
      />
    </div>
  );
}
