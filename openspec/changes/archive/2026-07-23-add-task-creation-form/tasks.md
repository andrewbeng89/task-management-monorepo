## 1. Backend: list skills endpoint

- [x] 1.1 Add `listSkills()` to `backend/src/services/skills.ts`: `prisma.skill.findMany` ordered by `name`, mapped through `serializeSkill`
- [x] 1.2 Add a `SkillListSchema` (array of the existing `SkillDetailSchema`) to `backend/src/schemas/skill.ts`
- [x] 1.3 Add `GET /` to `backend/src/routes/skills.ts` returning `await listSkills()` (collection route, distinct from `GET /:id`)
- [x] 1.4 Register `GET /api/skills` in `backend/src/openapi.ts` with a `200` response using `SkillListSchema`
- [x] 1.5 Build the backend (`npm run build`) and resolve type errors

## 2. Frontend: dependencies & API client

- [x] 2.1 Remove `@tanstack/react-query` from `frontend/package.json` and update the lockfile (confirm no imports remain)
- [x] 2.2 Create `frontend/src/lib/api.ts`: a configured `ky` instance (`prefixUrl` → `/api`) with typed `listSkills()` and `createTask(input)` helpers and JSON-error parsing
- [x] 2.3 Add lightweight TypeScript types for `Skill` and the create-task input/`Task` response used by the client

## 3. Frontend: task creation form

- [x] 3.1 Replace the placeholder in `frontend/src/pages/TaskCreatePage.tsx` with a semantic `<form onSubmit>` posting via `createTask`
- [x] 3.2 Add a required, labelled title `<input>` (`aria-describedby` for its error, `aria-invalid` when invalid)
- [x] 3.3 Add an optional skills `<fieldset>`/`<legend>` checkbox group populated from `listSkills()` on mount; keep the form usable (title-only) if skills are empty or fail to load
- [x] 3.4 Add a `<button type="submit">`; ensure Enter-to-submit works and the button is disabled while the request is in flight
- [x] 3.5 Client-side validation: block empty/whitespace title, show an accessible message, and move focus to the title field
- [x] 3.6 On success (`201`) navigate to `/tasks`; on error show a `role="alert"` message and preserve entered values
- [x] 3.7 Ensure no developer-assignment control exists on this form

## 4. Verification

- [x] 4.1 Run frontend `npm run build` and `npm run lint`; run backend `npm run build`
- [x] 4.2 With the backend + DB running, create a task keyboard-only (Tab to title, type, Enter) and confirm redirect to `/tasks` and the task persisted via `POST /api/tasks`
- [x] 4.3 Verify optional skills: select skills and confirm they are sent as `requiredSkillIds`; submit with none and confirm a title-only task is created
- [x] 4.4 Verify accessibility: empty-title submit is blocked with an announced message and focus moves to the field; a failed request shows a `role="alert"` and keeps input; run a Lighthouse/axe check on `/tasks/new`
- [x] 4.5 Verify `GET /api/skills` returns the seeded skills and appears in `/api/openapi.json`
