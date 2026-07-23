import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function TaskCreatePage() {
  return (
    <section aria-labelledby="page-heading">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1 text-sm"
        style={{ color: 'var(--accent)' }}
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to tasks
      </Link>

      <h1 id="page-heading" className="mt-3 text-2xl font-medium sm:text-3xl">
        New task
      </h1>
      <p className="mt-1">Create a new task.</p>

      {/* Placeholder region — the creation form will render here in a later change. */}
      <div
        className="mt-6 rounded-lg border border-dashed p-8 text-center"
        style={{ borderColor: 'var(--border)' }}
      >
        <p>The task creation form will appear here.</p>
      </div>
    </section>
  )
}

export default TaskCreatePage
