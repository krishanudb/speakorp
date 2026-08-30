import { describe, it, expect } from 'vitest';
import {
  extractJsonArray,
  composeFeedback,
  ComposeInput,
} from './feedbackComposer';
import {
  SkillScore,
  Rubric,
  FeedbackMessage,
  ServingModelResponse,
} from '../../shared/types';
import { ServingHandle } from '../routes/context';

describe('extractJsonArray', () => {
  it('parses a fenced ```json [...] ``` block', () => {
    const text = '```json\n[{"id": "test", "value": 1}]\n```';
    const result = extractJsonArray(text);
    expect(result).toEqual([{ id: 'test', value: 1 }]);
  });

  it('parses a bare JSON array', () => {
    const text = '[{"id": "test", "value": 2}]';
    const result = extractJsonArray(text);
    expect(result).toEqual([{ id: 'test', value: 2 }]);
  });

  it('parses an array with extra text before and after', () => {
    const text =
      'Here is the array:\n[{"key": "value"}]\nDone with array.';
    const result = extractJsonArray(text);
    expect(result).toEqual([{ key: 'value' }]);
  });

  it('returns null for invalid JSON', () => {
    const text = '[{invalid json}]';
    const result = extractJsonArray(text);
    expect(result).toBeNull();
  });

  it('returns null for text with no array', () => {
    const text = 'No array here, just text.';
    const result = extractJsonArray(text);
    expect(result).toBeNull();
  });

  it('returns null for empty or null input', () => {
    expect(extractJsonArray('')).toBeNull();
    expect(extractJsonArray(null as any)).toBeNull();
  });

  it('handles nested structures', () => {
    const text = '[{"nested": {"a": 1, "b": 2}}]';
    const result = extractJsonArray(text);
    expect(result).toEqual([{ nested: { a: 1, b: 2 } }]);
  });
});

