'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Activity,
  BarChart3,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Check,
  Folder,
  CheckSquare,
  Flame,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  themePreference: string;
  soundEnabled: boolean;
  dob?: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  totalTasks: number;
  completedTasks: number;
  totalProjects: number;
  focusMinutes: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  deactivatedUsers: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalProjects: number;
  totalFocusMinutes: number;
  newUsersLast7Days: number;
}

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  taskId: string | null;
  taskTitle: string | null;
  action: string;
  details: string | null;
  createdAt: string;
}

interface UserDetailData {
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar: string | null;
    isActive: boolean;
    themePreference: string;
    soundEnabled: boolean;
    dob?: string | null;
    createdAt: string;
    lastActiveAt: string | null;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    totalProjects: number;
    focusMinutes: number;
  };
  projects: any[];
  recentTasks: any[];
  activity: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      toast(message, { type });
    },
    [toast]
  );

  // Auth State
  const [isAdminAuth, setIsAdminAuth] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'security'>('users');

  // Users Tab State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

  // Detail Modal / Sheet State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetailData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState<AdminUser | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Delete Confirm Modal State
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // System Stats
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Admin Change Password Form State
  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passChangeSuccess, setPassChangeSuccess] = useState('');
  const [passChangeError, setPassChangeError] = useState('');

  // 1. Check Admin Auth on load
  const checkAdminAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/check');
      const data = await res.json();
      setIsAdminAuth(Boolean(data.authenticated));
    } catch {
      setIsAdminAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  // 2. Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [searchQuery, statusFilter, showToast]);

  // 3. Fetch Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // When admin logs in or changes tab
  useEffect(() => {
    if (isAdminAuth) {
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'stats') fetchStats();
    }
  }, [isAdminAuth, activeTab, fetchUsers, fetchStats]);

  // Fetch user details when selected
  useEffect(() => {
    if (!selectedUserId) {
      setUserDetails(null);
      return;
    }
    setLoadingDetails(true);
    fetch(`/api/admin/users/${selectedUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserDetails(data);
        } else {
          showToast('Failed to load user details', 'error');
        }
      })
      .catch(() => showToast('Failed to load user details', 'error'))
      .finally(() => setLoadingDetails(false));
  }, [selectedUserId, showToast]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      setAuthError('Please enter the admin password');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAdminAuth(true);
        setPasswordInput('');
        showToast('Admin access granted', 'success');
      } else {
        setAuthError(data.error || 'Incorrect admin password');
      }
    } catch {
      setAuthError('Network error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    setIsAdminAuth(false);
    showToast('Admin session locked', 'info');
  };

  // Toggle User Active Status
  const handleToggleActive = async (user: AdminUser) => {
    const nextStatus = !user.isActive;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `${user.fullName} is now ${nextStatus ? 'active' : 'deactivated'}`,
          'success'
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: nextStatus } : u))
        );
        if (selectedUserId === user.id && userDetails) {
          setUserDetails({
            ...userDetails,
            user: { ...userDetails.user, isActive: nextStatus },
          });
        }
      } else {
        showToast(data.error || 'Failed to update user', 'error');
      }
    } catch {
      showToast('Network error updating user', 'error');
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (!newResetPassword || newResetPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${resetModalUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newResetPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Password for ${resetModalUser.fullName} has been reset`, 'success');
        setResetModalUser(null);
        setNewResetPassword('');
        setConfirmResetPassword('');
      } else {
        showToast(data.error || 'Failed to reset password', 'error');
      }
    } catch {
      showToast('Network error resetting password', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Delete User Submit
  const handleDeleteUserSubmit = async () => {
    if (!deleteModalUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteModalUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User ${deleteModalUser.fullName} permanently deleted`, 'success');
        setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
        if (selectedUserId === deleteModalUser.id) {
          setSelectedUserId(null);
        }
        setDeleteModalUser(null);
      } else {
        showToast(data.error || 'Failed to delete user', 'error');
      }
    } catch {
      showToast('Network error deleting user', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Change Admin Master Password
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError('');
    setPassChangeSuccess('');

    if (!currentAdminPass) {
      setPassChangeError('Please provide your current admin password');
      return;
    }
    if (!newAdminPass || newAdminPass.length < 6) {
      setPassChangeError('New password must be at least 6 characters');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setPassChangeError('New passwords do not match');
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentAdminPass,
          newPassword: newAdminPass,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPassChangeSuccess('Admin master password updated successfully!');
        setCurrentAdminPass('');
        setNewAdminPass('');
        setConfirmAdminPass('');
        showToast('Admin password updated', 'success');
      } else {
        setPassChangeError(data.error || 'Failed to update admin password');
      }
    } catch {
      setPassChangeError('Network error. Please try again.');
    } finally {
      setChangingPass(false);
    }
  };

  // Format Helpers
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  // Loading initial state
  if (isAdminAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  // --- 1. UNLOCKED: ADMIN PASSCODE GATE ---
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Taskly Admin Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restricted access. Please enter the master admin password to unlock management features.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Master Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Initial Default Password:
              </span>
              <code className="text-indigo-600 dark:text-indigo-400 select-all font-mono font-bold">
                Admin@Taskly2025
              </code>
              <span className="block mt-0.5 text-[10px] text-slate-400">
                You can change this password inside the Security tab after unlocking.
              </span>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>← Back to Taskly Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. AUTHENTICATED: ADMIN DASHBOARD (MOBILE-FIRST) ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 sm:py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-base tracking-tight leading-none text-slate-900 dark:text-white">
                  Taskly Admin
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate sm:whitespace-normal">
                Centralized User & System Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/today"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Go to App</span>
            </Link>

            <button
              onClick={handleAdminLogout}
              title="Lock Admin Session"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-medium text-xs transition-colors"
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 space-y-4">
        {/* Segmented Tab Navigation (Mobile Touch Friendly) */}
        <div className="flex p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/60 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>
        </div>

        {/* --- TAB 1: USERS MANAGEMENT --- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name or email..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto no-scrollbar">
                {(['all', 'active', 'deactivated'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}

                <button
                  onClick={fetchUsers}
                  title="Refresh User List"
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* User List */}
            {loadingUsers ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <p className="text-xs font-medium">Loading user database...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Users className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No users found</p>
                <p className="text-xs text-slate-500 mt-1">Try changing your search query or filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow transition-shadow space-y-3"
                  >
                    {/* User Header Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-base shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            user.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {user.fullName}
                            </h3>
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80">
                                <XCircle className="w-2.5 h-2.5" />
                                Deactivated
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Top Quick Action */}
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="View Detailed Activity & Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Metrics Badges */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Tasks
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {user.completedTasks} / {user.totalTasks}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Projects
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {user.totalProjects}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Focus
                        </span>
                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                          {user.focusMinutes}m
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Timestamp */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5 flex-wrap gap-2">
                      <span>DOB: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{user.dob ? formatDate(user.dob) : 'Not set'}</strong></span>
                      <span>Joined: {formatDate(user.createdAt)}</span>
                      <span>Last Seen: {formatDateTime(user.lastActiveAt)}</span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {/* Toggle Active / Deactivate */}
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                          user.isActive
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/70 hover:bg-amber-100'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-100'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>

                      {/* View Activity */}
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Activity</span>
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => {
                          setResetModalUser(user);
                          setNewResetPassword('');
                          setConfirmResetPassword('');
                        }}
                        title="Reset User Password"
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete User */}
                      <button
                        onClick={() => setDeleteModalUser(user)}
                        title="Delete User Permanently"
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: PLATFORM ANALYTICS --- */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Platform Overview
                </h2>
                <p className="text-xs text-slate-500">Key performance indicators & usage metrics.</p>
              </div>
              <button
                onClick={fetchStats}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700"
              >
                <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingStats || !stats ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <p className="text-xs">Computing platform statistics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                    Total Users
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.totalUsers}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                    {stats.activeUsers} active / {stats.deactivatedUsers} inactive
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                    Total Tasks
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {stats.totalTasks}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {stats.completedTasks} completed ({stats.completionRate}%)
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                    Total Projects
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.totalProjects}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Created across accounts</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                    Focus Recorded
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-amber-500 mt-1">
                    {Math.round(stats.totalFocusMinutes / 60)}h{' '}
                    <span className="text-xs font-semibold text-slate-400">
                      ({stats.totalFocusMinutes}m)
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Pomodoro focus time</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                    New Signups (Last 7 Days)
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    +{stats.newUsersLast7Days}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    New user accounts registered this week
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: SECURITY & ADMIN PASSWORD --- */}
        {activeTab === 'security' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Change Admin Master Password
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update the master password used to authenticate into this /admin page.
                  </p>
                </div>
              </div>

              {passChangeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{passChangeSuccess}</span>
                </div>
              )}

              {passChangeError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passChangeError}</span>
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Admin Password
                  </label>
                  <input
                    type="password"
                    value={currentAdminPass}
                    onChange={(e) => setCurrentAdminPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmAdminPass}
                    onChange={(e) => setConfirmAdminPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPass}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {changingPass ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Save New Admin Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Admin Info Card */}
            <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-500">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span>Security Notice</span>
              </div>
              <p>
                The admin session cookie is stored as an HTTP-only token valid for 12 hours. Anyone
                tapping the login logo 5 times will still be prompted for this master password.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* --- USER ACTIVITY / DETAIL DRAWER MODAL --- */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {userDetails?.user.fullName || 'User Profile & Activity'}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    {userDetails?.user.email || 'Loading...'}
                    {userDetails?.user.dob ? ` • DOB: ${formatDate(userDetails.user.dob)}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {loadingDetails || !userDetails ? (
                <div className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <p className="text-xs">Fetching user activity log...</p>
                </div>
              ) : (
                <>
                  {/* Summary Stat Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Total Tasks
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {userDetails.stats.totalTasks}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Completed
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {userDetails.stats.completedTasks}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Projects
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {userDetails.stats.totalProjects}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Focus Minutes
                      </span>
                      <span className="text-sm font-extrabold text-amber-500">
                        {userDetails.stats.focusMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Projects List */}
                  {userDetails.projects.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Projects ({userDetails.projects.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {userDetails.projects.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
                          >
                            <span>{p.icon || '📁'}</span>
                            <span>{p.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity Timeline */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Chronological Activity Log</span>
                    </h4>

                    {userDetails.activity.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        No activity recorded for this user yet.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {userDetails.activity.map((act) => (
                          <div
                            key={act.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5 text-xs"
                          >
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0 mt-0.5">
                              {act.action}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-700 dark:text-slate-300 break-words font-medium">
                                {act.details || act.task_title || act.action}
                              </p>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {formatDateTime(act.created_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end">
              <button
                onClick={() => setSelectedUserId(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD MODAL --- */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Reset Password</h3>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set a new temporary or permanent password for{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {resetModalUser.fullName}
              </strong>{' '}
              ({resetModalUser.email}).
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmResetPassword}
                  onChange={(e) => setConfirmResetPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE USER CONFIRMATION MODAL --- */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Delete User Account?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {deleteModalUser.fullName}
                </strong>
                ?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-400">
              ⚠️ This will permanently erase all projects, tasks, tags, pomodoro sessions, and logs
              for this user. This action cannot be undone.
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUserSubmit}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
