import { test, expect } from '@playwright/test';
import { assigneeSelect, createTaskViaUI, uniqueTitle } from './helpers';

test('assigns a developer through the UI and reflects the assignee', async ({
  page,
}) => {
  // Give the task the seeded "Frontend" skill so it has candidate developers
  // (Alice and Carol both hold Frontend).
  const title = uniqueTitle('E2E assign task');
  await createTaskViaUI(page, title, { skills: ['Frontend'] });

  const assignee = assigneeSelect(page, title);

  // Candidates load lazily when the control is focused.
  await assignee.focus();
  const option = assignee.getByRole('option', { name: 'Alice' });
  await option.waitFor({ state: 'attached' });

  await assignee.selectOption({ label: 'Alice' });

  await expect(assignee.locator('option:checked')).toHaveText('Alice');
});
