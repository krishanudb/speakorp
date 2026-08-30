import { describe, expect, it } from 'vitest';
import { WEEK3_LESSONS } from './week3';

describe('WEEK3_LESSONS', () => {
  it('exports exactly 5 lessons', () => {
    expect(WEEK3_LESSONS).toHaveLength(5);
  });

  it('has lesson ids 11 through 15', () => {
    const ids = WEEK3_LESSONS.map((l) => l.id);
    expect(ids).toEqual([11, 12, 13, 14, 15]);
  });

  it('lesson 15 has dayType integration', () => {
    const l15 = WEEK3_LESSONS.find((l) => l.id === 15);
    expect(l15?.dayType).toBe('integration');
  });

  it('all lessons have non-empty appliedScenario', () => {
    WEEK3_LESSONS.forEach((lesson) => {
      expect(lesson.appliedScenario).toBeTruthy();
      expect(lesson.appliedScenario.length).toBeGreaterThan(0);
    });
  });

  it('lesson 11 is vocal.pace_control isolated', () => {
    const l11 = WEEK3_LESSONS.find((l) => l.id === 11);
    expect(l11?.dayType).toBe('isolated');
    expect(l11?.skillIds).toContain('vocal.pace_control');
  });

  it('lesson 12 requires video', () => {
    const l12 = WEEK3_LESSONS.find((l) => l.id === 12);
    expect(l12?.requiresVideo).toBe(true);
  });

  it('lesson 13 is storytelling isolated', () => {
    const l13 = WEEK3_LESSONS.find((l) => l.id === 13);
    expect(l13?.dayType).toBe('isolated');
    expect(l13?.skillIds).toContain('storytelling.build_tension_pacing');
    expect(l13?.requiresVideo).toBe(false);
  });

  it('lesson 14 is combo with pace and stillness', () => {
    const l14 = WEEK3_LESSONS.find((l) => l.id === 14);
    expect(l14?.dayType).toBe('combo');
    expect(l14?.skillIds).toEqual(['vocal.pace_control', 'presence.purposeful_stillness']);
    expect(l14?.requiresVideo).toBe(true);
    expect(l14?.fullyScored).toBe(false);
  });

  it('lesson 15 is fully scored integration', () => {
    const l15 = WEEK3_LESSONS.find((l) => l.id === 15);
    expect(l15?.fullyScored).toBe(true);
    expect(l15?.requiresVideo).toBe(true);
    expect(l15?.skillIds).toHaveLength(3);
  });
});
