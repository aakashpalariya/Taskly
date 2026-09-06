'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, options?: { type?: 'success' | 'error' | 'info'; action?: ToastAction; duration?: number }) => void;
  showUndo: (message: string, onUndo: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, options?: { type?: 'success' | 'error' | 'info'; action?: ToastAction; duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = {
      id,
      message,
      type: options?.type || 'info',
      action: options?.action,
      duration: options?.duration || 4000,
    };

    setToasts(prev => [...prev.slice(-3), item]); // keep max 4 toasts

    setTimeout(() => {
      removeToast(id);
    }, item.duration);
  }, [removeToast]);

  const showUndo = useCallback((message: string, onUndo: () => void) => {
    toast(message, {
      type: 'info',
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: () => {
          onUndo();
        },
      },
    });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, showUndo }}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-5 z-[9999] flex flex-col items-center sm:items-end gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
              <span className="text-sm font-medium truncate">{t.message}</span>
            </div>

            {t.action && (
              <button
                onClick={() => {
                  t.action?.onClick();
                  removeToast(t.id);
                }}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                {t.action.label}
              </button>
            )}

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
