import { describe, it, expect } from 'vitest';
import type { Lesson } from '../../shared/types';
import { buildSegments } from './sessions';

describe('buildSegments', () => {
  const fakeLessonId = 1;

  // Create a minimal fake Lesson object for testing
  const createFakeLesson = (overrides?: Partial<Lesson>): Lesson => ({
    id: fakeLessonId,
    week: 1,
    day: 1,
    title: 'Test Lesson',
    dayType: 'isolated',
    skillIds: ['vocal.breath_support', 'presence.posture'],
    warmupCodes: ['W1', 'W2'],
    concept: 'Test concept',
    drills: ['drill1', 'drill2'],
    appliedScenario: 'Test scenario script',
    fullyScored: false,
    requiresVideo: false,
    ...overrides,
  });

  it('should return both warmup and scenario segments', () => {
    const lesson = createFakeLesson();
    const sessionId = 'test_session_123';

    const { specs, placeholders } = buildSegments(lesson, sessionId);

    expect(specs).toHaveLength(2);
    expect(placeholders).toHaveLength(2);
  });

  it('should create warmup segment with correct properties', () => {
    const lesson = createFakeLesson();
    const sessionId = 'test_session_123';

    const { specs } = buildSegments(lesson, sessionId);
    const warmupSpec = specs[0];

    expect(warmupSpec.type).toBe('warmup');
    expect(warmupSpec.skillIds).toEqual([]);
    expect(warmupSpec.timerSeconds).toBe(300);
    expect(warmupSpec.instructions).toBeTruthy();
    expect(warmupSpec.segmentId).toBeTruthy();
  });

  it('should create scenario segment with lesson skillIds', () => {
    const lesson = createFakeLesson({
      skillIds: ['vocal.breath_support', 'presence.posture', 'storytelling.pacing'],
    });
    const sessionId = 'test_session_123';

    const { specs } = buildSegments(lesson, sessionId);
    const scenarioSpec = specs[1];

    expect(scenarioSpec.type).toBe('scenario');
    expect(scenarioSpec.skillIds).toEqual([
      'vocal.breath_support',
      'presence.posture',
      'storytelling.pacing',
    ]);
    expect(scenarioSpec.instructions).toBe(lesson.appliedScenario);
    expect(scenarioSpec.timerSeconds).toBe(90);
  });

  it('should create one placeholder per spec', () => {
    const lesson = createFakeLesson();
    const sessionId = 'test_session_123';

    const { specs, placeholders } = buildSegments(lesson, sessionId);

    expect(placeholders).toHaveLength(specs.length);
    placeholders.forEach((placeholder) => {
      expect(placeholder.sessionId).toBe(sessionId);
      expect(placeholder.mediaUrl).toBe('');
      expect(placeholder.hasVideo).toBe(false);
      expect(placeholder.transcript).toBe('');
      expect(placeholder.durationSec).toBe(0);
    });
  });

  it('should match placeholder ids with spec segment ids', () => {
    const lesson = createFakeLesson();
    const sessionId = 'test_session_123';

    const { specs, placeholders } = buildSegments(lesson, sessionId);

    specs.forEach((spec, index) => {
      expect(placeholders[index].id).toBe(spec.segmentId);
      expect(placeholders[index].segmentType).toBe(spec.type);
      expect(placeholders[index].skillIds).toEqual(spec.skillIds);
    });
  });

  it('should have unique segment ids', () => {
    const lesson = createFakeLesson();
    const sessionId = 'test_session_123';

    const { specs: specs1 } = buildSegments(lesson, sessionId);
    const { specs: specs2 } = buildSegments(lesson, sessionId);

    const allIds = [
      ...specs1.map((s) => s.segmentId),
      ...specs2.map((s) => s.segmentId),
    ];
    const uniqueIds = new Set(allIds);

    expect(uniqueIds.size).toBe(allIds.length);
  });
});
