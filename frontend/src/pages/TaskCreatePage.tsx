import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createTask, listSkills, toErrorMessage } from '@/lib/api'
import CreateTask from '@/components/CreateTask'
import { newDraftNode, type DraftNode, type SkillsState } from '@/lib/draftTask'

/** Validates every node has a non-empty title; returns the annotated tree and the first invalid key. */
function validateTree(node: DraftNode): {
  node: DraftNode
  firstInvalidKey: string | null
} {
  let firstInvalidKey: string | null = null
  function walk(n: DraftNode): DraftNode {
    const error = n.title.trim() ? null : 'Please enter a task title.'
    if (error && !firstInvalidKey) firstInvalidKey = n.key
    return { ...n, titleError: error, children: n.children.map(walk) }
  }
  return { node: walk(node), firstInvalidKey }
}

/** Creates a node and then its children (each with this node's id as parent), depth-first. */
async function createSubtree(node: DraftNode, parentId?: string): Promise<void> {
  const created = await createTask({
    title: node.title.trim(),
    requiredSkillIds: node.skillIds.length ? node.skillIds : undefined,
    parentId,
  })
  for (const child of node.children) {
    await createSubtree(child, created.id)
  }
}

function TaskCreatePage() {
  const navigate = useNavigate()
  const [root, setRoot] = useState<DraftNode>(() => newDraftNode())
  const [skills, setSkills] = useState<SkillsState>({ status: 'loading' })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    listSkills()
      .then((list) => {
        if (active) setSkills({ status: 'loaded', skills: list })
      })
      .catch(() => {
        if (active) setSkills({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    const { node: validated, firstInvalidKey } = validateTree(root)
    if (firstInvalidKey) {
      setRoot(validated)
      // Focus the first block missing a title after the errors render.
      setTimeout(() => {
        document.getElementById(`title-${firstInvalidKey}`)?.focus()
      }, 0)
      return
    }

    setSubmitting(true)
    try {
      await createSubtree(root)
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
      <p className="mt-1">
        Create a task, and optionally break it into nested subtasks.
      </p>

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

        <CreateTask node={root} skills={skills} depth={0} onChange={setRoot} />

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
