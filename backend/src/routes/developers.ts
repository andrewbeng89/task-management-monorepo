import { Router } from 'express';
import { IdParamSchema } from '../schemas/developer';
import { getDeveloperById } from '../services/developers';

export const developersRouter = Router();

// Fetch a single developer (own fields + skills).
developersRouter.get('/:id', async (req, res) => {
  const { id } = IdParamSchema.parse(req.params);
  res.json(await getDeveloperById(id));
});
