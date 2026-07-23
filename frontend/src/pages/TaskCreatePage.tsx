import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  createTask,
  listSkills,
  toErrorMessage,
  type Skill,
} from '@/lib/api'

type SkillsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; skills: Skill[] }

function TaskCreatePage() {
  const navigate = useNavigate()
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(
    new Set(),
  )
  const [titleError, setTitleError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [skillsState, setSkillsState] = useState<SkillsState>({
    status: 'loading',
  })

  // Load the available skills; the form stays usable (title-only) if this fails.
  useEffect(() => {
    let active = true
    listSkills()
      .then((skills) => {
        if (active) setSkillsState({ status: 'loaded', skills })
      })
      .catch(() => {
        if (active) setSkillsState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [])

  function toggleSkill(id: string) {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    const trimmed = title.trim()
    if (!trimmed) {
      setTitleError('Please enter a task title.')
      titleInputRef.current?.focus()
      return
    }
    setTitleError(null)

    setSubmitting(true)
    try {
      await createTask({
        title: trimmed,
        requiredSkillIds: selectedSkillIds.size
          ? [...selectedSkillIds]
          : undefined,
      })
      navigate('/tasks')
    } catch (error) {
      setSubmitError(await toErrorMessage(error))
      setSubmitting(false)
    }
  }

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

      <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-xl">
        {submitError && (
          <div
            role="alert"
            className="mb-4 rounded-md border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--accent-border)',
              background: 'var(--accent-bg)',
              color: 'var(--text-h)',
            }}
          >
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-title" className="text-sm font-medium">
            Title <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="task-title"
            ref={titleInputRef}
            name="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (titleError) setTitleError(null)
            }}
            required
            aria-required="true"
            aria-invalid={titleError ? 'true' : undefined}
            aria-describedby={titleError ? 'task-title-error' : undefined}
            autoFocus
            className="rounded-md border px-3 py-2"
            style={{
              borderColor: titleError ? 'var(--accent-border)' : 'var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-h)',
            }}
          />
          {titleError && (
            <p id="task-title-error" className="text-sm" style={{ color: 'var(--accent)' }}>
              {titleError}
            </p>
          )}
        </div>

        <fieldset
          className="mt-5 rounded-md border p-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <legend className="px-1 text-sm font-medium">Skills (optional)</legend>

          {skillsState.status === 'loading' && (
            <p className="text-sm">Loading skills…</p>
          )}
          {skillsState.status === 'error' && (
            <p className="text-sm">
              Couldn’t load skills. You can still create a task with just a title.
            </p>
          )}
          {skillsState.status === 'loaded' &&
            skillsState.skills.length === 0 && (
              <p className="text-sm">No skills available yet.</p>
            )}
          {skillsState.status === 'loaded' && skillsState.skills.length > 0 && (
            <ul className="flex flex-col gap-2">
              {skillsState.skills.map((skill) => (
                <li key={skill.id} className="flex items-center gap-2">
                  <input
                    id={`skill-${skill.id}`}
                    type="checkbox"
                    checked={selectedSkillIds.has(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`skill-${skill.id}`} className="text-sm">
                    {skill.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: 'var(--btn-bg)' }}
          >
            {submitting ? 'Creating…' : 'Create task'}
          </button>
          <Link to="/tasks" className="text-sm" style={{ color: 'var(--accent)' }}>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

export default TaskCreatePage
