'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Timer, Sparkles } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useToast } from '@/context/ToastContext';
import { soundManager } from '@/lib/audio';
import { TaskRow } from '@/server/db/tasks';
import { Select } from '@/components/ui/Select';
import { MarqueeText } from '@/components/ui/MarqueeText';

interface PomodoroWidgetProps {
  initialTaskId?: string | null;
}

type Mode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const MODE_CONFIGS = {
  FOCUS: { label: 'Focus', defaultMinutes: 25, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-600' },
  SHORT_BREAK: { label: 'Short Break', defaultMinutes: 5, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-600' },
  LONG_BREAK: { label: 'Long Break', defaultMinutes: 15, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-600' },
};

export function PomodoroWidget({ initialTaskId }: PomodoroWidgetProps) {
  const { tasks } = useTasks();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>('FOCUS');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || '');
  const [secondsRemaining, setSecondsRemaining] = useState(MODE_CONFIGS.FOCUS.defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<{ todayFocusMinutes: number; totalSessions: number }>({
    todayFocusMinutes: 0,
    totalSessions: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/pomodoro');
      const json = await res.json();
      if (json.success && json.stats) {
        setStats({
          todayFocusMinutes: json.stats.todayFocusMinutes,
          totalSessions: json.stats.totalSessions,
        });
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (initialTaskId) setSelectedTaskId(initialTaskId);
  }, [initialTaskId]);

  const switchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsRemaining(MODE_CONFIGS[newMode].defaultMinutes * 60);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTaskId]);

  const handleCompleteSession = async () => {
    setIsRunning(false);
    soundManager.playTimerAlert();

    const duration = MODE_CONFIGS[mode].defaultMinutes;

    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationMinutes: duration,
          sessionType: mode,
          taskId: selectedTaskId || null,
        }),
      });
      fetchStats();
      toast(`${MODE_CONFIGS[mode].label} session complete! Great work!`, { type: 'success' });
    } catch {
      // Ignore
    }

    // Auto-switch: after focus, go to short break
    if (mode === 'FOCUS') {
      switchMode('SHORT_BREAK');
    } else {
      switchMode('FOCUS');
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      soundManager.playCompletion();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(MODE_CONFIGS[mode].defaultMinutes * 60);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const totalSeconds = MODE_CONFIGS[mode].defaultMinutes * 60;
  const progressPercent = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

  const currentTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
      {/* Mode tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl max-w-sm mx-auto">
        {(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === m
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {MODE_CONFIGS[m].label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative py-4 sm:py-8">
        <div className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white font-mono select-none">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${MODE_CONFIGS[mode].bg}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task Linking */}
      <div className="max-w-sm mx-auto text-left space-y-1.5">
        <Select
          label="Linked Task"
          value={selectedTaskId}
          onChange={(val: any) => setSelectedTaskId(val?.target ? val.target.value : val)}
        >
          <option value="">No task linked</option>
          {tasks
            .filter(t => t.is_completed === 0)
            .map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
        </Select>
        {selectedTaskId && tasks.find(t => t.id === selectedTaskId) && (
          <div className="p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
            <MarqueeText
              text={`Focusing on: ${tasks.find(t => t.id === selectedTaskId)?.title}`}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 text-center"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={resetTimer}
          title="Reset timer"
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer ${
            isRunning ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
      </div>

      {/* Today Stats */}
      <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>
            Today: <strong className="text-slate-900 dark:text-white font-semibold">{stats.todayFocusMinutes} mins</strong> focused
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>
            Sessions: <strong className="text-slate-900 dark:text-white font-semibold">{stats.totalSessions}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
