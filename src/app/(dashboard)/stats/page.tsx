'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  CheckCircle2,
  Flame,
  Clock,
  TrendingUp,
  Target
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success) {
          setStats(json.stats);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading productivity metrics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        No stats available yet. Complete some tasks to see analytics.
      </div>
    );
  }

  const PRIORITY_COLORS: Record<string, string> = {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#3b82f6',
    NONE: '#94a3b8',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Productivity Dashboard"
        eyebrow={{
          icon: <BarChart3 className="w-3.5 h-3.5" />,
          label: 'Productivity & Velocity',
          color: 'text-teal-500',
        }}
      />

      {/* KPI Cards: 2-column on mobile, 4-column on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          subtitle={`Out of ${stats.totalTasks} tasks`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />

        <StatCard
          title="Success Rate"
          value={`${stats.completionRate}%`}
          subtitle="Overall completion"
          icon={<Target className="w-5 h-5" />}
          variant="indigo"
          progress={stats.completionRate}
        />

        <StatCard
          title="Daily Streak"
          value={`${stats.streak} days`}
          subtitle="Keep it burning! 🔥"
          icon={<Flame className="w-5 h-5" />}
          variant="amber"
        />

        <StatCard
          title="In Progress"
          value={stats.pendingTasks}
          subtitle="Active tasks remaining"
          icon={<Clock className="w-5 h-5" />}
          variant="sky"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Velocity Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                7-Day Completion Velocity
              </h3>
              <p className="text-xs text-slate-400">Tasks completed per day this week</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.velocity7Days}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tasks by Priority
          </h3>
          <p className="text-xs text-slate-400">Distribution across urgency levels</p>

          <div className="h-64 w-full flex items-center justify-center">
            {stats.priorityBreakdown && stats.priorityBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.priorityBreakdown}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {stats.priorityBreakdown.map((entry: any) => (
                      <Cell
                        key={entry.priority}
                        fill={PRIORITY_COLORS[entry.priority] || '#6366f1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No priority data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
