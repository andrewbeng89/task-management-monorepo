import { prisma } from '../db';
import { notFound } from '../lib/errors';
import { serializeSkill } from '../serializers/skill';

/** Fetches a single skill or throws 404. */
export async function getSkillById(id: string) {
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) throw notFound(`Skill ${id} not found`);
  return serializeSkill(skill);
}
