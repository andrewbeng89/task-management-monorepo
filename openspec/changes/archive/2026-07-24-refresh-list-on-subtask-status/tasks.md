## 1. Refresh on subtask status update

- [x] 1.1 In `frontend/src/pages/TaskListPage.tsx`, add a `refreshTasks()` helper that re-fetches `listTasks()` and, on success, replaces `load.tasks` in place (stay in `loaded` — do not flip to the `loading` state); guard against updates after unmount
- [x] 1.2 In `handleStatusChange`, after a successful status update on a task with a `parentId`, call `refreshTasks()` (keep the existing `replaceTask` + announcement for immediate feedback)
- [x] 1.3 Leave root-task status changes and all assignee changes on the existing in-row update (no refresh); on a refresh failure, keep the already-updated state without a blocking error

## 2. Verification

- [x] 2.1 Run frontend `npm run build` and `npm run lint`
- [x] 2.2 With backend + DB running, seed a parent with one unfinished subtask; from the list, set the subtask to "Done" and confirm the parent's "Done" option becomes enabled without a manual reload
- [x] 2.3 Verify a multi-level case: completing the last subtask of a mid-tree parent enables that parent's "Done"; completing it then enables the grandparent's (each after its subtask update)
- [x] 2.4 Confirm root-task status changes and assignee changes still update in place and behave as before; accessibility announcements still fire; run a Lighthouse/axe check on `/tasks`
