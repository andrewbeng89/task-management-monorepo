import { NavLink, Outlet } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/tasks', label: 'Tasks', end: true },
  { to: '/tasks/new', label: 'New task', end: false },
]

function AppLayout() {
  return (
    <div className="min-h-svh flex flex-col">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header
        className="border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <NavLink
            to="/tasks"
            className="inline-flex items-center gap-2 font-medium"
            style={{ color: 'var(--text-h)' }}
          >
            <CheckSquare aria-hidden="true" size={22} style={{ color: 'var(--accent)' }} />
            <span>Task Manager</span>
          </NavLink>

          <nav aria-label="Primary">
            <ul className="flex items-center gap-1 sm:gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      clsx(
                        'inline-block rounded-md px-3 py-2 text-sm transition-colors',
                        isActive && 'font-medium',
                      )
                    }
                    style={({ isActive }) => ({
                      color: isActive ? 'var(--accent)' : 'var(--text)',
                      background: isActive ? 'var(--accent-bg)' : 'transparent',
                    })}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>

      <footer
        className="border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-sm">
          <p>Task Manager — MVP</p>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
