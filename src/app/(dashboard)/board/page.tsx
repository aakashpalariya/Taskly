'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { Columns3 } from 'lucide-react';

export default function BoardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban Board"
        eyebrow={{
          icon: <Columns3 className="w-3.5 h-3.5" />,
          label: 'Workflow',
          color: 'text-purple-500',
        }}
      />

      <KanbanBoard />
    </div>
  );
}
