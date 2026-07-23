import { Router } from 'express';
import { IdParamSchema } from '../schemas/skill';
import { getSkillById, listSkills } from '../services/skills';

export const skillsRouter = Router();

// List all skills.
skillsRouter.get('/', async (_req, res) => {
  res.json(await listSkills());
});

// Fetch a single skill (own fields only).
skillsRouter.get('/:id', async (req, res) => {
  const { id } = IdParamSchema.parse(req.params);
  res.json(await getSkillById(id));
});
