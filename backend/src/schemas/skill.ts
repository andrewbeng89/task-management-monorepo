import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const IdParamSchema = z.object({ id: z.string().uuid() });

/**
 * A skill's own fields only. A skill has no downstream relationships — the
 * developers who have it and the tasks that require it both reference the
 * skill (upstream) and are intentionally excluded.
 */
export const SkillDetailSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime(),
  })
  .openapi('SkillDetail');
