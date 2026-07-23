## Why

The task creation page is currently an accessible placeholder — it renders no form and submits nothing. To let users actually create tasks we need a real, keyboard-operable form wired to `POST /api/tasks`. Supporting the optional "skills" field also requires a way to list the available skills, which the backend does not yet expose.

## What Changes

- Implement the task creation form on the existing `/tasks/new` page using a semantic `<form>` element.
  - **Title** is the only required field; the form MUST be submittable using the keyboard alone (Enter in a field and/or activating the submit control), per the accessibility requirement.
  - **Skills** are optional, chosen from the available skills via an accessible checkbox group (`<fieldset>`/`<legend>`).
  - Developer assignment is **not** part of this form (it belongs to the task list page, later).
  - On success (`201`), navigate to the task list; on validation/API error, show an accessible error message and keep the entered values.
- Add a frontend API client built on `ky` and use it for the create request and the skills fetch. **Remove the unused `@tanstack/react-query` dependency** — `ky` is sufficient for this change; server-state caching can be reconsidered when the task list needs it.
- Add `GET /api/skills` to the backend to list all skills, so the form can render the skill picker.
- Document the new `GET /api/skills` endpoint in the OpenAPI registry.

## Capabilities

### New Capabilities
<!-- None. This extends existing capabilities. -->

### Modified Capabilities
- `task-web-ui`: The task creation page changes from an accessible placeholder to a working, keyboard-operable creation form that submits to `POST /api/tasks`.
- `developer-skill-api`: Adds a requirement to list all skills via `GET /api/skills` (the read counterpart to the existing `GET /api/skills/:id`).

## Impact

- **Frontend**: `frontend/src/pages/TaskCreatePage.tsx` (real form), new `frontend/src/lib/api.ts` (ky client) and small form/field components as needed; `frontend/package.json` (remove `@tanstack/react-query`).
- **Backend**: `backend/src/routes/skills.ts` (list route), `backend/src/services/skills.ts` (list query), `backend/src/schemas/skill.ts` (list response schema), `backend/src/openapi.ts` (path registration). Reuses the existing skill serializer; no schema/migration changes.
- **No breaking changes**: the new skills endpoint is additive; the frontend change replaces placeholder UI with functional UI.
