import { test, expect } from '@playwright/test';
import { taskTable } from './helpers';

/**
 * Runs first (numeric prefix) against the freshly reset+seeded database, so the
 * task list is expected to be empty (seeding creates skills + developers, no tasks).
 */
test.describe('Task list page', () => {
  test('redirects root to /tasks and renders the app layout', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/tasks$/);

    // Layout landmarks from the shared AppLayout.
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Primary' })
    ).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();

    // Exactly one descriptive page heading.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Tasks' })
    ).toBeVisible();
  });

  test('shows the empty state and a link to create a task when seeded', async ({
    page,
  }) => {
    await page.goto('/tasks');

    await expect(page.getByText('No tasks yet.')).toBeVisible();
    // No data table is rendered in the empty state.
    await expect(taskTable(page)).toHaveCount(0);
    // The create-task entry point is present.
    await expect(
      page.getByRole('link', { name: 'New task' }).first()
    ).toBeVisible();
  });
});
