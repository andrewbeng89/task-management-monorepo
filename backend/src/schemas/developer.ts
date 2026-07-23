import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const IdParamSchema = z.object({ id: z.string().uuid() });

// Inlined (not a named component) to avoid colliding with the task API's SkillRef.
const SkillRefSchema = z.object({ id: z.string().uuid(), name: z.string() });

/**
 * A developer's own fields plus its downstream relationship (skills).
 * Tasks assigned to the developer reference the developer (upstream) and are
 * intentionally excluded.
 */
export const DeveloperDetailSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    skills: z.array(SkillRefSchema),
  })
  .openapi('DeveloperDetail');

/** A list of developers — used by the task "candidate assignees" endpoint. */
export const DeveloperListSchema = z
  .array(DeveloperDetailSchema)
  .openapi('DeveloperList');
