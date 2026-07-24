import { prisma } from '../db';
import { badRequest, conflict, notFound } from '../lib/errors';
import { serializeTask, taskInclude } from '../serializers/task';
import { developerInclude, serializeDeveloper } from '../serializers/developer';
import { listSkills } from './skills';
import { inferSkillIds } from './skill-inference';
import type {
  AssignBody,
  CreateTaskBody,
  StatusBody,
} from '../schemas/task';

/**
 * Creates a task, linking required skills and an optional parent. When no
 * `requiredSkillIds` are supplied, the skills are inferred from the task's own
 * title via the Gemini API (best-effort — any failure just yields no skills).
 */
export async function createTask(input: CreateTaskBody) {
  await assertReferencesExist(input);

  let skillIds = input.requiredSkillIds ?? [];
  if (skillIds.length === 0) {
    const skills = await listSkills();
    if (skills.length > 0) {
      try {
        skillIds = await inferSkillIds(input.title, skills);
      } catch (error) {
        console.warn(
          `Skill inference failed for task "${input.title}"; creating without skills.`,
          error,
        );
        skillIds = [];
      }
    }
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      status: input.status ?? 'TODO',
      parentId: input.parentId ?? null,
      skills: skillIds.length
        ? { create: skillIds.map((skillId) => ({ skillId })) }
        : undefined,
    },
    include: taskInclude,
  });

  return serializeTask(task);
}

/** Lists all tasks with assignee and required skills. */
export async function listTasks() {
  const tasks = await prisma.task.findMany({
    include: taskInclude,
    orderBy: { createdAt: 'asc' },
  });
  return tasks.map(serializeTask);
}

/** Fetches a single task or throws 404. */
export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({ where: { id }, include: taskInclude });
  if (!task) throw notFound(`Task ${id} not found`);
  return serializeTask(task);
}

/**
 * Assigns a task to a developer. Allowed only when the developer has at least
 * one of the task's required skills; if the task requires no skills, any
 * developer may be assigned.
 */
export async function assignTask(taskId: string, { developerId }: AssignBody) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { skills: { select: { skillId: true } } },
  });
  if (!task) throw notFound(`Task ${taskId} not found`);

  const developer = await prisma.developer.findUnique({
    where: { id: developerId },
    include: { skills: { select: { skillId: true } } },
  });
  if (!developer) throw notFound(`Developer ${developerId} not found`);

  const requiredSkillIds = task.skills.map((s) => s.skillId);
  if (requiredSkillIds.length > 0) {
    const developerSkillIds = new Set(developer.skills.map((s) => s.skillId));
    const hasMatch = requiredSkillIds.some((id) => developerSkillIds.has(id));
    if (!hasMatch) {
      throw conflict(
        `Developer ${developerId} has none of the skills required by task ${taskId}`,
      );
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId: developerId },
    include: taskInclude,
  });
  return serializeTask(updated);
}

/**
 * Lists the developers eligible to be assigned to a task: those holding at
 * least one of the task's required skills and not already the task's assignee.
 * When the task requires no skills, every developer (minus the current
 * assignee) is a candidate — mirroring the rule in `assignTask`.
 */
export async function listTaskAssignees(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      assigneeId: true,
      skills: { select: { skillId: true } },
    },
  });
  if (!task) throw notFound(`Task ${taskId} not found`);

  const requiredSkillIds = task.skills.map((s) => s.skillId);

  const candidates = await prisma.developer.findMany({
    where: {
      // Exclude whoever is already assigned to this task.
      ...(task.assigneeId ? { id: { not: task.assigneeId } } : {}),
      // Match at least one required skill; a task with no skills matches all.
      ...(requiredSkillIds.length
        ? { skills: { some: { skillId: { in: requiredSkillIds } } } }
        : {}),
    },
    include: developerInclude,
    orderBy: { name: 'asc' },
  });

  return candidates.map(serializeDeveloper);
}

/**
 * Updates a task's status. A task may only become `DONE` when all of its direct
 * subtasks are already `DONE`; otherwise the update is rejected with a conflict.
 */
export async function updateTaskStatus(taskId: string, { status }: StatusBody) {
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { subtasks: { select: { status: true } } },
  });
  if (!existing) throw notFound(`Task ${taskId} not found`);

  if (status === 'DONE') {
    const hasUnfinishedSubtask = existing.subtasks.some(
      (s) => s.status !== 'DONE',
    );
    if (hasUnfinishedSubtask) {
      throw conflict(
        `Task ${taskId} cannot be marked DONE while it has unfinished subtasks`,
      );
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: taskInclude,
  });
  return serializeTask(updated);
}

/** Validates that a referenced parent and required skills actually exist. */
async function assertReferencesExist(input: CreateTaskBody) {
  if (input.parentId) {
    const parent = await prisma.task.findUnique({ where: { id: input.parentId } });
    if (!parent) throw badRequest(`Parent task ${input.parentId} does not exist`);
  }

  if (input.requiredSkillIds?.length) {
    const found = await prisma.skill.findMany({
      where: { id: { in: input.requiredSkillIds } },
      select: { id: true },
    });
    if (found.length !== new Set(input.requiredSkillIds).size) {
      const foundIds = new Set(found.map((s) => s.id));
      const missing = input.requiredSkillIds.filter((id) => !foundIds.has(id));
      throw badRequest('One or more required skills do not exist', { missing });
    }
  }
}
