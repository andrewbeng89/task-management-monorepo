import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section aria-labelledby="page-heading" className="text-center">
      <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
        404
      </p>
      <h1 id="page-heading" className="mt-2 text-2xl font-medium sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2">
        The page you are looking for doesn’t exist or has moved.
      </p>
      <Link
        to="/tasks"
        className="mt-6 inline-block rounded-md px-4 py-2 text-sm font-medium text-white"
        style={{ background: 'var(--btn-bg)' }}
      >
        Back to tasks
      </Link>
    </section>
  )
}

export default NotFoundPage
