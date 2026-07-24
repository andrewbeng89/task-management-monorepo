import { test, expect } from '@playwright/test';
import { rowByTitle, taskTable, uniqueTitle } from './helpers';

test('creates a nested subtask tree and renders the subtask beneath its parent', async ({
  page,
}) => {
  const parentTitle = uniqueTitle('E2E parent');
  const subtaskTitle = uniqueTitle('E2E subtask');

  await page.goto('/tasks/new');

  const titles = page.getByRole('textbox', { name: /Title/ });
  await titles.first().fill(parentTitle);

  // Add a nested subtask block and fill its title (second Title field on the page).
  await page.getByRole('button', { name: 'Add subtask' }).first().click();
  await titles.nth(1).fill(subtaskTitle);

  await page.getByRole('button', { name: 'Create task' }).click();
  await page.waitForURL('**/tasks');

  // Both rows exist. The parent matches exactly; the subtask row's header also
  // contains the parent title (the "Subtask of …" hint), so match it by its own
  // title as a substring.
  await expect(rowByTitle(page, parentTitle)).toBeVisible();
  const subtaskRow = rowByTitle(page, subtaskTitle, { exact: false });
  await expect(subtaskRow).toBeVisible();

  // The subtask's parent relationship is conveyed accessibly (not by indentation
  // alone): its row header names it as a subtask of the parent.
  await expect(
    subtaskRow.getByRole('rowheader', {
      name: new RegExp(`Subtask of .*${parentTitle}`),
    })
  ).toBeVisible();

  // The subtask row appears *after* (beneath) its parent row in the table.
  const rowHeaders = await taskTable(page)
    .getByRole('rowheader')
    .allTextContents();
  const parentIndex = rowHeaders.findIndex((t) => t.includes(parentTitle));
  const subtaskIndex = rowHeaders.findIndex((t) => t.includes(subtaskTitle));
  expect(parentIndex).toBeGreaterThanOrEqual(0);
  expect(subtaskIndex).toBeGreaterThan(parentIndex);
});
