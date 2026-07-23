import ky, { HTTPError } from 'ky'

/** Shared client pointed at the backend through the Vite `/api` proxy. */
const client = ky.create({ prefix: '/api' })

export interface Skill {
  id: string
  name: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  assignee: { id: string; name: string } | null
  requiredSkills: { id: string; name: string }[]
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface Developer {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  skills: { id: string; name: string }[]
}

export interface CreateTaskInput {
  title: string
  requiredSkillIds?: string[]
}

/** Lists all skills. */
export function listSkills(): Promise<Skill[]> {
  return client.get('skills').json<Skill[]>()
}

/** Lists all tasks. */
export function listTasks(): Promise<Task[]> {
  return client.get('tasks').json<Task[]>()
}

/** Creates a task via `POST /api/tasks`. */
export function createTask(input: CreateTaskInput): Promise<Task> {
  return client.post('tasks', { json: input }).json<Task>()
}

/** Updates a task's status via `PATCH /api/tasks/:id/status`. */
export function updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
  return client.patch(`tasks/${id}/status`, { json: { status } }).json<Task>()
}

/** Lists the developers eligible to be assigned to a task. */
export function listTaskAssignees(id: string): Promise<Developer[]> {
  return client.get(`tasks/${id}/assignees`).json<Developer[]>()
}

/** Assigns a developer to a task via `PATCH /api/tasks/:id/assignee`. */
export function assignTask(id: string, developerId: string): Promise<Task> {
  return client.patch(`tasks/${id}/assignee`, { json: { developerId } }).json<Task>()
}

/**
 * Extracts a human-readable message from a failed request, preferring the
 * backend's `{ error }` JSON shape and falling back to a generic message.
 */
export async function toErrorMessage(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.json()) as { error?: string }
      if (body?.error) return body.error
    } catch {
      // Response wasn't JSON — fall through to the generic message.
    }
    return `Request failed (${error.response.status})`
  }
  return 'Something went wrong. Please try again.'
}
