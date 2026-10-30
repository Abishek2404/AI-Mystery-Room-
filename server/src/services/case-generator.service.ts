import { generateText } from './gemini.service.js';
import { GeneratedMysterySchema, GeneratedMystery } from '../schemas/index.js';
import { DIFFICULTY_CONFIG, Difficulty } from '../config/index.js';

const MAX_RETRIES = 2;

function buildPrompt(premise: string, difficulty: Difficulty): string {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  return `You are a mystery writer AI. Generate a complete, self-contained fictional detective mystery as a JSON object.

REQUIREMENTS:
- Difficulty: ${difficulty}
- Suspects: exactly ${cfg.suspects}
- Clues: exactly ${cfg.clues}
- Hints: exactly ${cfg.hints}
- The mystery must be entirely fictional with fictional characters and settings
- Assign unique IDs: suspects use "suspect_1", "suspect_2" etc., clues use "clue_1" etc., hints use "hint_1" etc.
- Select exactly ONE culprit from the suspects
- All clues must logically support the one culprit
- Hints must be progressive and NOT directly name the culprit
- Alibis should be testable against evidence
- The solution explanation must link specific clues to the culprit's guilt
- Do NOT include any real-person allegations or real-world crime instructions

PLAYER PREMISE: "${premise}"

Return ONLY valid JSON matching this exact schema (no markdown fences, no extra text):
{
  "title": "string (mystery title)",
  "story": "string (case introduction, 150-400 words)",
  "difficulty": "${difficulty}",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "string",
      "description": "string (role/background)",
      "motive": "string (public-facing motive)",
      "alibi": "string (their claim, testable against clues)"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "string (short name)",
      "content": "string (evidence text revealed when discovered)",
      "location": "string (where found)",
      "relevance": "string (how it can be interpreted)"
    }
  ],
  "hints": [
    {
      "id": "hint_1",
      "content": "string (investigative nudge, never names culprit directly)"
    }
  ],
  "solution": {
    "culpritId": "suspect_X",
    "explanation": "string (evidence-based explanation linking key clues to culprit)",
    "keyClueIds": ["clue_X", "clue_Y"]
  }
}

Generate exactly ${cfg.suspects} suspects, ${cfg.clues} clues, and ${cfg.hints} hints. Return only the JSON object.`;
}

function validateGeneratedMystery(data: GeneratedMystery, difficulty: Difficulty): string[] {
  const errors: string[] = [];
  const cfg = DIFFICULTY_CONFIG[difficulty];

  if (data.suspects.length !== cfg.suspects) {
    errors.push(`Expected ${cfg.suspects} suspects, got ${data.suspects.length}`);
  }
  if (data.clues.length !== cfg.clues) {
    errors.push(`Expected ${cfg.clues} clues, got ${data.clues.length}`);
  }
  if (data.hints.length !== cfg.hints) {
    errors.push(`Expected ${cfg.hints} hints, got ${data.hints.length}`);
  }

  // Check ID uniqueness
  const suspectIds = data.suspects.map((s) => s.id);
  if (new Set(suspectIds).size !== suspectIds.length) {
    errors.push('Duplicate suspect IDs found');
  }
  const clueIds = data.clues.map((c) => c.id);
  if (new Set(clueIds).size !== clueIds.length) {
    errors.push('Duplicate clue IDs found');
  }
  const hintIds = data.hints.map((h) => h.id);
  if (new Set(hintIds).size !== hintIds.length) {
    errors.push('Duplicate hint IDs found');
  }

  // Validate culprit reference
  if (!suspectIds.includes(data.solution.culpritId)) {
    errors.push(`culpritId "${data.solution.culpritId}" does not reference an existing suspect`);
  }

  // Validate key clue references
  for (const keyClueId of data.solution.keyClueIds) {
    if (!clueIds.includes(keyClueId)) {
      errors.push(`Key clue "${keyClueId}" does not reference an existing clue`);
    }
  }

  // Check hints don't name the culprit
  const culprit = data.suspects.find((s) => s.id === data.solution.culpritId);
  if (culprit) {
    for (const hint of data.hints) {
      if (hint.content.toLowerCase().includes(culprit.name.toLowerCase())) {
        errors.push(`Hint "${hint.id}" directly names the culprit`);
      }
    }
  }

  return errors;
}

export async function generateMystery(premise: string, difficulty: Difficulty): Promise<GeneratedMystery> {
  const prompt = buildPrompt(premise, difficulty);
  let lastError: Error = new Error('Unknown generation error');

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await generateText(prompt);

      // Strip any accidental markdown fences
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      // Normalize difficulty to lowercase
      if (parsed.difficulty) {
        parsed.difficulty = parsed.difficulty.toLowerCase();
      }

      // Validate schema
      const result = GeneratedMysterySchema.safeParse(parsed);
      if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        lastError = new Error(`Schema validation failed: ${issues}`);
        console.warn(`[CaseGenerator] Attempt ${attempt + 1} schema error:`, lastError.message);
        continue;
      }

      // Validate semantic rules
      const semanticErrors = validateGeneratedMystery(result.data, difficulty);
      if (semanticErrors.length > 0) {
        lastError = new Error(`Semantic validation failed: ${semanticErrors.join('; ')}`);
        console.warn(`[CaseGenerator] Attempt ${attempt + 1} semantic error:`, lastError.message);
        continue;
      }

      return result.data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[CaseGenerator] Attempt ${attempt + 1} error:`, lastError.message);
    }
  }

  throw lastError;
}
