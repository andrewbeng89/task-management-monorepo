## MODIFIED Requirements

### Requirement: Create a task

The API SHALL provide `POST /api/tasks` to create a task. The request body MUST include a non-empty `title`. It MAY include `status` (one of `TODO`, `IN_PROGRESS`, `DONE`; defaults to `TODO`), `requiredSkillIds` (array of existing skill ids), and `parentId` (an existing task id). When `requiredSkillIds` is omitted or empty, the API SHALL attempt to infer the task's required skills from its `title` using the Gemini API, choosing only from the skills that exist in the `skills` table, and link any inferred skills to the created task. This inference SHALL be best-effort: if it is not configured, fails, or yields no usable skills, the task SHALL still be created with no required skills. When `requiredSkillIds` is provided, the API SHALL use exactly those skills and SHALL NOT infer. On success the API SHALL return `201 Created` with the created task, including its generated `id` and its required skills.

#### Scenario: Create a task with only a title

- **WHEN** a client sends `POST /api/tasks` with `{ "title": "Build homepage" }`
- **THEN** the API creates the task with status `TODO` and returns `201` with the task's `id`, `title`, and `status`

#### Scenario: Infer skills from the title when none are provided

- **WHEN** a client sends `POST /api/tasks` with a `title` and no `requiredSkillIds` (or an empty array), and skill inference is configured and available
- **THEN** the API infers required skills from the title, choosing only from skills that exist in the `skills` table, and returns `201` with those inferred skills linked to the task

#### Scenario: Inference is best-effort and never blocks creation

- **WHEN** a client sends `POST /api/tasks` without `requiredSkillIds` and inference is unavailable (no API key, empty skills table, or the Gemini call fails or returns nothing usable)
- **THEN** the API still returns `201` with the created task and no required skills, and does not return an error

#### Scenario: Provided skills are used as-is without inference

- **WHEN** a client sends `POST /api/tasks` with a `title` and a non-empty `requiredSkillIds` referencing existing skills
- **THEN** the API creates the task, links exactly those required skills (no inference is performed), and returns `201` with the task and its required skills

#### Scenario: Reject a task with a missing or empty title

- **WHEN** a client sends `POST /api/tasks` with no `title` or an empty `title`
- **THEN** the API returns `400 Bad Request` with a JSON error describing the invalid field and does not create a task

#### Scenario: Reject unknown referenced ids

- **WHEN** a client sends `POST /api/tasks` referencing a `parentId` or `requiredSkillIds` that do not exist
- **THEN** the API returns `400 Bad Request` (or `422`) with a JSON error and does not create a task
