'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    dob?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: {
      email?: string;
      dob?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!dob) {
      errs.dob = 'Date of birth is required';
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password';
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          dob: dob.trim(),
          newPassword,
        }),
      });

      const json = await res.json();
      setLoading(false);

      if (json.success) {
        setSuccessMessage(json.message || 'Password reset successfully!');
      } else {
        setError(json.error || 'Failed to reset password');
      }
    } catch {
      setLoading(false);
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center mx-auto shadow-sm">
            <Image
              src="/logo.png"
              alt="Taskly Logo"
              width={56}
              height={56}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify your identity with your registered email and Date of Birth.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        {/* Success Card */}
        {successMessage ? (
          <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Password Reset Complete
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                {successMessage}
              </p>
            </div>
            <Button
              type="button"
              fullWidth
              size="md"
              variant="primary"
              onClick={() => router.push('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In Now
            </Button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Registered Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email)
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={fieldErrors.email}
            />

            <DatePicker
              label="Date of Birth"
              value={dob}
              onChange={(val) => {
                setDob(val);
                if (fieldErrors.dob)
                  setFieldErrors((prev) => ({ ...prev, dob: undefined }));
              }}
              helperText="Date of birth provided during account creation"
              error={fieldErrors.dob}
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.newPassword)
                  setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              placeholder="At least 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              error={fieldErrors.newPassword}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword)
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Confirm new password"
              leftIcon={<KeyRound className="w-4 h-4" />}
              error={fieldErrors.confirmPassword}
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                variant="primary"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
