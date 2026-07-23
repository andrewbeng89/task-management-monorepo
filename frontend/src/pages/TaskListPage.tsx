import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

function TaskListPage() {
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

      {/* Placeholder region — the task list will render here in a later change. */}
      <div
        className="mt-6 rounded-lg border border-dashed p-8 text-center"
        style={{ borderColor: 'var(--border)' }}
      >
        <p>No tasks to show yet.</p>
        <p className="mt-1 text-sm">The task list will appear here.</p>
      </div>
    </section>
  )
}

export default TaskListPage
