## 1. Dependencies & setup

- [x] 1.1 Add `react-router-dom` (v7) to `frontend/package.json` and install
- [x] 1.2 Ensure `@import "tailwindcss";` is present in `frontend/src/index.css` so utility classes compile
- [x] 1.3 Add global `:focus-visible` outline styles and a visually-hidden `.sr-only`-style skip-link pattern (Tailwind or CSS) in `index.css`

## 2. App shell & layout

- [x] 2.1 Create `frontend/src/components/layout/AppLayout.tsx` with a skip link as the first focusable element targeting `#main`
- [x] 2.2 Add semantic landmarks in `AppLayout`: `<header>` (banner), `<nav aria-label="Primary">`, and `<main id="main">` wrapping an `<Outlet/>`
- [x] 2.3 Build primary navigation using `NavLink` for Tasks and New Task, applying `aria-current="page"` and a visible active style on the current route
- [x] 2.4 Make the layout responsive: constrained readable max-width on desktop, no horizontal overflow on mobile, mobile-first breakpoints for the nav

## 3. Routing

- [x] 3.1 Create `frontend/src/routes/router.tsx` with a nested layout route rendering `AppLayout`
- [x] 3.2 Define routes: `/` redirects to `/tasks`, `/tasks` → task list, `/tasks/new` → task creation, `*` → not found
- [x] 3.3 Update `frontend/src/main.tsx` to render `<RouterProvider/>` (preserve any existing providers) and remove the starter `App.tsx`/`App.css` demo

## 4. Placeholder pages

- [x] 4.1 Create `frontend/src/pages/TaskListPage.tsx` with a single `<h1>`, a placeholder region for the future list, and a link to `/tasks/new` (no data fetching)
- [x] 4.2 Create `frontend/src/pages/TaskCreatePage.tsx` with a single `<h1>`, a placeholder region for the future form, and a way back to `/tasks` (no submission/validation)
- [x] 4.3 Create `frontend/src/pages/NotFoundPage.tsx` with a single `<h1>` and a link back to `/tasks`

## 5. Verification

- [x] 5.1 Run `npm run build` and `npm run lint` in `frontend/` and resolve any errors
- [x] 5.2 Manually verify routes: `/` redirects to `/tasks`, `/tasks`, `/tasks/new`, and an unknown path all render correctly inside the layout
- [x] 5.3 Keyboard pass: skip link works, nav links are focusable in logical order with visible focus, `aria-current` reflects the active route
- [x] 5.4 Responsive/contrast pass: check mobile and desktop widths for overflow, and light/dark `prefers-color-scheme` for adequate contrast (optionally run a Lighthouse/axe accessibility check)
