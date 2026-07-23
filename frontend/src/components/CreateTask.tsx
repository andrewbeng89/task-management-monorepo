import { Plus, X } from 'lucide-react'
import { newDraftNode, type DraftNode, type SkillsState } from '@/lib/draftTask'

interface CreateTaskProps {
  node: DraftNode
  skills: SkillsState
  onChange: (node: DraftNode) => void
  onRemove?: () => void
  depth: number
}

/**
 * Controlled, recursive task-creation form block. Renders one draft node's
 * title + optional skills, plus its (indented) child blocks, an "Add subtask"
 * action, and — for non-root blocks — a "Remove" action.
 */
function CreateTask({ node, skills, onChange, onRemove, depth }: CreateTaskProps) {
  const titleId = `title-${node.key}`
  const errorId = `title-error-${node.key}`
  const isRoot = depth === 0

  function toggleSkill(skillId: string) {
    const next = node.skillIds.includes(skillId)
      ? node.skillIds.filter((id) => id !== skillId)
      : [...node.skillIds, skillId]
    onChange({ ...node, skillIds: next })
  }

  function addSubtask() {
    onChange({ ...node, children: [...node.children, newDraftNode()] })
  }

  function updateChild(index: number, updated: DraftNode) {
    onChange({
      ...node,
      children: node.children.map((c, i) => (i === index ? updated : c)),
    })
  }

  function removeChild(index: number) {
    onChange({
      ...node,
      children: node.children.filter((_, i) => i !== index),
    })
  }

  return (
    <fieldset
      className="rounded-md border p-4"
      style={{ borderColor: 'var(--border)' }}
    >
      <legend className="px-1 text-sm font-medium">
        {isRoot ? 'Task details' : 'Subtask'}
      </legend>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={titleId} className="text-sm font-medium">
          Title <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id={titleId}
          type="text"
          value={node.title}
          onChange={(e) =>
            onChange({ ...node, title: e.target.value, titleError: null })
          }
          required
          aria-required="true"
          aria-invalid={node.titleError ? 'true' : undefined}
          aria-describedby={node.titleError ? errorId : undefined}
          autoFocus={isRoot}
          className="rounded-md border px-3 py-2"
          style={{
            borderColor: node.titleError
              ? 'var(--accent-border)'
              : 'var(--border)',
            background: 'var(--bg)',
            color: 'var(--text-h)',
          }}
        />
        {node.titleError && (
          <p id={errorId} className="text-sm" style={{ color: 'var(--accent)' }}>
            {node.titleError}
          </p>
        )}
      </div>

      <fieldset
        className="mt-4 rounded-md border p-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <legend className="px-1 text-sm font-medium">Skills (optional)</legend>
        {skills.status === 'loading' && <p className="text-sm">Loading skills…</p>}
        {skills.status === 'error' && (
          <p className="text-sm">
            Couldn’t load skills. You can still create this task with just a title.
          </p>
        )}
        {skills.status === 'loaded' && skills.skills.length === 0 && (
          <p className="text-sm">No skills available yet.</p>
        )}
        {skills.status === 'loaded' && skills.skills.length > 0 && (
          <ul className="flex flex-col gap-2">
            {skills.skills.map((skill) => {
              const id = `skill-${node.key}-${skill.id}`
              return (
                <li key={skill.id} className="flex items-center gap-2">
                  <input
                    id={id}
                    type="checkbox"
                    checked={node.skillIds.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={id} className="text-sm">
                    {skill.name}
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addSubtask}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm"
          style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)' }}
        >
          <Plus aria-hidden="true" size={16} />
          Add subtask
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove this subtask"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm"
            style={{ color: 'var(--text)' }}
          >
            <X aria-hidden="true" size={16} />
            Remove
          </button>
        )}
      </div>

      {node.children.length > 0 && (
        <div
          className="mt-4 flex flex-col gap-4 pl-4"
          style={{ borderLeft: '2px solid var(--border)' }}
        >
          {node.children.map((child, index) => (
            <CreateTask
              key={child.key}
              node={child}
              skills={skills}
              depth={depth + 1}
              onChange={(updated) => updateChild(index, updated)}
              onRemove={() => removeChild(index)}
            />
          ))}
        </div>
      )}
    </fieldset>
  )
}

export default CreateTask
