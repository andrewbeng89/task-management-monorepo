## Why

The backend already exposes task APIs, but the frontend is still the default Vite starter with no routing and no task-facing screens. To start building the task management MVP we need a navigable app shell with placeholder routes for the core task workflows, so subsequent changes can layer in real business logic against a stable, accessible, responsive layout.

## What Changes

- Introduce client-side routing to the frontend (currently a single static `App.tsx` with no router).
- Add a shared responsive app layout (skip link, header/navigation, main content landmark) that all task pages render inside.
- Add a placeholder **Task list** route (e.g. `/tasks`) with layout scaffolding only — no data fetching or business logic.
- Add a placeholder **Task creation** route (e.g. `/tasks/new`) with layout scaffolding only — no form submission or validation logic.
- Add a default route redirect and a catch-all "not found" route so navigation is complete.
- Replace the starter `App.tsx`/`App.css` demo content with the routed shell.
- Establish accessibility conventions (semantic landmarks, focus-visible states, keyboard navigation, respects `prefers-color-scheme`) and responsive breakpoints as the baseline for future pages.

Business logic (data fetching, mutations, form handling, validation) is explicitly **out of scope** for this change and will be implemented later.

## Capabilities

### New Capabilities
- `task-web-ui`: Client-side routing, shared responsive app layout, and accessible placeholder pages for viewing the task list and creating a task in the frontend MVP.

### Modified Capabilities
<!-- None. Existing specs are backend capabilities whose requirements are unchanged. -->

## Impact

- **Frontend code**: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/App.css` replaced/updated; new `frontend/src/routes/`, `frontend/src/pages/`, and `frontend/src/components/layout/` directories.
- **Dependencies**: adds a routing library (`react-router-dom`) to `frontend/package.json`.
- **Routing/URLs**: introduces `/tasks`, `/tasks/new`, a root redirect, and a catch-all route.
- **No backend impact**: task APIs are untouched; no network calls are wired up in this change.
