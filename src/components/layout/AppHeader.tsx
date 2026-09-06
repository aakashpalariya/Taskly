'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Filter,
  Timer,
  Menu,
  ChevronDown,
  X as XIcon
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
}

export function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    setQuickAddOpen,
  } = useTasks();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Check if any non-default filter is active
  const filtersActive = priorityFilter !== 'ALL' || sortBy !== 'position';

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      {/* Main row */}
      <div className="h-14 px-3 sm:px-6 flex items-center justify-between gap-2.5">
        {/* Left: Mobile hamburger & Search bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
          {onToggleMobileMenu && (
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onToggleMobileMenu}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-7 h-7 rounded-xl bg-white p-0.5 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Image
                  src="/logo.png"
                  alt="Taskly Logo"
                  width={22}
                  height={22}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
          )}

          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks, #tags..."
              className="w-full pl-8 pr-7 h-8 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right: Filters, Shortcuts & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Priority Filter & Sort By — Desktop only */}
          <div className="hidden lg:flex items-center gap-1.5">
            <Select
              selectSize="sm"
              value={priorityFilter}
              onChange={(val: any) => setPriorityFilter(val?.target ? val.target.value : val)}
              containerClassName="w-36"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </Select>

            <Select
              selectSize="sm"
              value={sortBy}
              onChange={(val: any) => setSortBy((val?.target ? val.target.value : val) as any)}
              containerClassName="w-36"
            >
              <option value="position">Default Order</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Alphabetical</option>
            </Select>
          </div>

          {/* Mobile filter toggle button (< lg) */}
          <button
            onClick={() => setMobileFiltersOpen(prev => !prev)}
            className={`flex lg:hidden items-center gap-1.5 h-9 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filtersActive
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {filtersActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            )}
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${mobileFiltersOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Pomodoro quick link */}
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => router.push('/pomodoro')}
            title="Pomodoro Focus Timer"
          >
            <Timer className="w-3.5 h-3.5" />
          </Button>

          {/* Quick Add */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => setQuickAddOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>

      {/* Mobile Filter Drawer — shown below main row when open on < lg */}
      {mobileFiltersOpen && (
        <div className="flex lg:hidden items-center gap-2 px-3 pb-3 pt-0.5 flex-wrap border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex-1 min-w-[140px]">
            <Select
              selectSize="sm"
              value={priorityFilter}
              onChange={(val: any) => setPriorityFilter(val?.target ? val.target.value : val)}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">⬆ High Priority</option>
              <option value="MEDIUM">➡ Medium Priority</option>
              <option value="LOW">⬇ Low Priority</option>
            </Select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <Select
              selectSize="sm"
              value={sortBy}
              onChange={(val: any) => setSortBy((val?.target ? val.target.value : val) as any)}
            >
              <option value="position">Default Order</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Alphabetical</option>
            </Select>
          </div>
          {filtersActive && (
            <button
              onClick={() => {
                setPriorityFilter('ALL');
                setSortBy('position');
              }}
              className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 cursor-pointer px-1.5 shrink-0"
            >
              <XIcon className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}
    </header>
  );
}
