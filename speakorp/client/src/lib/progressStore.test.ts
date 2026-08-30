import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  recordCompletion,
  getEntries,
  getCompletedLessonIds,
  rollingByWeek,
  type ProgressEntry,
} from './progressStore';

/**
 * Mock localStorage using a Map, replacing globalThis.localStorage for the test.
 */
function createMockStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe('progressStore', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    vi.stubGlobal('localStorage', mockStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('recordCompletion and getEntries', () => {
    it('records a completion and retrieves it', () => {
      const entry: ProgressEntry = {
        lessonId: 1,
        week: 1,
        completedAt: '2024-01-15T10:00:00Z',
        scores: [
          { skillId: 'vocal.breath', score: 75 },
          { skillId: 'presence.posture', score: 80 },
        ],
      };

      recordCompletion(entry);
      const entries = getEntries();

      expect(entries).toHaveLength(1);
      expect(entries[0]).toEqual(entry);
    });

    it('appends multiple completions', () => {
      const entry1: ProgressEntry = {
        lessonId: 1,
        week: 1,
        completedAt: '2024-01-15T10:00:00Z',
        scores: [{ skillId: 'vocal.breath', score: 75 }],
      };
      const entry2: ProgressEntry = {
        lessonId: 2,
        week: 1,
        completedAt: '2024-01-16T10:00:00Z',
        scores: [{ skillId: 'vocal.breath', score: 80 }],
      };

      recordCompletion(entry1);
      recordCompletion(entry2);
      const entries = getEntries();

      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual(entry1);
      expect(entries[1]).toEqual(entry2);
    });

    it('returns empty array when storage is empty', () => {
      const entries = getEntries();
      expect(entries).toEqual([]);
    });

    it('returns empty array when JSON is corrupted', () => {
      mockStorage.setItem('speakorp.progress', 'invalid json {');
      const entries = getEntries();
      expect(entries).toEqual([]);
    });

    it('returns empty array when storage contains non-array', () => {
      mockStorage.setItem('speakorp.progress', JSON.stringify({ foo: 'bar' }));
      const entries = getEntries();
      expect(entries).toEqual([]);
    });
  });

  describe('getCompletedLessonIds', () => {
    it('returns unique lesson IDs', () => {
      recordCompletion({
        lessonId: 1,
        week: 1,
        completedAt: '2024-01-15T10:00:00Z',
        scores: [{ skillId: 'vocal.breath', score: 75 }],
      });
      recordCompletion({
        lessonId: 2,
        week: 1,
        completedAt: '2024-01-16T10:00:00Z',
        scores: [{ skillId: 'vocal.breath', score: 80 }],
      });
      recordCompletion({
        lessonId: 1,
        week: 2,
        completedAt: '2024-01-22T10:00:00Z',
        scores: [{ skillId: 'vocal.breath', score: 85 }],
      });

      const ids = getCompletedLessonIds();
      expect(ids).toHaveLength(2);
      expect(ids.sort()).toEqual([1, 2]);
    });

    it('returns empty array when no entries exist', () => {
      const ids = getCompletedLessonIds();
      expect(ids).toEqual([]);
    });
  });

  describe('rollingByWeek', () => {
    it('computes rolling average per week and skill', () => {
      const entries: ProgressEntry[] = [
        {
          lessonId: 1,
          week: 1,
          completedAt: '2024-01-15T10:00:00Z',
          scores: [
            { skillId: 'vocal.breath', score: 60 },
            { skillId: 'presence.posture', score: 70 },
          ],
        },
        {
          lessonId: 2,
          week: 1,
          completedAt: '2024-01-16T10:00:00Z',
          scores: [
            { skillId: 'vocal.breath', score: 80 },
            { skillId: 'presence.posture', score: 90 },
          ],
        },
        {
          lessonId: 3,
          week: 2,
          completedAt: '2024-01-22T10:00:00Z',
          scores: [{ skillId: 'vocal.breath', score: 100 }],
        },
      ];

      const rolling = rollingByWeek(entries);

      // Week 1: vocal.breath (60+80)/2 = 70, presence.posture (70+90)/2 = 80
      // Week 2: vocal.breath = 100
      expect(rolling).toEqual([
        { week: 1, skillId: 'presence.posture', rollingScore: 80 },
        { week: 1, skillId: 'vocal.breath', rollingScore: 70 },
        { week: 2, skillId: 'vocal.breath', rollingScore: 100 },
      ]);
    });

    it('sorts by week then skillId', () => {
      const entries: ProgressEntry[] = [
        {
          lessonId: 1,
          week: 2,
          completedAt: '2024-01-22T10:00:00Z',
          scores: [{ skillId: 'vocal.breath', score: 75 }],
        },
        {
          lessonId: 2,
          week: 1,
          completedAt: '2024-01-15T10:00:00Z',
          scores: [{ skillId: 'presence.posture', score: 80 }],
        },
        {
          lessonId: 3,
          week: 1,
          completedAt: '2024-01-16T10:00:00Z',
          scores: [{ skillId: 'vocal.breath', score: 85 }],
        },
      ];

      const rolling = rollingByWeek(entries);

      // Should sort: week 1 (presence, vocal), then week 2 (vocal)
      expect(rolling.map((r) => `w${r.week}:${r.skillId}`)).toEqual([
        'w1:presence.posture',
        'w1:vocal.breath',
        'w2:vocal.breath',
      ]);
    });

    it('returns empty array for empty input', () => {
      const rolling = rollingByWeek([]);
      expect(rolling).toEqual([]);
    });
  });

  describe('robustness to localStorage unavailability', () => {
    it('handles localStorage.getItem throwing', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => {
          throw new Error('Storage unavailable');
        },
        setItem: () => {
          throw new Error('Storage unavailable');
        },
      });

      const entries = getEntries();
      expect(entries).toEqual([]);
    });

    it('handles recordCompletion when setItem throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => {
          throw new Error('Storage unavailable');
        },
      });

      // Should not throw
      expect(() => {
        recordCompletion({
          lessonId: 1,
          week: 1,
          completedAt: '2024-01-15T10:00:00Z',
          scores: [],
        });
      }).not.toThrow();
    });
  });
});
