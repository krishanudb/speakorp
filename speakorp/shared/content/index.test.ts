import { describe, it, expect } from 'vitest';
import { LESSONS, getLesson, getRubricsForSkills } from './index';

describe('content aggregator', () => {
  it('should export exactly 20 lessons', () => {
    expect(LESSONS).toHaveLength(20);
  });

  it('should have lesson ids from 1 to 20 in sorted order', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('should return a lesson when getLesson is called with a valid id', () => {
    const lesson = getLesson(5);
    expect(lesson).toBeDefined();
    expect(lesson?.id).toBe(5);
  });

  it('should return undefined when getLesson is called with an invalid id', () => {
    const lesson = getLesson(999);
    expect(lesson).toBeUndefined();
  });

  it('should return rubrics for a skill', () => {
    const rubrics = getRubricsForSkills(['vocal.breath_support']);
    expect(rubrics.length).toBeGreaterThanOrEqual(1);
    expect(rubrics[0].skillId).toBe('vocal.breath_support');
  });
});
