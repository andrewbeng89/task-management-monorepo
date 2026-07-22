import { Router } from 'express';
import {
  AssignBodySchema,
  CreateTaskBodySchema,
  StatusBodySchema,
  TaskIdParamSchema,
} from '../schemas/task';
import {
  assignTask,
  createTask,
  getTaskById,
  listTasks,
  updateTaskStatus,
} from '../services/tasks';

export const tasksRouter = Router();

// Create a task.
tasksRouter.post('/', async (req, res) => {
  const body = CreateTaskBodySchema.parse(req.body);
  const task = await createTask(body);
  res.status(201).json(task);
});

// List all tasks.
tasksRouter.get('/', async (_req, res) => {
  res.json(await listTasks());
});

// Fetch a single task.
tasksRouter.get('/:id', async (req, res) => {
  const { id } = TaskIdParamSchema.parse(req.params);
  res.json(await getTaskById(id));
});

// Assign a task to a developer (skill-match enforced in the service).
tasksRouter.patch('/:id/assignee', async (req, res) => {
  const { id } = TaskIdParamSchema.parse(req.params);
  const body = AssignBodySchema.parse(req.body);
  res.json(await assignTask(id, body));
});

// Update a task's status.
tasksRouter.patch('/:id/status', async (req, res) => {
  const { id } = TaskIdParamSchema.parse(req.params);
  const body = StatusBodySchema.parse(req.body);
  res.json(await updateTaskStatus(id, body));
});
