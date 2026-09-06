'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  LogIn,
  UserPlus,
  Calendar,
  Columns3,
  Timer,
  Sun,
  Moon,
  Pause,
  Play,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function NotFound() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();

  const [countdown, setCountdown] = useState(8);
  const [isPaused, setIsPaused] = useState(false);
  const [, startTransition] = useTransition();

  const targetPath = isAuthenticated ? '/today' : '/login';
  const targetLabel = isAuthenticated ? 'Dashboard' : 'Login';

  useEffect(() => {
    if (isLoading || isPaused) return;

    if (countdown <= 0) {
      startTransition(() => {
        router.push(targetPath);
      });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isPaused, isLoading, targetPath, router]);

  const handleManualRedirect = () => {
    router.push(targetPath);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href={targetPath}
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-white p-0.5 flex items-center justify-center border border-slate-200 shadow-xs group-hover:border-indigo-500 transition-colors">
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
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
              Taskly
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {!isLoading && (
            <Badge
              variant={isAuthenticated ? 'emerald' : 'amber'}
              dot
              size="sm"
            >
              {isAuthenticated ? 'Signed In' : 'Guest'}
            </Badge>
          )}

          <button
            onClick={toggleTheme}
            title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800/80 p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle decorative background gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* Logo Badge & 404 Tag */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Image
                  src="/logo.png"
                  alt="Taskly Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="absolute -bottom-2.5 -right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-600 text-white tracking-wider shadow-sm border-2 border-white dark:border-slate-900">
                404
              </span>
            </div>

            {/* Headings */}
            <div className="space-y-2 max-w-md">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Page Not Found
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                The link you followed doesn't exist, was moved, or requires signing into an authorized account.
              </p>
            </div>

            {/* Auth status context card */}
            <div className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 text-xs">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-slate-400 py-1">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <span>Checking your session...</span>
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {currentUser?.fullName || 'Active User'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser?.email || 'Logged in'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="xs">
                    Logged In
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Guest Session
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Log in to view your private boards & tasks
                      </p>
                    </div>
                  </div>
                  <Badge variant="amber" size="xs">
                    Not Logged In
                  </Badge>
                </div>
              )}
            </div>

            {/* Smart Countdown Banner */}
            {!isLoading && (
              <div className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-slate-400' : 'bg-indigo-400'} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-slate-500' : 'bg-indigo-600'}`} />
                  </span>
                  <span className="truncate">
                    {isPaused
                      ? `Auto-redirect to ${targetLabel} paused`
                      : `Redirecting to ${targetLabel} in ${countdown}s...`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    className="p-1 rounded-md text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                    title={isPaused ? 'Resume countdown' : 'Pause countdown'}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleManualRedirect}
                    className="text-[11px] font-bold underline underline-offset-2 hover:text-indigo-800 dark:hover:text-indigo-200 cursor-pointer"
                  >
                    Go Now
                  </button>
                </div>
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Button
                onClick={handleManualRedirect}
                fullWidth
                size="lg"
                variant="primary"
                leftIcon={
                  isAuthenticated ? (
                    <LayoutDashboard className="w-4 h-4" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )
                }
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Sign In to Taskly'}
              </Button>

              <Button
                onClick={() => router.back()}
                fullWidth
                size="lg"
                variant="outline"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Go Back
              </Button>
            </div>

            {/* Additional Quick Navigation Links */}
            <div className="w-full pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                {isAuthenticated ? 'Quick Shortcuts' : 'Or Create an Account'}
              </p>

              {isAuthenticated ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Link
                    href="/today"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Today</span>
                  </Link>
                  <Link
                    href="/board"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Columns3 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Kanban</span>
                  </Link>
                  <Link
                    href="/calendar"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Calendar</span>
                  </Link>
                  <Link
                    href="/pomodoro"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Pomodoro</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Don't have an account? Sign up free</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-5 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <div className="w-5 h-5 rounded-md bg-white p-0.5 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Image
              src="/logo.png"
              alt="Taskly"
              width={16}
              height={16}
              className="w-full h-full object-contain"
            />
          </div>
          <span>Taskly • Task Management & Focus</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>© {new Date().getFullYear()} Taskly</span>
          <span>•</span>
          <Link href={targetPath} className="hover:text-indigo-500 transition-colors">
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </Link>
        </div>
      </footer>
    </div>
  );
}
