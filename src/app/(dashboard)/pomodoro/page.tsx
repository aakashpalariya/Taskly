'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget';
import { Timer } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';

function PomodoroContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  return <PomodoroWidget initialTaskId={taskId} />;
}

export default function PomodoroPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Focus Mode"
        eyebrow={{
          icon: <Timer className="w-3.5 h-3.5" />,
          label: 'Deep Work',
          color: 'text-rose-500',
        }}
      />

      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading timer...</div>}>
        <PomodoroContent />
      </Suspense>
    </div>
  );
}
