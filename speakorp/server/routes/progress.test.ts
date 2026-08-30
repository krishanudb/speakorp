import { describe, it, expect } from 'vitest';
import { computeProgress } from './progress';
import type { Session, SkillScore } from '../../shared/types';

describe('computeProgress', () => {
  it('aggregates scores from multiple segments in a session', () => {
    const sessions: Session[] = [
      {
        id: 'session_1',
        userId: 'user_1',
        lessonId: 1,
        startedAt: '2025-01-01',
        status: 'completed',
        completedAt: '2025-01-01T01:00:00Z',
      },
    ];

    const segmentsBySession = new Map<string, string[]>([
      ['session_1', ['segment_1', 'segment_2']],
    ]);

    const scoresBySegment = new Map<string, SkillScore[]>([
      [
        'segment_1',
        [
          {
            id: 'score_1',
            segmentRecordingId: 'segment_1',
            skillId: 'vocal.breath_support',
            score: 80,
            band: 'developing',
            rawFeatures: {},
          },
        ],
      ],
      [
        'segment_2',
        [
          {
            id: 'score_2',
            segmentRecordingId: 'segment_2',
            skillId: 'vocal.breath_support',
            score: 100,
            band: 'strong',
            rawFeatures: {},
          },
        ],
      ],
    ]);

    const result = computeProgress({
      userId: 'user_1',
      sessions,
      segmentsBySession,
      scoresBySegment,
      weekOf: (lessonId) => (lessonId <= 5 ? 1 : undefined),
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      userId: 'user_1',
      skillId: 'vocal.breath_support',
      weekNumber: 1,
      rollingScore: 90, // (80 + 100) / 2 = 90
    });
  });

  it('handles multiple skills in different weeks', () => {
    const sessions: Session[] = [
      {
        id: 'session_1',
        userId: 'user_1',
        lessonId: 1,
        startedAt: '2025-01-01',
        status: 'completed',
        completedAt: '2025-01-01T01:00:00Z',
      },
      {
        id: 'session_2',
        userId: 'user_1',
        lessonId: 6,
        startedAt: '2025-01-08',
        status: 'completed',
        completedAt: '2025-01-08T01:00:00Z',
      },
    ];

    const segmentsBySession = new Map<string, string[]>([
      ['session_1', ['segment_1']],
      ['session_2', ['segment_2']],
    ]);

    const scoresBySegment = new Map<string, SkillScore[]>([
      [
        'segment_1',
        [
          {
            id: 'score_1',
            segmentRecordingId: 'segment_1',
            skillId: 'vocal.breath_support',
            score: 75,
            band: 'developing',
            rawFeatures: {},
          },
        ],
      ],
      [
        'segment_2',
        [
          {
            id: 'score_2',
            segmentRecordingId: 'segment_2',
            skillId: 'presence.posture',
            score: 88,
            band: 'developing',
            rawFeatures: {},
          },
        ],
      ],
    ]);

    const result = computeProgress({
      userId: 'user_1',
      sessions,
      segmentsBySession,
      scoresBySegment,
      weekOf: (lessonId) => (lessonId <= 5 ? 1 : lessonId <= 10 ? 2 : undefined),
    });

    expect(result).toHaveLength(2);
    // Should be sorted by weekNumber, then skillId
    expect(result[0]).toEqual({
      userId: 'user_1',
      skillId: 'vocal.breath_support',
      weekNumber: 1,
      rollingScore: 75,
    });
    expect(result[1]).toEqual({
      userId: 'user_1',
      skillId: 'presence.posture',
      weekNumber: 2,
      rollingScore: 88,
    });
  });

  it('filters by skillId when provided', () => {
    const sessions: Session[] = [
      {
        id: 'session_1',
        userId: 'user_1',
        lessonId: 1,
        startedAt: '2025-01-01',
        status: 'completed',
        completedAt: '2025-01-01T01:00:00Z',
      },
    ];

    const segmentsBySession = new Map<string, string[]>([['session_1', ['segment_1']]]);

    const scoresBySegment = new Map<string, SkillScore[]>([
      [
        'segment_1',
        [
          {
            id: 'score_1',
            segmentRecordingId: 'segment_1',
            skillId: 'vocal.breath_support',
            score: 80,
            band: 'developing',
            rawFeatures: {},
          },
          {
            id: 'score_2',
            segmentRecordingId: 'segment_1',
            skillId: 'presence.posture',
            score: 90,
            band: 'developing',
            rawFeatures: {},
          },
        ],
      ],
    ]);

    const result = computeProgress({
      userId: 'user_1',
      sessions,
      segmentsBySession,
      scoresBySegment,
      weekOf: (lessonId) => (lessonId <= 5 ? 1 : undefined),
      skillId: 'vocal.breath_support',
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      userId: 'user_1',
      skillId: 'vocal.breath_support',
      weekNumber: 1,
      rollingScore: 80,
    });
  });

  it('rounds rolling scores correctly', () => {
    const sessions: Session[] = [
      {
        id: 'session_1',
        userId: 'user_1',
        lessonId: 1,
        startedAt: '2025-01-01',
        status: 'completed',
        completedAt: '2025-01-01T01:00:00Z',
      },
    ];

    const segmentsBySession = new Map<string, string[]>([['session_1', ['segment_1']]]);

    const scoresBySegment = new Map<string, SkillScore[]>([
      [
        'segment_1',
        [
          {
            id: 'score_1',
            segmentRecordingId: 'segment_1',
            skillId: 'vocal.breath_support',
            score: 70,
            band: 'developing',
            rawFeatures: {},
          },
          {
            id: 'score_2',
            segmentRecordingId: 'segment_1',
            skillId: 'vocal.breath_support',
            score: 80,
            band: 'developing',
            rawFeatures: {},
          },
          {
            id: 'score_3',
            segmentRecordingId: 'segment_1',
            skillId: 'vocal.breath_support',
            score: 85,
            band: 'strong',
            rawFeatures: {},
          },
        ],
      ],
    ]);

    const result = computeProgress({
      userId: 'user_1',
      sessions,
      segmentsBySession,
      scoresBySegment,
      weekOf: (lessonId) => (lessonId <= 5 ? 1 : undefined),
    });

    expect(result).toHaveLength(1);
    // (70 + 80 + 85) / 3 = 235 / 3 = 78.333... -> rounds to 78
    expect(result[0]).toEqual({
      userId: 'user_1',
      skillId: 'vocal.breath_support',
      weekNumber: 1,
      rollingScore: 78,
    });
  });

  it('handles empty sessions', () => {
    const result = computeProgress({
      userId: 'user_1',
      sessions: [],
      segmentsBySession: new Map(),
      scoresBySegment: new Map(),
      weekOf: () => 1,
    });

    expect(result).toEqual([]);
  });

  it('skips sessions with unknown lesson ids', () => {
    const sessions: Session[] = [
      {
        id: 'session_1',
        userId: 'user_1',
        lessonId: 999,
        startedAt: '2025-01-01',
        status: 'completed',
        completedAt: '2025-01-01T01:00:00Z',
      },
    ];

    const segmentsBySession = new Map<string, string[]>([['session_1', ['segment_1']]]);

    const scoresBySegment = new Map<string, SkillScore[]>([
      [
        'segment_1',
        [
          {
            id: 'score_1',
            segmentRecordingId: 'segment_1',
            skillId: 'vocal.breath_support',
            score: 80,
            band: 'developing',
            rawFeatures: {},
          },
        ],
      ],
    ]);

    const result = computeProgress({
      userId: 'user_1',
      sessions,
      segmentsBySession,
      scoresBySegment,
      weekOf: () => undefined, // Unknown lesson
    });

    expect(result).toEqual([]);
  });

  it('groups multiple segments and skills correctly', () => {
    const sessions: Session[] = [
      {
        id: 'session_1',
        userId: 'user_1',
        lessonId: 1,
        startedAt: '2025-01-01',
        status: 'completed',
        completedAt: '2025-01-01T01:00:00Z',
      },
    ];

    const segmentsBySession = new Map<string, string[]>([
      ['session_1', ['segment_1', 'segment_2', 'segment_3']],
    ]);

    const scoresBySegment = new Map<string, SkillScore[]>([
      [
        'segment_1',
        [
          {
            id: 'score_1',
            segmentRecordingId: 'segment_1',
            skillId: 'vocal.breath_support',
            score: 60,
            band: 'needs_work',
            rawFeatures: {},
          },
        ],
      ],
      [
        'segment_2',
        [
          {
            id: 'score_2',
            segmentRecordingId: 'segment_2',
            skillId: 'vocal.breath_support',
            score: 70,
            band: 'developing',
            rawFeatures: {},
          },
        ],
      ],
      [
        'segment_3',
        [
          {
            id: 'score_3',
            segmentRecordingId: 'segment_3',
            skillId: 'presence.posture',
            score: 85,
            band: 'strong',
            rawFeatures: {},
          },
        ],
      ],
    ]);

    const result = computeProgress({
      userId: 'user_1',
      sessions,
      segmentsBySession,
      scoresBySegment,
      weekOf: (lessonId) => (lessonId <= 5 ? 1 : undefined),
    });

    expect(result).toHaveLength(2);
    // Should be sorted by weekNumber (same), then skillId
    expect(result[0].skillId).toBe('presence.posture');
    expect(result[1].skillId).toBe('vocal.breath_support');
    expect(result[0].rollingScore).toBe(85);
    expect(result[1].rollingScore).toBe(65); // (60 + 70) / 2 = 65
  });
});
