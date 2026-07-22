import { Router } from 'express';
import { IdParamSchema } from '../schemas/skill';
import { getSkillById } from '../services/skills';

export const skillsRouter = Router();

// Fetch a single skill (own fields only).
skillsRouter.get('/:id', async (req, res) => {
  const { id } = IdParamSchema.parse(req.params);
  res.json(await getSkillById(id));
});
