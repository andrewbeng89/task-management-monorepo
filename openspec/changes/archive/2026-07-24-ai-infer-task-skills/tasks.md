## 1. Skill-inference service

- [x] 1.1 Add `backend/src/services/skill-inference.ts` exporting `inferSkillIds(title: string, skills: { id: string; name: string }[]): Promise<string[]>`
- [x] 1.2 Lazily construct a `GoogleGenAI` client from `GEMINI_API_KEY`; if the key is absent, return `[]` (feature disabled) without calling the API
- [x] 1.3 Call `ai.models.generateContent` with the configured model (`GEMINI_MODEL`, default `gemini-3.5-flash`), a prompt containing the single task title + the allowed skill names, and `config` requesting JSON output (`responseMimeType: 'application/json'` + an array-of-strings `responseSchema`)
- [x] 1.4 Parse the returned names and map them to skill ids **case-insensitively against `skills`**, dropping any name not present; return the resulting id list (deduplicated)

## 2. Wire into createTask

- [x] 2.1 In `backend/src/services/tasks.ts` `createTask`, when `input.requiredSkillIds` is empty/undefined: `listSkills()`; if non-empty, call `inferSkillIds(input.title, skills)` inside a `try/catch` that falls back to `[]` on any error (log a warning), then link the resulting ids
- [x] 2.2 Leave the provided-`requiredSkillIds` path unchanged (no inference; existing `assertReferencesExist` validation still applies)
- [x] 2.3 Confirm inference runs per task node (root and subtasks) via each `createTask` call, each using only that node's own title

## 3. Config & documentation

- [x] 3.1 Ensure `GEMINI_API_KEY` (present) and `GEMINI_MODEL` (new, optional) are documented in `.env.example` with a brief comment
- [x] 3.2 Update `backend/README.md` to describe AI skill inference on task creation (when it runs, that it's best-effort, and the env vars)
- [x] 3.3 Update root `README.md` (Tech stack note for Gemini usage + an architectural-decisions bullet) so the docs reflect the feature

## 4. Verification

- [x] 4.1 Run backend `npm run build` and resolve type errors
- [x] 4.2 Fallback (no key): with `GEMINI_API_KEY` unset, create a task without skills and confirm it returns `201` with no required skills (creation never fails)
- [x] 4.3 Provided skills: create a task with explicit `requiredSkillIds` and confirm those exact skills are linked and no inference occurs
- [x] 4.4 Inference (if a free-tier key is available): with `GEMINI_API_KEY` set and skills seeded (e.g. Frontend, Backend), create a task titled like "Build the React homepage UI" without skills and confirm a sensible skill (e.g. Frontend) is inferred and linked, chosen only from existing skills; note in the report if this step was skipped due to no key
- [x] 4.5 Confirm a returned/inferred skill set only ever contains ids that exist in the `skills` table (no hallucinated skills persisted)
