import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Adds the `.openapi()` helper to Zod so schemas double as OpenAPI components.
extendZodWithOpenApi(z);

export const TaskStatusSchema = z
  .enum(['TODO', 'IN_PROGRESS', 'DONE'])
  .openapi('TaskStatus');

// ---- Request bodies ----

export const CreateTaskBodySchema = z
  .object({
    title: z.string().trim().min(1, 'title is required'),
    status: TaskStatusSchema.optional(),
    requiredSkillIds: z.array(z.string().uuid()).optional(),
    parentId: z.string().uuid().nullish(),
  })
  .openapi('CreateTaskBody');

export const AssignBodySchema = z
  .object({
    developerId: z.string().uuid(),
  })
  .openapi('AssignBody');

export const StatusBodySchema = z
  .object({
    status: TaskStatusSchema,
  })
  .openapi('StatusBody');

export const TaskIdParamSchema = z.object({
  id: z.string().uuid(),
});

// ---- Response schemas ----

const SkillRefSchema = z
  .object({ id: z.string().uuid(), name: z.string() })
  .openapi('SkillRef');

const AssigneeRefSchema = z
  .object({ id: z.string().uuid(), name: z.string() })
  .openapi('AssigneeRef');

export const TaskSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    status: TaskStatusSchema,
    assignee: AssigneeRefSchema.nullable(),
    requiredSkills: z.array(SkillRefSchema),
    allSubtasksDone: z.boolean(),
    parentId: z.string().uuid().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('Task');

export const TaskListSchema = z.array(TaskSchema).openapi('TaskList');

export const ErrorSchema = z
  .object({
    error: z.string(),
    details: z.unknown().optional(),
  })
  .openapi('Error');

export type CreateTaskBody = z.infer<typeof CreateTaskBodySchema>;
export type AssignBody = z.infer<typeof AssignBodySchema>;
export type StatusBody = z.infer<typeof StatusBodySchema>;
