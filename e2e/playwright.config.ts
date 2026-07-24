import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the task-management e2e suite.
 *
 * The suite targets the *containerized* build (Docker Compose serves the
 * frontend on :3000 and the backend on :6000). We deliberately do NOT use
 * Playwright's `webServer` to spawn dev servers — bringing the stack up and
 * tearing it down is done via repo-root npm scripts (`e2e:up` / `e2e:down`),
 * so "run against the containerized build" stays explicit.
 *
 * `globalSetup` waits for the stack to be ready and resets+seeds the database
 * to a known baseline before any test runs.
 */

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  // Tests share one seeded database, so run serially for determinism.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
