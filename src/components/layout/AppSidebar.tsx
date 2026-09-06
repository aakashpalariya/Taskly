'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Inbox,
  Clock,
  CheckCircle2,
  Columns3,
  Timer,
  BarChart3,
  Plus,
  Folder,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  Sparkles,
  Layers,
  User
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps = {}) {
  const pathname = usePathname();
  const { tasks, projects, setQuickAddOpen, createProject } = useTasks();
  const { effectiveTheme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjColor, setNewProjColor] = useState('#6366f1');
  const [newProjIcon, setNewProjIcon] = useState('📁');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const DEFAULT_ICONS = ['📁', '💼', '🚀', '🎯', '⭐', '🏠'];
  const ALL_ICONS = [
    '📁', '💼', '🚀', '🎯', '⭐', '🏠',
    '🔥', '💡', '🎨', '📝', '💻', '🛠️', '🎮', '🛒',
    '🏆', '✈️', '🎵', '☕', '🏃', '🧘', '📱', '🌐',
    '🔒', '🏷️', '📌', '🔑', '🎓', '🎁', '📅', '⏰',
    '❤️', '🌟', '📦', '🧩', '🧪', '📈', '📊', '👥',
    '🍔', '🥗', '🚗', '⛺', '🏖️', '🎬', '📷', '💬',
  ];

  // Compute counts
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = tasks.filter(t => t.is_completed === 0 && t.due_date && t.due_date <= todayStr).length;
  const inboxCount = tasks.filter(t => t.is_completed === 0 && !t.project_id).length;
  const upcomingCount = tasks.filter(t => t.is_completed === 0 && t.due_date && t.due_date > todayStr).length;
  const completedCount = tasks.filter(t => t.is_completed === 1).length;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newProjName.trim().slice(0, 24);
    if (!cleanName) return;
    await createProject({ name: cleanName, color: newProjColor, icon: newProjIcon });
    setNewProjName('');
    setNewProjIcon('📁');
    setIconPickerOpen(false);
    setNewProjectOpen(false);
  };

  const navItems = [
    { label: 'Today', href: '/today', icon: Calendar, count: todayCount, color: 'text-amber-500' },
    { label: 'Inbox', href: '/inbox', icon: Inbox, count: inboxCount, color: 'text-sky-500' },
    { label: 'Upcoming', href: '/upcoming', icon: Clock, count: upcomingCount, color: 'text-indigo-500' },
    { label: 'Completed', href: '/completed', icon: CheckCircle2, count: completedCount, color: 'text-emerald-500' },
  ];

  const viewItems = [
    { label: 'Board View', href: '/board', icon: Columns3 },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Focus / Pomodoro', href: '/pomodoro', icon: Timer },
    { label: 'Analytics', href: '/stats', icon: BarChart3 },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between select-none">
      {/* Top section */}
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* Brand header */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/today"
            onClick={() => onNavigate?.()}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-white p-0.5 flex items-center justify-center border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Taskly Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Taskly
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Add Button */}
        <Button
          onClick={() => {
            setQuickAddOpen(true);
            onNavigate?.();
          }}
          fullWidth
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Task
        </Button>

        {/* Smart Views */}
        <div className="space-y-0.5">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tasks
          </span>
          <div className="mt-1 space-y-0.5">
            {navItems.map(item => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors',
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4', item.color)} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <Badge
                      variant={active ? 'indigo' : 'slate'}
                      size="xs"
                    >
                      {item.count}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Views */}
        <div className="space-y-0.5">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Views
          </span>
          <div className="mt-1 space-y-0.5">
            {viewItems.map(item => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors',
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Projects / Categories */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Projects
            </span>
            <button
              onClick={() => setNewProjectOpen(!newProjectOpen)}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-0.5 cursor-pointer"
              title="Add project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New Project Form */}
          {newProjectOpen && (
            <form onSubmit={handleCreateProject} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2.5 border border-slate-200 dark:border-slate-800">
              {/* Name input with strict 24-character limit */}
              <div className="relative">
                <input
                  type="text"
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value.slice(0, 24))}
                  maxLength={24}
                  placeholder="Project name"
                  className="w-full text-xs p-1.5 pr-10 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                  autoFocus
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-mono select-none">
                  {newProjName.length}/24
                </span>
              </div>

              {/* 6 default icons + 1 '+' button in one clean single line (grid prevents overflow) */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-7 gap-1 w-full">
                  {DEFAULT_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => {
                        setNewProjIcon(icon);
                        setIconPickerOpen(false);
                      }}
                      className={cn(
                        'aspect-square rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer',
                        newProjIcon === icon
                          ? 'bg-indigo-100 dark:bg-indigo-950/70 ring-2 ring-indigo-500 scale-105'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                  {/* More icons button */}
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(!iconPickerOpen)}
                    className={cn(
                      'aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer border',
                      iconPickerOpen
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                    )}
                    title="Select other icons"
                  >
                    +
                  </button>
                </div>

                {/* Popover Grid with 40+ Icons */}
                {iconPickerOpen && (
                  <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-36 overflow-y-auto grid grid-cols-8 gap-1 animate-in fade-in zoom-in-95 duration-100">
                    {ALL_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          setNewProjIcon(icon);
                          setIconPickerOpen(false);
                        }}
                        className={cn(
                          'w-6 h-6 rounded-md text-xs flex items-center justify-center hover:scale-125 transition-transform cursor-pointer',
                          newProjIcon === icon ? 'bg-indigo-100 dark:bg-indigo-950 ring-1 ring-indigo-500' : ''
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color selector on its own line (8 vibrant colors) */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                {['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewProjColor(c)}
                    className={cn(
                      'w-4 h-4 rounded-full transition-transform cursor-pointer shrink-0',
                      newProjColor === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Cancel and Add buttons on next line */}
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setNewProjectOpen(false);
                    setIconPickerOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="xs"
                  variant="primary"
                  disabled={!newProjName.trim()}
                >
                  Add
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-0.5">
            {projects.map(p => {
              const projectTaskCount = tasks.filter(t => t.project_id === p.id && t.is_completed === 0).length;
              const active = pathname === `/projects/${p.id}`;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors',
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs">{p.icon || '📁'}</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  {projectTaskCount > 0 && (
                    <Badge variant={active ? 'indigo' : 'slate'} size="xs">
                      {projectTaskCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / User Profile & Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 space-y-2.5">
        {/* User Profile Card linking to /profile */}
        <Link
          href="/profile"
          onClick={() => onNavigate?.()}
          className={cn(
            'w-full flex items-center gap-3 p-2 rounded-2xl transition-all group border border-transparent',
            pathname === '/profile'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
              : 'hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700/80 hover:shadow-xs'
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'U'}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                {currentUser?.fullName || 'Taskly User'}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                View →
              </span>
            </div>
            <span
              className="text-[11px] text-slate-500 dark:text-slate-400 block truncate"
              title={currentUser?.email || 'user@taskly.app'}
            >
              {currentUser?.email || 'user@taskly.app'}
            </span>
          </div>
        </Link>

        {/* Dedicated Actions: Theme Switcher & Logout */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={toggleTheme}
            title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 transition-all cursor-pointer shadow-none hover:shadow-xs"
          >
            {effectiveTheme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-semibold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-[11px] font-semibold">Dark</span>
              </>
            )}
          </button>

          <div className="w-[1px] h-4 bg-slate-200 dark:border-slate-800 shrink-0" />

          <button
            onClick={logout}
            title="Log out of Taskly"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer shadow-none hover:shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px]">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
