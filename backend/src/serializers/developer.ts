import { Prisma } from '@prisma/client';

/** Loads a developer with its downstream relationship: skills (via the join). */
export const developerInclude = {
  skills: { include: { skill: true } },
} satisfies Prisma.DeveloperInclude;

type DeveloperWithRelations = Prisma.DeveloperGetPayload<{
  include: typeof developerInclude;
}>;

/**
 * Maps a Prisma developer to the wire DTO: own fields plus its skills.
 * Tasks assigned to the developer are upstream and deliberately omitted.
 */
export function serializeDeveloper(developer: DeveloperWithRelations) {
  return {
    id: developer.id,
    name: developer.name,
    createdAt: developer.createdAt.toISOString(),
    updatedAt: developer.updatedAt.toISOString(),
    skills: developer.skills.map((ds) => ({
      id: ds.skill.id,
      name: ds.skill.name,
    })),
  };
}

export type DeveloperDto = ReturnType<typeof serializeDeveloper>;
