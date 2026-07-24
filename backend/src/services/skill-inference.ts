import { GoogleGenAI, Type } from '@google/genai';

type SkillRef = { id: string; name: string };

// `undefined` = not yet initialized, `null` = no API key (feature disabled).
let client: GoogleGenAI | null | undefined;

function getClient(): GoogleGenAI | null {
  if (client === undefined) {
    const apiKey = process.env.GEMINI_API_KEY;
    client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }
  return client;
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

/**
 * Infers which of the given skills a task requires, from its title alone, using
 * the Gemini API. Output is constrained to the provided skills: returned names
 * are mapped back to ids case-insensitively and anything not in the set is
 * dropped, so no skill outside the table can be linked. Returns `[]` when the
 * feature is unconfigured (no `GEMINI_API_KEY`) or there are no skills to choose
 * from. Network/API errors propagate to the caller (which treats them as `[]`).
 */
export async function inferSkillIds(
  title: string,
  skills: SkillRef[],
): Promise<string[]> {
  const ai = getClient();
  if (!ai || skills.length === 0) return [];

  const skillNames = skills.map((s) => s.name);
  const prompt = [
    'You assign required skills to a single software task based only on its title.',
    `Task title: "${title}"`,
    `Available skills: ${skillNames.join(', ')}`,
    'Return a JSON array of the skills from the available list that this task requires.',
    'Only use skills from that list. If none clearly apply, return an empty array.',
  ].join('\n');

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  });

  const text = response.text;
  if (!text) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const idByName = new Map(skills.map((s) => [s.name.toLowerCase(), s.id]));
  const ids = new Set<string>();
  for (const name of parsed) {
    if (typeof name === 'string') {
      const id = idByName.get(name.trim().toLowerCase());
      if (id) ids.add(id);
    }
  }
  return [...ids];
}
