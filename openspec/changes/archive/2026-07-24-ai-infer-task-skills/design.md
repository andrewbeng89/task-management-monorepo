## Context

`createTask` (`backend/src/services/tasks.ts`) currently links `requiredSkillIds` when provided and otherwise creates a task with no skills. The subtask-tree creation form calls `createTask` once per node. `@google/genai` (v2.13) is already a dependency but unused; `GEMINI_API_KEY` is already in `.env.example`; the backend loads env via `dotenv/config`. Skills live in the `skills` table (`{ id, name }`), listed by `listSkills()`.

## Goals / Non-Goals

**Goals:**
- When a task is created without skills, infer required skills from its title via Gemini, constrained to existing skills, and link them.
- Apply to all tasks (root and subtasks); each task's skills come from **its own title only**.
- Keep task creation robust: inference is best-effort and never blocks or fails creation.
- Backend-only; no API contract or frontend change.
- Configurable (API key + model) and easy to disable (no key → off).

**Non-Goals:**
- No re-inference on update, no UI for "suggested skills", no caching of inferences.
- No new skills are created — inference only selects from existing ones.
- No cross-task/tree aggregation — a parent's skills are never derived from its subtasks' titles, and no single call covers multiple nodes.

## Decisions

### A dedicated, self-contained inference service
Add `backend/src/services/skill-inference.ts` exporting `inferSkillIds(title, skills): Promise<string[]>`. It builds a lazily-initialized `GoogleGenAI` client from `GEMINI_API_KEY`, prompts the model with the task title and the list of available skill **names**, and returns the matching skill **ids**. Keeping it isolated makes `createTask` easy to read and the whole feature easy to disable/mock.

### Infer from the task's own title only
The prompt contains exactly one task title (the node being created) and the allowed skill names. Because `createTask` runs per node, each task — root or subtask — is inferred independently from its own title; there is no aggregation of a task's skills from its subtasks. This matches the create flow (subtasks are created after their parent, each via its own `createTask` call).

### Constrain output with structured JSON, then validate against the table
Call `ai.models.generateContent` with `config.responseMimeType = 'application/json'` and a `responseSchema` of "array of strings" (skill names). The prompt lists the allowed skill names and instructs the model to return only names from that list that the task requires (possibly an empty array). Regardless of the model's output, the service maps returned names to ids **case-insensitively against the fetched skills and drops anything not found** — so hallucinated or misspelled skills can never be linked. This defense-in-depth keeps the DB write safe even if the model ignores instructions.

### Model is configurable; default to a free-tier flash model
Read `GEMINI_MODEL` (default `gemini-3.5-flash`) so the model can be swapped without code changes and to stay on the free tier. The API key is read once; if absent, `inferSkillIds` short-circuits to `[]` (feature off).

### `createTask` integration — best-effort, synchronous
In `createTask`, when `input.requiredSkillIds` is empty/undefined:
1. `listSkills()`; if empty, skip (no skills to choose from).
2. `try { ids = await inferSkillIds(title, skills) } catch { ids = [] }` — swallow all errors and log a warning; never rethrow.
3. Create the task linking `ids` (validated subset). If `ids` is empty, behavior equals today.

Inference runs synchronously so the returned task already reflects the inferred skills (the frontend shows them immediately). The added latency is one model call; acceptable for the MVP.

*Alternatives considered:* (a) infer asynchronously after responding — rejected; the created task would momentarily lack skills and the frontend would need a refetch. (b) do inference in the route layer — rejected; `createTask` is the single choke point used by both direct creation and the subtask tree.

### Existing validation still applies
Provided `requiredSkillIds` continue through `assertReferencesExist` (unknown ids → 400). Inferred ids are drawn from the table itself, so they are valid by construction and bypass that error path.

## Risks / Trade-offs

- **Free-tier rate limits, especially for subtask trees** (N nodes → N independent calls) → best-effort fallback means a rate-limited call just yields no skills; task creation still succeeds. Documented; a future optimization could relax per-node calls.
- **Added latency on create** (one network round-trip) → acceptable for MVP; only when skills are omitted.
- **Non-determinism / wrong guesses** → users can still set skills explicitly (which disables inference); inference only fills an otherwise-empty field. Output is constrained to real skills.
- **Cost/PII** → only the task title and skill names are sent to Gemini; no other data. Documented.
- **Secret handling** → `GEMINI_API_KEY` stays server-side (backend env); never exposed to the frontend.

## Migration Plan

Additive and behind an env key. With no `GEMINI_API_KEY`, behavior is identical to today. Deploy with the key set to enable; unset to disable. Rollback = revert the commit.

## Open Questions

- None blocking. (Confirmed: inference applies to all tasks, each from its own title.)
