import { expect, type Page, type Locator } from '@playwright/test';

/** A title unique to this run so tests don't collide on leftover/other rows. */
export function uniqueTitle(prefix: string): string {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return `${prefix} ${suffix}`;
}

/** The task list table (accessible name "Tasks"). */
export function taskTable(page: Page): Locator {
  return page.getByRole('table', { name: 'Tasks' });
}

/**
 * The row whose title cell (a row header) matches the given title.
 *
 * Defaults to an exact match: a subtask row's header includes its parent's
 * title (the "Subtask of …" hint), so a substring match on a parent title
 * would ambiguously also select the subtask row. Pass `{ exact: false }` to
 * match a subtask row by its own (substring) title.
 */
export function rowByTitle(
  page: Page,
  title: string,
  options: { exact?: boolean } = {}
): Locator {
  const exact = options.exact ?? true;
  return taskTable(page)
    .getByRole('row')
    .filter({
      has: page.getByRole('rowheader', { name: title, exact }),
    });
}

/** Per-row status control, addressed by the task title in its accessible name. */
export function statusSelect(page: Page, title: string): Locator {
  return page.getByRole('combobox', { name: `Status for "${title}"` });
}

/** Per-row assignee control, addressed by the task title in its accessible name. */
export function assigneeSelect(page: Page, title: string): Locator {
  return page.getByRole('combobox', { name: `Assignee for "${title}"` });
}

/**
 * Fills the root create-task block's title (and optional skills) and submits,
 * then waits for navigation back to the task list. Operates through the UI only.
 */
export async function createTaskViaUI(
  page: Page,
  title: string,
  options: { skills?: string[] } = {}
) {
  await page.goto('/tasks/new');
  // The root block's title is the first Title textbox on the page.
  await page.getByRole('textbox', { name: /Title/ }).first().fill(title);
  for (const skill of options.skills ?? []) {
    await page.getByRole('checkbox', { name: skill }).first().check();
  }
  await page.getByRole('button', { name: 'Create task' }).click();
  await page.waitForURL('**/tasks');
  await expect(rowByTitle(page, title)).toBeVisible();
}
