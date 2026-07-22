import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import {
  AssignBodySchema,
  CreateTaskBodySchema,
  ErrorSchema,
  StatusBodySchema,
  TaskIdParamSchema,
  TaskListSchema,
  TaskSchema,
} from './schemas/task';
import { DeveloperDetailSchema, IdParamSchema } from './schemas/developer';
import { SkillDetailSchema } from './schemas/skill';

const registry = new OpenAPIRegistry();

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: ErrorSchema } },
});

registry.registerPath({
  method: 'post',
  path: '/api/tasks',
  summary: 'Create a task',
  request: {
    body: {
      content: { 'application/json': { schema: CreateTaskBodySchema } },
    },
  },
  responses: {
    201: {
      description: 'Task created',
      content: { 'application/json': { schema: TaskSchema } },
    },
    400: errorResponse('Invalid request body or unknown referenced id'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks',
  summary: 'List all tasks',
  responses: {
    200: {
      description: 'List of tasks',
      content: { 'application/json': { schema: TaskListSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks/{id}',
  summary: 'Fetch a task by id',
  request: { params: TaskIdParamSchema },
  responses: {
    200: {
      description: 'The task',
      content: { 'application/json': { schema: TaskSchema } },
    },
    404: errorResponse('Task not found'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/tasks/{id}/assignee',
  summary: 'Assign a task to a developer sharing at least one required skill',
  request: {
    params: TaskIdParamSchema,
    body: { content: { 'application/json': { schema: AssignBodySchema } } },
  },
  responses: {
    200: {
      description: 'Task with the new assignee',
      content: { 'application/json': { schema: TaskSchema } },
    },
    400: errorResponse('Invalid request body'),
    404: errorResponse('Task or developer not found'),
    409: errorResponse('Developer lacks every skill the task requires'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/tasks/{id}/status',
  summary: "Update a task's status",
  request: {
    params: TaskIdParamSchema,
    body: { content: { 'application/json': { schema: StatusBodySchema } } },
  },
  responses: {
    200: {
      description: 'Task with the new status',
      content: { 'application/json': { schema: TaskSchema } },
    },
    400: errorResponse('Invalid status value'),
    404: errorResponse('Task not found'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/developers/{id}',
  summary: 'Fetch a developer by id (own fields and skills)',
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: 'The developer',
      content: { 'application/json': { schema: DeveloperDetailSchema } },
    },
    400: errorResponse('Invalid id'),
    404: errorResponse('Developer not found'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/skills/{id}',
  summary: 'Fetch a skill by id (own fields only)',
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: 'The skill',
      content: { 'application/json': { schema: SkillDetailSchema } },
    },
    400: errorResponse('Invalid id'),
    404: errorResponse('Skill not found'),
  },
});

/** Builds the OpenAPI 3.1 document from the registered schemas and paths. */
export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'HTTP API for creating, retrieving, assigning, and updating tasks.',
    },
    servers: [{ url: '/' }],
  });
}
