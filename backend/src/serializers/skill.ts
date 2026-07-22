import type { Skill } from '@prisma/client';

/**
 * Maps a Prisma skill to the wire DTO: own fields only. A skill has no
 * downstream relationships, so no relations are included.
 */
export function serializeSkill(skill: Skill) {
  return {
    id: skill.id,
    name: skill.name,
    createdAt: skill.createdAt.toISOString(),
  };
}

export type SkillDto = ReturnType<typeof serializeSkill>;
