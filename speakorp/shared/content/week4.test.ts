import { describe, expect, it } from 'vitest';
import { WEEK4_LESSONS } from './week4';

describe('WEEK4_LESSONS', () => {
  it('exports exactly 5 lessons', () => {
    expect(WEEK4_LESSONS).toHaveLength(5);
  });

  it('has lesson IDs 16 through 20', () => {
    expect(WEEK4_LESSONS.map((l) => l.id)).toEqual([16, 17, 18, 19, 20]);
  });

  it('lesson 20 is an integration day with isMonthOneCapstone true', () => {
    const lesson20 = WEEK4_LESSONS[4];
    expect(lesson20.dayType).toBe('integration');
    expect(lesson20.isMonthOneCapstone).toBe(true);
  });

  it('all lessons have non-empty appliedScenario', () => {
    WEEK4_LESSONS.forEach((lesson) => {
      expect(lesson.appliedScenario).toBeTruthy();
      expect(lesson.appliedScenario.length).toBeGreaterThan(0);
    });
  });
});
