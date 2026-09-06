import Dexie, { Table } from 'dexie';
import { TaskRow } from '@/server/db/tasks';
import { ProjectRow } from '@/server/db/projects';
import { TagRow } from '@/server/db/tags';

export class TasklyOfflineDB extends Dexie {
  tasks!: Table<TaskRow, string>;
  projects!: Table<ProjectRow, string>;
  tags!: Table<TagRow, string>;

  constructor() {
    super('TasklyOfflineDB');
    this.version(1).stores({
      tasks: 'id, user_id, project_id, status, is_completed, due_date, priority, position',
      projects: 'id, user_id, position',
      tags: 'id, user_id, name',
    });
  }
}

export const offlineDb = new TasklyOfflineDB();
