## Context

The backend (`backend/`) is an Express + Prisma (PostgreSQL) API. Tasks require zero or more skills via the `task_skills` join, and each task has a single optional assignee (`Task.assigneeId`). Developers hold skills via the `developer_skills` join. The existing `assignTask` service already encodes the eligibility rule — a developer may be assigned when they share **at least one** required skill, and any developer is eligible when the task requires none.

This change adds a read-only discovery endpoint that returns the developers eligible to be assigned to a given task, so clients don't have to guess a developer id. It is the natural read counterpart to the existing `PATCH /api/tasks/:id/assignee`.

## Goals / Non-Goals

**Goals:**
- Add `GET /api/tasks/:id/assignees` returning skill-matched developers who are not the task's current assignee.
- Reuse existing conventions: route → service → serializer, Zod schemas, OpenAPI registration, JSON error shape.
- Keep the eligibility rule identical to `assignTask` so discovery and assignment never disagree.

**Non-Goals:**
- No changes to the Prisma schema or migrations.
- No pagination, sorting, or filtering beyond the eligibility rule (can be added later if the developer set grows).
- No change to the assignment endpoint itself.
- No ranking by number of matched skills.

## Decisions

### "Not currently assigned" means excluding the single current assignee
The data model allows exactly one assignee per task (`Task.assigneeId`). So "developers not already assigned to this task" resolves to: exclude the task's current `assigneeId` (if set). All other eligible developers are returned.

*Alternative considered:* interpreting assignment as many-to-many — rejected because the schema is a single optional assignee; introducing multi-assignment is out of scope.

### No-required-skills case returns all developers (minus the current assignee)
To stay consistent with `assignTask` (which allows any developer when a task requires no skills), the endpoint returns all developers except the current assignee when the task has no required skills.

*Alternative considered:* returning an empty array for skill-less tasks — rejected as inconsistent with the assignment rule and less useful to clients.

### Query strategy: filter in the database
Implement the service with a single Prisma query using `where`:
- `skills: { some: { skillId: { in: requiredSkillIds } } }` to match at least one required skill, and
- `id: { not: assigneeId }` (only when an assignee is set) to exclude the current assignee.

When `requiredSkillIds` is empty, drop the skill filter so all developers (minus the assignee) are returned. Load skills via `developerInclude` so results serialize with `serializeDeveloper`. First fetch the task (with its `skills` and `assigneeId`) and throw `404` if absent — matching `getTaskById`/`assignTask`.

*Alternative considered:* fetch all developers and filter in memory — rejected; pushing the predicate to the DB is simpler and scales better.

### Response shape reuses `serializeDeveloper`
Return an array of the existing developer DTO (`id`, `name`, `createdAt`, `updatedAt`, `skills`). This lets a client show each candidate's skills (e.g. which requirement they satisfy) without a second call. Add a `DeveloperListSchema` (array of the existing developer schema) for OpenAPI, and register the path with `200` and `404`/`400` error responses.

## Risks / Trade-offs

- **Semantic ambiguity of "assigned"** → Resolved above by binding it to the single `assigneeId`; documented in the spec scenarios so future multi-assignment work revisits it intentionally.
- **Rule drift between discovery and assignment** → Both must apply the same "≥1 required skill / any when none" rule. Mitigation: keep the predicate in the service layer and mirror `assignTask`'s logic; cross-check in verification.
- **Unbounded result set** → Acceptable for the MVP; note as a future enhancement (pagination) rather than build it now.

## Migration Plan

Additive, read-only endpoint. No data migration. Deploy with the code change; rollback = revert the commit. No client is broken because nothing previously depended on this path.

## Open Questions

- Should candidates be ordered (e.g. by name, or by count of matched skills)? Assumed unordered for the MVP; easy to add later.
