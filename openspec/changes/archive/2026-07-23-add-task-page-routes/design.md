## Context

The frontend (`frontend/`) is a Vite 8 + React 19 + TypeScript app styled with Tailwind CSS 4 (`@tailwindcss/vite`). It currently ships the default Vite starter: a single `App.tsx` with demo content, `App.css`, and no router. TanStack Query, `ky`, `clsx`, and `lucide-react` are already installed. The `@` alias points to `frontend/src`, and Vite proxies `/api` to the backend.

The backend already serves task APIs, but there is no navigable UI. This change adds the routed, accessible, responsive app shell that future data-driven work will build on. It deliberately stops at placeholders — no fetching, mutations, forms, or validation.

## Goals / Non-Goals

**Goals:**
- Add client-side routing with dedicated URLs for the task list (`/tasks`) and task creation (`/tasks/new`).
- Provide one shared, responsive layout with proper landmarks (header/banner, nav, main), a skip link, and visible focus states.
- Establish accessibility conventions (single `h1` per page, `aria-current` on active nav, keyboard operability, respects `prefers-color-scheme`) as the baseline for later pages.
- Replace the starter demo content cleanly.

**Non-Goals:**
- No data fetching, mutations, form handling, or validation (explicitly deferred).
- No design system / component library adoption beyond Tailwind utilities.
- No auth, no global state management decisions beyond what routing needs.
- No backend changes.

## Decisions

### Routing library: `react-router-dom` v7
Use `react-router-dom` for client-side routing. It is the de facto standard for React SPAs, has first-class nested layout routes (an `Outlet` inside a layout element), and is well documented — appropriate for an MVP the team will extend.

*Alternatives considered:* **TanStack Router** (type-safe, pairs with the installed TanStack Query, but heavier setup and a steeper learning curve than needed for placeholder routes); **hand-rolled state-based switching** (no real URLs, breaks deep-linking and back/forward — rejected).

### Route structure: nested layout route
A single layout route renders the shared shell (`<AppLayout>` with header, nav, skip link) and an `<Outlet/>` for page content:
- `/` → redirect to `/tasks`
- `/tasks` → `TaskListPage`
- `/tasks/new` → `TaskCreatePage`
- `*` → `NotFoundPage`

Nesting keeps the layout mounted across task routes and centralizes landmarks/skip-link so pages only own their `<h1>` and content region.

*Alternative considered:* repeating the layout wrapper per page — rejected as duplicative and error-prone for accessibility landmarks.

### File organization
- `frontend/src/routes/router.tsx` — route definitions (createBrowserRouter).
- `frontend/src/components/layout/AppLayout.tsx` — shell: skip link, header/banner, nav, `<main id="main">`, `<Outlet/>`.
- `frontend/src/pages/TaskListPage.tsx`, `TaskCreatePage.tsx`, `NotFoundPage.tsx` — placeholder pages.
- `main.tsx` renders `<RouterProvider/>` (keep existing `QueryClientProvider` if present, otherwise leave query wiring for later). `App.tsx`/`App.css` starter demo removed.

### Styling: Tailwind utilities + existing CSS tokens
Use Tailwind utility classes for layout/responsiveness. Reuse the CSS custom properties already defined in `index.css` (color tokens with light/dark variants) where they help contrast; ensure `@import "tailwindcss";` is present so utilities compile. Mobile-first breakpoints (`sm`/`md`/`lg`) for the responsive nav and content max-width.

### Accessibility approach
- Skip link as the first focusable element, visually hidden until focused, targeting `#main`.
- Exactly one `<h1>` per page; landmarks via semantic `<header>`, `<nav aria-label="Primary">`, `<main>`.
- Active nav link uses `NavLink` with `aria-current="page"` and a visible active style.
- Global `:focus-visible` outline; never remove focus outlines without replacement.
- Respect `prefers-color-scheme` (already partly handled in `index.css`).

## Risks / Trade-offs

- **New dependency (`react-router-dom`)** → Small, well-maintained, standard; acceptable for an MVP.
- **Placeholder pages could rot / mislead** → Keep them clearly labeled as placeholders and cover their scaffolding in the spec scenarios so later work replaces intentionally.
- **Tailwind may not be fully wired** (`index.css` shows tokens but not confirmed `@import "tailwindcss"`) → Verify/add the import during implementation so utilities apply; fall back to the existing CSS tokens if needed.
- **Accessibility regressions later** → Establishing landmarks/skip-link/focus conventions now sets a pattern; recommend a quick keyboard + contrast pass (and optionally a Lighthouse/axe check) at implementation.

## Migration Plan

Additive change within the frontend. Steps: add `react-router-dom`, create layout/pages/router, switch `main.tsx` to `RouterProvider`, remove starter demo. Rollback = revert the commit; no data or backend migration involved.

## Open Questions

- Final URL scheme confirmed as `/tasks` and `/tasks/new` (assumed; adjust if the team prefers `/` for the list).
- Whether to keep `QueryClientProvider` mounted now or defer until data work begins (leaning: keep if already wired, otherwise defer).
