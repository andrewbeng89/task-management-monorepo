# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Local development

Run the frontend dev server against the backend running in Docker.

```bash
# 1. Start the backend (and its database) in Docker — from the repo root
docker compose up -d postgres backend

# 2. Start the frontend dev server — from this directory
npm run dev
```

Open http://localhost:3000. The dev server proxies every `/api/*` request to the
backend, which Docker publishes on `localhost:6000`. This is the proxy default in
[`vite.config.ts`](./vite.config.ts), so no extra configuration is needed.

### Pointing at a different backend

The proxy target is read from the `VITE_API_URL` **shell** environment variable
(it is read from `process.env` in `vite.config.ts`, not from a `.env` file). Set it
to the backend **origin only** — do not include a path:

```bash
VITE_API_URL=http://localhost:6000 npm run dev
```

> **Gotcha:** `.env.example` sets `VITE_API_URL=http://localhost:6000/api` (with a
> trailing `/api`) for other consumers. Do **not** export that value for `npm run dev`:
> the proxy already matches the `/api` prefix, so a target ending in `/api` forwards
> `/api/skills` to `http://localhost:6000/api/api/skills` (a double `/api` → 404).
> Leave `VITE_API_URL` unset (the default is correct) or set it to the origin without `/api`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
