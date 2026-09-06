'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  Folder,
  LogOut,
  Sparkles,
  Save,
  KeyRound,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [profileErrors, setProfileErrors] = useState<{ fullName?: string }>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(currentUser?.soundEnabled ?? true);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [changingPassword, setChangingPassword] = useState(false);

  const [extraStats, setExtraStats] = useState<{
    totalTasks: number;
    completedTasks: number;
    projectsCount: number;
    createdAt?: string;
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setSoundEnabled(currentUser.soundEnabled);
    }
  }, [currentUser]);

  useEffect(() => {
    async function loadProfileStats() {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user) {
            setExtraStats({
              totalTasks: json.user.stats?.totalTasks || 0,
              completedTasks: json.user.stats?.completedTasks || 0,
              projectsCount: json.user.stats?.projectsCount || 0,
              createdAt: json.user.createdAt,
            });
          }
        }
      } catch {
        // Non-blocking
      }
    }
    loadProfileStats();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileErrors({ fullName: 'Full name cannot be empty' });
      return;
    }
    if (fullName.trim().length < 2) {
      setProfileErrors({ fullName: 'Full name must be at least 2 characters' });
      return;
    }

    setProfileErrors({});
    setSavingProfile(true);

    const res = await updateProfile({ fullName: fullName.trim() });
    setSavingProfile(false);

    if (res.success) {
      toast('Profile updated successfully!', { type: 'success' });
    } else {
      setProfileErrors({ fullName: res.error || 'Failed to update profile' });
      toast(res.error || 'Failed to update profile', { type: 'error' });
    }
  };

  const handleToggleSound = async () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    setSavingPreferences(true);
    const res = await updateProfile({ soundEnabled: nextSound });
    setSavingPreferences(false);
    if (res.success) {
      toast(nextSound ? 'Sound effects enabled' : 'Sound effects muted', { type: 'info' });
    }
  };

  const handleChangeTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    await updateProfile({ themePreference: newTheme });
    toast(`Theme changed to ${newTheme}`, { type: 'info' });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};

    if (!currentPassword) {
      errs.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your new password';
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setPasswordErrors({});
    setChangingPassword(true);

    const res = await changePassword(currentPassword, newPassword);
    setChangingPassword(false);

    if (res.success) {
      toast('Password changed successfully!', { type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordErrors({ currentPassword: res.error || 'Failed to update password' });
      toast(res.error || 'Failed to change password', { type: 'error' });
    }
  };

  const joinedDate = extraStats?.createdAt
    ? new Date(extraStats.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Account & Profile"
        eyebrow={{
          icon: <User className="w-3.5 h-3.5" />,
          label: 'Settings',
          color: 'text-indigo-500',
        }}
        description="Manage your personal details, workspace preferences, and security settings."
      />

      {/* User Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black uppercase shadow-md shadow-indigo-500/20 shrink-0">
            {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentUser?.fullName || 'Taskly User'}
              </h2>
              <Badge variant="indigo" size="xs">
                Verified Account
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentUser?.email || 'user@taskly.app'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-500" />
              Member since {joinedDate}
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={logout}
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign Out
        </Button>
      </div>

      {/* Quick Overview Stat Cards: 2-col on mobile, 3-col on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard
          title="Total Tasks"
          value={extraStats?.totalTasks ?? '—'}
          subtitle="All tasks created"
          icon={<Sparkles className="w-5 h-5" />}
          variant="indigo"
        />
        <StatCard
          title="Completed Tasks"
          value={extraStats?.completedTasks ?? '—'}
          subtitle="Finished achievements"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Active Projects"
          value={extraStats?.projectsCount ?? '—'}
          subtitle="Organized workspaces"
          icon={<Folder className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Grid: Personal Details & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Personal Information</span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (profileErrors.fullName)
                  setProfileErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              placeholder="Your name"
              leftIcon={<User className="w-4 h-4" />}
              error={profileErrors.fullName}
            />

            <Input
              label="Email Address"
              type="email"
              value={currentUser?.email || ''}
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Email cannot be changed directly"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={savingProfile}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Profile
            </Button>
          </form>
        </div>

        {/* Preferences Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>App Preferences</span>
          </div>

          <div className="space-y-5">
            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Interface Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleChangeTheme('light')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeTheme('dark')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeTheme('system')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Audio Feedback</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Play subtle chimes when completing tasks
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleSound}
                disabled={savingPreferences}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Change Password Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          <KeyRound className="w-4 h-4 text-indigo-500" />
          <span>Security & Password</span>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl" noValidate>
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (passwordErrors.currentPassword)
                setPasswordErrors((prev) => ({ ...prev, currentPassword: undefined }));
            }}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={passwordErrors.currentPassword}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordErrors.newPassword)
                  setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              placeholder="At least 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              error={passwordErrors.newPassword}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordErrors.confirmPassword)
                  setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Confirm new password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={passwordErrors.confirmPassword}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={changingPassword}
            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
