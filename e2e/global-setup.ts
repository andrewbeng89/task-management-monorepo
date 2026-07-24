import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { FullConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
// The API is reached through the frontend origin (nginx proxies `/api` to the
// backend) — the same path the browser uses. We deliberately do NOT probe the
// backend's own port 6000 directly: it is on the browser/undici unsafe-port
// blocklist (X11), so `fetch` rejects it with "bad port".
const API_READY_URL = process.env.E2E_API_READY_URL ?? `${BASE_URL}/api/tasks`;
// Host-published Postgres (compose maps 5432). NOTE: `localhost`, not the compose
// network name `postgres` — the seed runs on the host, outside the compose network.
const DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/taskdb?schema=public';

/** Polls a URL until it responds (any HTTP status), or throws after `timeoutMs`. */
async function waitForReady(label: string, url: string, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      // Any response means the service is up and routing (even a 4xx).
      if (res.status < 500) {
        console.log(`[e2e] ${label} ready (${res.status}) at ${url}`);
        return;
      }
      lastError = new Error(`status ${res.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(
    `[e2e] ${label} not ready at ${url} within ${timeoutMs}ms: ${String(lastError)}`
  );
}

/** Runs an npm script in the backend workspace with the host `DATABASE_URL`. */
function runBackendScript(script: string) {
  const result = spawnSync('npm', ['run', script, '--workspace=backend'], {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL },
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(
      `[e2e] "${script}" failed (exit ${result.status}). ` +
        `Is Postgres reachable at ${DATABASE_URL}?`
    );
  }
}

/**
 * Resets and re-seeds the database to a known baseline (default skills +
 * developers, no tasks), so runs are deterministic and repeatable regardless of
 * leftover data. `prisma migrate reset --force` drops + re-migrates but does NOT
 * run the seed in this project's config, so we seed explicitly afterwards.
 *
 * NOTE: `db:reset` is destructive; when run by an AI agent Prisma additionally
 * requires the `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` env var.
 */
function resetAndSeed() {
  console.log('[e2e] Resetting the database…');
  runBackendScript('db:reset');
  console.log('[e2e] Seeding the database…');
  runBackendScript('db:seed');
}

async function globalSetup(_config: FullConfig) {
  // 1. Wait for the containerized stack to be ready before doing anything.
  await waitForReady('frontend', BASE_URL);
  await waitForReady('backend (via /api proxy)', API_READY_URL);

  // 2. Reset + seed for a deterministic baseline (skippable for debugging).
  if (process.env.E2E_SKIP_SEED === '1') {
    console.log('[e2e] E2E_SKIP_SEED=1 set — skipping reset+seed.');
    return;
  }
  resetAndSeed();
}

export default globalSetup;
