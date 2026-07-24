import { test, expect } from '@playwright/test';
import { createTaskViaUI, statusSelect, uniqueTitle } from './helpers';

test('updates a task status through the UI and reflects the new label', async ({
  page,
}) => {
  const title = uniqueTitle('E2E status task');
  await createTaskViaUI(page, title);

  const status = statusSelect(page, title);
  await expect(status).toHaveValue('TODO');

  // Change via the human-readable label shown in the control.
  await status.selectOption({ label: 'In progress' });

  await expect(status).toHaveValue('IN_PROGRESS');
  // The selected option shows the human-readable label.
  await expect(status.locator('option:checked')).toHaveText('In progress');
});
