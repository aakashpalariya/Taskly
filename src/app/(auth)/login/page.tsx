'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [adminRedirecting, setAdminRedirecting] = useState(false);
  const logoTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);

    const nextCount = logoClicks + 1;
    if (nextCount >= 5) {
      setLogoClicks(0);
      setAdminRedirecting(true);
      setTimeout(() => {
        router.push('/admin');
      }, 350);
      return;
    }

    setLogoClicks(nextCount);
    logoTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/today');
    } else {
      setError(res.error || 'Failed to log in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            title="Taskly"
            className="w-16 h-16 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center mx-auto shadow-sm cursor-pointer active:scale-90 transition-all select-none hover:border-indigo-300 dark:hover:border-indigo-600"
          >
            <Image
              src="/logo.png"
              alt="Taskly Logo"
              width={56}
              height={56}
              className="w-full h-full object-contain pointer-events-none"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome to Taskly
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize tasks, focus deeply, and achieve clarity.
          </p>
        </div>

        {adminRedirecting && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800 text-center animate-pulse">
            🔒 Admin access detected. Redirecting to /admin...
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={fieldErrors.email}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Password
              </span>
              <Link
                href="/forgot-password"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={fieldErrors.password}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              size="lg"
              variant="primary"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Don't have an account? </span>
          <Link
            href="/signup"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
