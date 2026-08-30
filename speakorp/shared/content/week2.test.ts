import { describe, expect, it } from 'vitest';
import { WEEK2_LESSONS } from './week2';

describe('WEEK2_LESSONS', () => {
  it('exports exactly 5 lessons', () => {
    expect(WEEK2_LESSONS).toHaveLength(5);
  });

  it('has lesson IDs 6 through 10', () => {
    expect(WEEK2_LESSONS.map((l) => l.id)).toEqual([6, 7, 8, 9, 10]);
  });

  it('lesson 10 is an integration day with fullyScored true', () => {
    const lesson10 = WEEK2_LESSONS[4];
    expect(lesson10.dayType).toBe('integration');
    expect(lesson10.fullyScored).toBe(true);
  });

  it('all lessons have non-empty appliedScenario', () => {
    WEEK2_LESSONS.forEach((lesson) => {
      expect(lesson.appliedScenario).toBeTruthy();
      expect(lesson.appliedScenario.length).toBeGreaterThan(0);
    });
  });
});
