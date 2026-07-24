import { test, expect } from '@playwright/test';
import { rowByTitle, statusSelect, uniqueTitle } from './helpers';

test('creates a single task through the UI and shows it in the list', async ({
  page,
}) => {
  const title = uniqueTitle('E2E single task');

  await page.goto('/tasks/new');
  await page.getByRole('textbox', { name: /Title/ }).first().fill(title);
  await page.getByRole('button', { name: 'Create task' }).click();

  // On success the app navigates to the task list.
  await page.waitForURL('**/tasks');

  const row = rowByTitle(page, title);
  await expect(row).toBeVisible();
  // New tasks start with the default "To do" status.
  await expect(statusSelect(page, title)).toHaveValue('TODO');
});
