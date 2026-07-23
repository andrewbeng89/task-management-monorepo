import type { Task } from './api'

type TaskStatus = Task['status']

/** Human-readable labels for each task status. Single source of truth. */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
}

/** Statuses in display order, for rendering status `<select>` options. */
export const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
