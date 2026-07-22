import { prisma } from '../db';
import { notFound } from '../lib/errors';
import { developerInclude, serializeDeveloper } from '../serializers/developer';

/** Fetches a single developer (with skills) or throws 404. */
export async function getDeveloperById(id: string) {
  const developer = await prisma.developer.findUnique({
    where: { id },
    include: developerInclude,
  });
  if (!developer) throw notFound(`Developer ${id} not found`);
  return serializeDeveloper(developer);
}