describe('composeFeedback', () => {
  const mockSkillScores: SkillScore[] = [
    {
      id: 'score_1',
      segmentRecordingId: 'rec_123',
      skillId: 'vocal.breath_support',
      rawFeatures: { pauseCount: 1, longestPause: 0.5 },
      score: 75,
      band: 'developing',
    },
    {
      id: 'score_2',
      segmentRecordingId: 'rec_123',
      skillId: 'presence.neutral_posture',
      rawFeatures: { shoulderVariance: 5, torsoSway: 0.3 },
      score: 85,
      band: 'strong',
    },
  ];

  const mockRubrics: Rubric[] = [
    {
      skillId: 'vocal.breath_support',
      inputs: 'word-timestamps, pause list',
      metric: 'syllables-per-breath-group',
      bands: '90–100 = full target sentence in one breath group',
      sampleFeedback:
        'You took a breath mid-sentence — try starting with a fuller inhale.',
    },
    {
      skillId: 'presence.neutral_posture',
      inputs: 'pose landmarks',
      metric: 'shoulder-level variance',
      bands: '90–100 = minimal sway, level shoulders',
      sampleFeedback: 'Solid stillness in the first half.',
    },
  ];

  const mockInput: ComposeInput = {
    segmentRecordingId: 'rec_123',
    transcript: 'Hello, I want to discuss the project update.',
    skillScores: mockSkillScores,
    rubrics: mockRubrics,
    lessonTitle: 'Lesson 1: Breath Support',
    dayType: 'isolated',
  };

  it('returns fallback messages when serving is null', async () => {
    const result = await composeFeedback(null, mockInput);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'fb_rec_123_vocal.breath_support',
      segmentRecordingId: 'rec_123',
      skillId: 'vocal.breath_support',
      timestampRef: null,
    });
    expect(result[0].summary).toBeTruthy();
    expect(result[0].specificTip).toBeTruthy();

    expect(result[1]).toMatchObject({
      id: 'fb_rec_123_presence.neutral_posture',
      segmentRecordingId: 'rec_123',
      skillId: 'presence.neutral_posture',
      timestampRef: null,
    });
  });

  it('returns fallback messages when skillScores is empty', async () => {
    const input = { ...mockInput, skillScores: [] };
    const result = await composeFeedback(null, input);
    expect(result).toHaveLength(0);
  });

  it('calls serving and returns parsed LLM feedback', async () => {
    const fakeServing: ServingHandle = {
      invoke: async (): Promise<ServingModelResponse> => {
        return {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    skillId: 'vocal.breath_support',
                    score: 75,
                    summary: 'Good breath control, one mid-sentence pause.',
                    specificTip: 'Try fuller inhale before speaking.',
                    timestampRef: 7,
                  },
                  {
                    skillId: 'presence.neutral_posture',
                    score: 85,
                    summary: 'Excellent posture throughout.',
                    specificTip: 'Maintain this composure.',
                    timestampRef: null,
                  },
                ]),
              },
            },
          ],
        };
      },
    };

    const result = await composeFeedback(fakeServing, mockInput);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'fb_rec_123_vocal.breath_support',
      skillId: 'vocal.breath_support',
      summary: 'Good breath control, one mid-sentence pause.',
      specificTip: 'Try fuller inhale before speaking.',
      timestampRef: 7,
    });
    expect(result[1]).toMatchObject({
      id: 'fb_rec_123_presence.neutral_posture',
      skillId: 'presence.neutral_posture',
      summary: 'Excellent posture throughout.',
      specificTip: 'Maintain this composure.',
      timestampRef: null,
    });
  });

  it('handles fenced JSON from serving', async () => {
    const fakeServing: ServingHandle = {
      invoke: async (): Promise<ServingModelResponse> => {
        return {
          choices: [
            {
              message: {
                content: `Here is the feedback:\n\`\`\`json\n[{"skillId":"vocal.breath_support","score":75,"summary":"Great breath control.","specificTip":"Work on pausing.","timestampRef":null}]\n\`\`\``,
              },
            },
          ],
        };
      },
    };

    const result = await composeFeedback(fakeServing, mockInput);
    expect(result.length).toBeGreaterThan(0);
  });

  it('falls back gracefully when serving rejects', async () => {
    const throwingServing: ServingHandle = {
      invoke: async (): Promise<ServingModelResponse> => {
        throw new Error('Serving error');
      },
    };

    const result = await composeFeedback(throwingServing, mockInput);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'fb_rec_123_vocal.breath_support',
      skillId: 'vocal.breath_support',
      timestampRef: null,
    });
    expect(result[0].summary).toBeTruthy();
  });

  it('falls back when serving response is empty', async () => {
    const emptyServing: ServingHandle = {
      invoke: async (): Promise<ServingModelResponse> => {
        return { choices: [] };
      },
    };

    const result = await composeFeedback(emptyServing, mockInput);
    expect(result).toHaveLength(2);
    expect(result.every((m) => m.timestampRef === null)).toBe(true);
  });

  it('falls back when JSON parsing fails', async () => {
    const invalidJsonServing: ServingHandle = {
      invoke: async (): Promise<ServingModelResponse> => {
        return {
          choices: [
            {
              message: {
                content: 'This is not JSON at all',
              },
            },
          ],
        };
      },
    };

    const result = await composeFeedback(invalidJsonServing, mockInput);
    expect(result).toHaveLength(2);
  });

  it('ignores skillIds not in the input', async () => {
    const fakeServing: ServingHandle = {
      invoke: async (): Promise<ServingModelResponse> => {
        return {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    skillId: 'vocal.breath_support',
                    score: 75,
                    summary: 'Good',
                    specificTip: 'Try harder.',
                    timestampRef: null,
                  },
                  {
                    skillId: 'unknown.skill',
                    score: 50,
                    summary: 'This skill was not in the input.',
                    specificTip: 'Ignore me.',
                    timestampRef: null,
                  },
                ]),
              },
            },
          ],
        };
      },
    };

    const result = await composeFeedback(fakeServing, mockInput);
    // Only the valid skill should be included
    expect(result.some((m) => m.skillId === 'vocal.breath_support')).toBe(
      true
    );
    expect(result.some((m) => m.skillId === 'unknown.skill')).toBe(false);
  });

  it('generates deterministic fallback with band-specific tips', async () => {
    const scoreLow: SkillScore = {
      id: 'score_low',
      segmentRecordingId: 'rec_456',
      skillId: 'vocal.pace_control',
      rawFeatures: {},
      score: 45,
      band: 'needs_work',
    };

    const rubricLow: Rubric = {
      skillId: 'vocal.pace_control',
      inputs: 'word-timestamps',
      metric: 'words-per-minute variance',
      bands: '<60 = flat pace throughout',
      sampleFeedback: 'Add more pace variation to your delivery.',
    };

    const input: ComposeInput = {
      segmentRecordingId: 'rec_456',
      transcript: 'Fast fast fast slow slow slow.',
      skillScores: [scoreLow],
      rubrics: [rubricLow],
      lessonTitle: 'Pace Control',
      dayType: 'isolated',
    };

    const result = await composeFeedback(null, input);

    expect(result).toHaveLength(1);
    expect(result[0].skillId).toBe('vocal.pace_control');
    expect(result[0].specificTip).toContain('Focus on this skill');
  });

  it('never throws, always returns an array', async () => {
    const impossibleServing: ServingHandle = {
      invoke: async (): Promise<ServingModelResponse> => {
        throw new Error('Critical failure');
      },
    };

    const result = await composeFeedback(impossibleServing, mockInput);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
