import type { Skill } from './api'

/** A single node in the task-creation draft tree. */
export interface DraftNode {
  key: string
  title: string
  skillIds: string[]
  titleError: string | null
  children: DraftNode[]
}

export type SkillsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; skills: Skill[] }

let nodeCounter = 0

/** Creates a fresh, empty draft node with a stable unique key. */
export function newDraftNode(): DraftNode {
  nodeCounter += 1
  return { key: `n${nodeCounter}`, title: '', skillIds: [], titleError: null, children: [] }
}
