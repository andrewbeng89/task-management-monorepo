## Context

The `/tasks/new` route currently renders an accessible placeholder (from the `add-task-page-routes` change). The frontend is React 19 + Vite + Tailwind 4 with `react-router-dom` v7; `ky` and `@tanstack/react-query` are installed but **unused** (verified: no imports of either in `frontend/src`). The backend exposes `POST /api/tasks` (body: `title` required; `requiredSkillIds`, `status`, `parentId` optional; returns `201` with the task, `400` on validation error) and `GET /api/skills/:id`, but **no** `GET /api/skills` list endpoint. Vite proxies `/api` to the backend.

This change makes the creation page functional and adds the minimal backend endpoint the skills picker needs.

## Goals / Non-Goals

**Goals:**
- A semantic `<form>` on `/tasks/new`, submittable by keyboard alone, that creates a task via `POST /api/tasks`.
- Title required; skills optional via an accessible checkbox group; no developer assignment.
- Accessible validation and error handling; navigate to the task list on success.
- A small `ky`-based API client; add `GET /api/skills` on the backend.

**Non-Goals:**
- Developer assignment (belongs to the task list page, later).
- Task list data fetching/caching, subtasks, status editing.
- Adopting a server-state library now (see decision on react-query).

## Decisions

### `ky` is sufficient; remove `@tanstack/react-query`
This page performs a one-shot mutation (create → redirect) and a simple read (list skills). `ky` covers both. `@tanstack/react-query`'s value — caching, background refetch, invalidation — only pays off once the task **list** shows cached server state that must refresh after a create; that is a later change. Per the decision, remove `@tanstack/react-query` from `frontend/package.json` now to keep dependencies honest; it can be reintroduced when the list needs it.

*Alternative considered:* adopt react-query now with a `useMutation` — rejected as premature; adds a provider and concepts with no current caching benefit.

### API client: a thin `ky` instance
Add `frontend/src/lib/api.ts` exporting a configured `ky` instance with `prefixUrl` pointing at `/api` (through the Vite proxy) plus typed helpers: `listSkills()` → `Skill[]` and `createTask(input)` → `Task`. Centralizing avoids scattering fetch config and gives one place to parse JSON errors into a message.

### Skill selection: accessible checkbox group
Render skills as native checkboxes inside a `<fieldset>` with a `<legend>` ("Skills (optional)"). Native checkboxes are keyboard-operable and screen-reader friendly out of the box, and match the multi-select semantics of `requiredSkillIds`. Fetch the list on mount with `listSkills()`; if the fetch fails or returns empty, the form still works (title-only) and the skills section shows an appropriate message.

*Alternative considered:* a multi-select `<select multiple>` — worse keyboard UX and harder to style accessibly; rejected.

### Keyboard-only submission
Use a real `<form onSubmit>` with a `<button type="submit">`. Native behavior submits on Enter from a text field and on activating the button via keyboard — no extra handlers needed. Prevent the default full-page navigation and call the API client instead.

### Validation & error handling (accessibility)
- Title: client-side check for non-empty/trimmed. On invalid submit, block the request, render a message tied to the input via `aria-describedby`, mark `aria-invalid`, and move focus to the field.
- Submit/API failure: render the error in a container with `role="alert"` (or an `aria-live` region) so assistive tech announces it, and keep the user's entered values.
- Disable the submit control while the request is in flight to prevent double submits.

### Backend `GET /api/skills`
Add `listSkills()` to `backend/src/services/skills.ts` (`prisma.skill.findMany`, ordered by name) mapped through the existing `serializeSkill`. Add the route to `skills.ts`, a `SkillListSchema` (array of the existing `SkillDetail`) to `schemas/skill.ts`, and register the path in `openapi.ts` with a `200` response. Mirrors the shape and conventions of the existing skill endpoint.

## Risks / Trade-offs

- **Removing a dependency others might expect** → Documented here and in the proposal; re-adding react-query later is trivial and will be an explicit decision when the list needs caching.
- **Skills endpoint is unbounded** (no pagination) → Fine for the MVP's small skill set; note as a future enhancement.
- **Route ordering on the backend** → `GET /api/skills` (collection) and `GET /api/skills/:id` (item) are distinct paths; no conflict.
- **Client/proxy base URL drift** → Use the `/api` proxy in dev; keep the base URL in one place (`lib/api.ts`).

## Migration Plan

Additive backend endpoint + frontend UI replacement. No data migration. Deploy together; rollback = revert the commit. Removing `@tanstack/react-query` only affects `package.json`/lockfile since it has no current usages.

## Open Questions

- Should the skills list be sorted by name (assumed yes) or by creation order? Assumed name-ascending for predictability.
