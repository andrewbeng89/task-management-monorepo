import { Prisma } from '@prisma/client';

/**
 * The Prisma query shape every task endpoint loads: the task plus its assignee
 * and its required skills (through the `task_skills` join). Services use
 * `taskInclude` so serialization always has the relations it needs.
 */
export const taskInclude = {
  assignee: true,
  skills: { include: { skill: true } },
  subtasks: { select: { status: true } },
} satisfies Prisma.TaskInclude;

type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

/** Maps a Prisma task entity to the stable wire DTO. */
export function serializeTask(task: TaskWithRelations) {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    assignee: task.assignee
      ? { id: task.assignee.id, name: task.assignee.name }
      : null,
    requiredSkills: task.skills.map((ts) => ({
      id: ts.skill.id,
      name: ts.skill.name,
    })),
    // True when every direct subtask is DONE (and trivially true when none).
    allSubtasksDone: task.subtasks.every((s) => s.status === 'DONE'),
    parentId: task.parentId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export type TaskDto = ReturnType<typeof serializeTask>;
