## Why

When creating a task, choosing the required skills is manual, and users often leave the field blank. We can reduce that friction by inferring the required skill(s) from the task's title using the Gemini API (`@google/genai`, free tier), constrained to the skills the organization actually tracks. This is a backend-only enhancement to task creation.

## What Changes

- In the backend `createTask` service, when `requiredSkillIds` is empty or omitted, infer the task's required skills from its `title` using the Gemini API and link the inferred skills to the created task.
- The inference is **constrained to the existing skills** in the `skills` table — the model may only pick from those; unknown/hallucinated names are discarded.
- Applies to **every** task created via the service, including subtasks (the creation form's nested tree calls `createTask` per node). Each task's skills are inferred from **its own title only** — never aggregated from its subtasks' titles.
- **Best-effort and non-blocking:** if no API key is configured, the skills table is empty, or the Gemini call fails/times out or returns nothing usable, the task is still created (with no skills) exactly as today. Skill inference never causes task creation to fail.
- When the user *does* provide `requiredSkillIds`, behavior is unchanged — no inference.
- Add a small Gemini client/service and a configurable model (env), reusing the existing `GEMINI_API_KEY`.
- Update documentation (root `README.md` tech-stack/decisions, `backend/README.md`) to describe the AI skill inference and its configuration.

## Capabilities

### New Capabilities
<!-- None. This modifies the existing task-api capability. -->

### Modified Capabilities
- `task-api`: `POST /api/tasks` (the create-task behavior) now infers required skills from the title via Gemini when none are supplied, choosing only from existing skills, as a best-effort step that never blocks creation.

## Impact

- **Backend**: new skill-inference service (e.g. `backend/src/services/skill-inference.ts`) wrapping `@google/genai`; `backend/src/services/tasks.ts` (`createTask`) calls it when `requiredSkillIds` is empty. Reads `GEMINI_API_KEY` (already in `.env.example`) and an optional `GEMINI_MODEL`.
- **API contract**: unchanged shape — `requiredSkillIds` stays optional; the response still returns the task with its `requiredSkills` (now possibly AI-inferred).
- **Docs**: `README.md` and `backend/README.md` updated.
- **No schema/migration changes; no frontend changes.**
- **External dependency/cost**: adds a network call to Gemini per task created without skills (including per subtask in a tree) — subject to free-tier rate limits; mitigated by the best-effort fallback.
