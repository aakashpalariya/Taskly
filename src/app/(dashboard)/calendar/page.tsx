'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar View"
        eyebrow={{
          icon: <Calendar className="w-3.5 h-3.5" />,
          label: 'Schedule',
          color: 'text-emerald-500',
        }}
      />

      <TaskCalendar />
    </div>
  );
}
