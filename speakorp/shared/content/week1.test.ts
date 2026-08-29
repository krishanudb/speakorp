import { describe, expect, it } from 'vitest';
import { WEEK1_LESSONS } from './week1';

describe('WEEK1_LESSONS', () => {
  it('exports exactly 5 lessons', () => {
    expect(WEEK1_LESSONS).toHaveLength(5);
  });

  it('has lesson IDs 1 through 5', () => {
    expect(WEEK1_LESSONS.map((l) => l.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it('lesson 5 is an integration day with isBaselineRecording true', () => {
    const lesson5 = WEEK1_LESSONS[4];
    expect(lesson5.dayType).toBe('integration');
    expect(lesson5.isBaselineRecording).toBe(true);
  });

  it('all lessons have non-empty appliedScenario', () => {
    WEEK1_LESSONS.forEach((lesson) => {
      expect(lesson.appliedScenario).toBeTruthy();
      expect(lesson.appliedScenario.length).toBeGreaterThan(0);
    });
  });
});
