import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import {
  assignTask,
  listTaskAssignees,
  listTasks,
  toErrorMessage,
  updateTaskStatus,
  type Developer,
  type Task,
} from '@/lib/api'
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/taskStatus'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; tasks: Task[] }

type AssigneeOptions =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'loaded'; developers: Developer[] }

function TaskListPage() {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [assigneeOptions, setAssigneeOptions] = useState<
    Record<string, AssigneeOptions>
  >({})
  const [busy, setBusy] = useState<Set<string>>(new Set())
  const [liveMessage, setLiveMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    listTasks()
      .then((tasks) => {
        // Only root-level tasks are shown; subtasks are hidden for now.
        const rootTasks = tasks.filter((t) => t.parentId === null)
        if (active) setLoad({ status: 'loaded', tasks: rootTasks })
      })
      .catch(async (error) => {
        if (active)
          setLoad({ status: 'error', message: await toErrorMessage(error) })
      })
    return () => {
      active = false
    }
  }, [])

  function setRowBusy(id: string, isBusy: boolean) {
    setBusy((prev) => {
      const next = new Set(prev)
      if (isBusy) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function replaceTask(updated: Task) {
    setLoad((prev) =>
      prev.status === 'loaded'
        ? {
            status: 'loaded',
            tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
          }
        : prev,
    )
  }

  async function handleStatusChange(task: Task, status: Task['status']) {
    setErrorMessage(null)
    setRowBusy(task.id, true)
    try {
      const updated = await updateTaskStatus(task.id, status)
      replaceTask(updated)
      setLiveMessage(
        `Status for "${task.title}" updated to ${STATUS_LABELS[status]}.`,
      )
    } catch (error) {
      setErrorMessage(await toErrorMessage(error))
    } finally {
      setRowBusy(task.id, false)
    }
  }

  function loadAssignees(taskId: string) {
    setAssigneeOptions((prev) => {
      const current = prev[taskId]
      // Only fetch once per row (idle or a previous error retriable on reopen).
      if (current && current.state !== 'error') return prev
      return { ...prev, [taskId]: { state: 'loading' } }
    })
    listTaskAssignees(taskId)
      .then((developers) =>
        setAssigneeOptions((prev) => ({
          ...prev,
          [taskId]: { state: 'loaded', developers },
        })),
      )
      .catch(() =>
        setAssigneeOptions((prev) => ({
          ...prev,
          [taskId]: { state: 'error' },
        })),
      )
  }

  async function handleAssigneeChange(task: Task, developerId: string) {
    if (!developerId || developerId === task.assignee?.id) return
    setErrorMessage(null)
    setRowBusy(task.id, true)
    try {
      const updated = await assignTask(task.id, developerId)
      replaceTask(updated)
      setLiveMessage(
        `${updated.assignee?.name ?? 'Developer'} assigned to "${task.title}".`,
      )
    } catch (error) {
      setErrorMessage(await toErrorMessage(error))
    } finally {
      setRowBusy(task.id, false)
    }
  }

  return (
    <section aria-labelledby="page-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="page-heading" className="text-2xl font-medium sm:text-3xl">
            Tasks
          </h1>
          <p className="mt-1">View and manage your tasks.</p>
        </div>

        <Link
          to="/tasks/new"
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--btn-bg)' }}
        >
          <Plus aria-hidden="true" size={18} />
          New task
        </Link>
      </div>

      {/* Visually-hidden announcements for assistive technology. */}
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: 'var(--accent-border)',
            background: 'var(--accent-bg)',
            color: 'var(--text-h)',
          }}
        >
          {errorMessage}
        </div>
      )}

      {load.status === 'loading' && (
        <p role="status" className="mt-6">
          Loading tasks…
        </p>
      )}

      {load.status === 'error' && (
        <div
          role="alert"
          className="mt-6 rounded-lg border p-6"
          style={{ borderColor: 'var(--border)' }}
        >
          <p>Couldn’t load tasks.</p>
          <p className="mt-1 text-sm">{load.message}</p>
        </div>
      )}

      {load.status === 'loaded' && load.tasks.length === 0 && (
        <div
          className="mt-6 rounded-lg border border-dashed p-8 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p>No tasks yet.</p>
          <p className="mt-1 text-sm">
            Create your first task with the “New task” button above.
          </p>
        </div>
      )}

      {load.status === 'loaded' && load.tasks.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table
            className="w-full border-collapse text-left text-sm"
            aria-label="Tasks"
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" className="px-3 py-2 font-medium">
                  Title
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Skills
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Assignee
                </th>
              </tr>
            </thead>
            <tbody>
              {load.tasks.map((task) => {
                const rowBusy = busy.has(task.id)
                const options = assigneeOptions[task.id] ?? { state: 'idle' }
                const candidates =
                  options.state === 'loaded' ? options.developers : []
                return (
                  <tr
                    key={task.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <th
                      scope="row"
                      className="px-3 py-2 font-normal"
                      style={{ color: 'var(--text-h)' }}
                    >
                      {task.title}
                    </th>
                    <td className="px-3 py-2">
                      {task.requiredSkills.length
                        ? task.requiredSkills.map((s) => s.name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        aria-label={`Status for "${task.title}"`}
                        value={task.status}
                        disabled={rowBusy}
                        onChange={(e) =>
                          handleStatusChange(
                            task,
                            e.target.value as Task['status'],
                          )
                        }
                        className="rounded-md border px-2 py-1"
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--bg)',
                          color: 'var(--text-h)',
                        }}
                      >
                        {STATUS_ORDER.map((s) => {
                          const blockDone =
                            s === 'DONE' && !task.allSubtasksDone
                          return (
                            <option key={s} value={s} disabled={blockDone}>
                              {blockDone
                                ? 'Done (finish subtasks first)'
                                : STATUS_LABELS[s]}
                            </option>
                          )
                        })}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        aria-label={`Assignee for "${task.title}"`}
                        value={task.assignee?.id ?? ''}
                        disabled={rowBusy}
                        onFocus={() => loadAssignees(task.id)}
                        onChange={(e) =>
                          handleAssigneeChange(task, e.target.value)
                        }
                        className="rounded-md border px-2 py-1"
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--bg)',
                          color: 'var(--text-h)',
                        }}
                      >
                        {!task.assignee && (
                          <option value="" disabled>
                            Select developer…
                          </option>
                        )}
                        {task.assignee && (
                          <option value={task.assignee.id}>
                            {task.assignee.name}
                          </option>
                        )}
                        {options.state === 'loading' && (
                          <option value="" disabled>
                            Loading…
                          </option>
                        )}
                        {options.state === 'error' && (
                          <option value="" disabled>
                            Couldn’t load developers
                          </option>
                        )}
                        {candidates
                          .filter((d) => d.id !== task.assignee?.id)
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default TaskListPage
