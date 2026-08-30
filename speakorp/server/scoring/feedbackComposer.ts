import {
  FeedbackMessage,
  SkillScore,
  Rubric,
  DayType,
} from '../../shared/types';
import { ServingHandle } from '../routes/context';

export interface ComposeInput {
  segmentRecordingId: string;
  transcript: string;
  skillScores: SkillScore[];
  rubrics: Rubric[];
  lessonTitle: string;
  dayType: DayType;
}

/**
 * Extracts a JSON array from text, handling markdown fences and bare arrays.
 * Returns null if no valid array is found.
 */
export function extractJsonArray(text: string): unknown[] | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Try to find fenced markdown block first
  const fencedMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonText = fencedMatch ? fencedMatch[1] : text;

  // Find the first '[' and last ']'
  const startIdx = jsonText.indexOf('[');
  const endIdx = jsonText.lastIndexOf(']');

  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
    return null;
  }

  const arrayStr = jsonText.substring(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(arrayStr);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // JSON parse failed
  }

  return null;
}

/** Trim `text` to at most `maxWords` words (adds an ellipsis when truncated). */
function limitWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text.trim() : words.slice(0, maxWords).join(' ') + '…';
}

/**
 * Generates a generic fallback feedback message for a skill when the LLM is unavailable.
 */
function generateFallbackMessage(
  segmentRecordingId: string,
  score: SkillScore,
  rubric: Rubric
): FeedbackMessage {
  const skillId = score.skillId;

  // Use the rubric's sampleFeedback first sentence as the summary (word-limited,
  // NOT char-sliced, so it never cuts mid-word), or generic text as a last resort.
  const firstSentence = rubric.sampleFeedback?.split('.')[0]?.trim();
  const summary =
    firstSentence && firstSentence.length > 0
      ? limitWords(firstSentence, 25)
      : 'Keep practicing this skill and reviewing the rubric.';

  const genericTips: Record<string, string> = {
    needs_work: 'Focus on this skill this week.',
    developing: 'Good progress—refine further.',
    strong: 'Excellent work on this skill.',
  };

  const specificTip = genericTips[score.band] || 'Keep practicing.';

  return {
    id: `fb_${segmentRecordingId}_${skillId}`,
    segmentRecordingId,
    skillId,
    summary,
    specificTip,
    timestampRef: null,
  };
}

/**
 * Composes feedback messages from a pre-computed score + rubric using an LLM,
 * with graceful fallback if the serving handle is null or the LLM call fails.
 */
export async function composeFeedback(
  serving: ServingHandle | null,
  input: ComposeInput
): Promise<FeedbackMessage[]> {
  const {
    segmentRecordingId,
    transcript,
    skillScores,
    rubrics,
    lessonTitle,
    dayType,
  } = input;

  // Build a map of skillId -> rubric for easy lookup
  const rubricMap = new Map<string, Rubric>(rubrics.map((r) => [r.skillId, r]));

  // If no serving or no scores, fall back immediately
  if (!serving || skillScores.length === 0) {
    return skillScores.map((score) => {
      const rubric = rubricMap.get(score.skillId);
      return generateFallbackMessage(
        segmentRecordingId,
        score,
        rubric || {
          skillId: score.skillId,
          inputs: 'unknown',
          metric: 'unknown',
          bands: 'unknown',
          sampleFeedback: `Good work on ${score.skillId}.`,
        }
      );
    });
  }

  // Build the user prompt with system instructions, lesson context, and skill data
  const skillDetails = skillScores
    .map((score) => {
      const rubric = rubricMap.get(score.skillId);
      if (!rubric) {
        return `- Skill: ${score.skillId} (score: ${score.score})\n  No rubric available.`;
      }
      return (
        `- Skill: ${score.skillId}\n` +
        `  Score: ${score.score}/100\n` +
        `  Band: ${score.band}\n` +
        `  Inputs needed: ${rubric.inputs}\n` +
        `  Metric: ${rubric.metric}\n` +
        `  Scoring bands: ${rubric.bands}\n` +
        `  Sample feedback tone: ${rubric.sampleFeedback}`
      );
    })
    .join('\n\n');

  const userPrompt = `You are a communication coach. You will assess the speaker's performance on the following skills.

Lesson: ${lessonTitle}
Day Type: ${dayType}

Transcript:
${transcript}

Skills to assess:
${skillDetails}

IMPORTANT CONSTRAINTS:
- Do NOT infer pitch, pace, or gesture from the text alone — use ONLY the provided measurements.
- Return ONLY valid JSON matching this schema, with no markdown fences or extra text:
  [{ "skillId": string, "score": number, "summary": string (≤25 words), "specificTip": string (≤25 words), "timestampRef": number|null }, ...]
- Keep tips concrete and specific to this recording.
- Reference a timestamp (in seconds) where possible, or use null.
- Return exactly one object per skill: ${skillScores.map((s) => `"${s.skillId}"`).join(', ')}.
${
  dayType === 'integration'
    ? '\n- For integration days, synthesize all scores but return one object per skill.'
    : ''
}

Return the JSON array now:`;

  try {
    const response = await serving.invoke({
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0, // schema-locked JSON: minimize non-conforming output
      max_tokens: 1024,
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in serving response');
    }

    // Extract and parse the JSON array
    const parsed = extractJsonArray(content);
    if (!parsed || parsed.length === 0) {
      throw new Error('Failed to extract valid JSON array');
    }

    // Map the parsed array to FeedbackMessage, keyed by skillId. Only accept
    // objects that name an input skill and carry non-empty summary AND tip; skip
    // duplicates (first valid one wins).
    const bySkill = new Map<string, FeedbackMessage>();
    for (const item of parsed) {
      const obj = item as Record<string, unknown>;
      const skillId = String(obj.skillId ?? '');
      const summary = String(obj.summary ?? '').trim();
      const specificTip = String(obj.specificTip ?? '').trim();
      const timestampRef =
        typeof obj.timestampRef === 'number' && obj.timestampRef >= 0
          ? obj.timestampRef
          : null;

      if (!skillScores.some((s) => s.skillId === skillId)) continue;
      if (!summary || !specificTip) continue;
      if (bySkill.has(skillId)) continue;

      bySkill.set(skillId, {
        id: `fb_${segmentRecordingId}_${skillId}`,
        segmentRecordingId,
        skillId,
        summary,
        specificTip,
        timestampRef,
      });
    }

    if (bySkill.size === 0) {
      throw new Error('No valid feedback messages extracted');
    }

    // Return exactly one message per scored skill: the LLM's where valid, a
    // deterministic fallback for any skill the model omitted or left empty.
    return skillScores.map(
      (score) =>
        bySkill.get(score.skillId) ??
        generateFallbackMessage(
          segmentRecordingId,
          score,
          rubricMap.get(score.skillId) ?? {
            skillId: score.skillId,
            inputs: 'unknown',
            metric: 'unknown',
            bands: 'unknown',
            sampleFeedback: `Good work on ${score.skillId}.`,
          }
        )
    );
  } catch {
    // Graceful fallback: return deterministic messages using rubric sampleFeedback
    return skillScores.map((score) => {
      const rubric = rubricMap.get(score.skillId);
      return generateFallbackMessage(
        segmentRecordingId,
        score,
        rubric || {
          skillId: score.skillId,
          inputs: 'unknown',
          metric: 'unknown',
          bands: 'unknown',
          sampleFeedback: `Good work on ${score.skillId}.`,
        }
      );
    });
  }
}
