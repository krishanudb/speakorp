// Content aggregator: combines all lessons, warmups, skills, and rubrics
// from parallel content branches into a unified export.
//
// These imports will resolve once the content branches are merged:
// - warmups.ts exports: WARMUPS, getWarmups
// - week1.ts, week2.ts, week3.ts, week4.ts export: WEEK1_LESSONS, ..., WEEK4_LESSONS
// - rubrics.ts exports: SKILLS, RUBRICS, getSkill, getRubric

import type { Lesson, Rubric } from '../types';
import { WARMUPS, getWarmups } from './warmups';
import { WEEK1_LESSONS } from './week1';
import { WEEK2_LESSONS } from './week2';
import { WEEK3_LESSONS } from './week3';
import { WEEK4_LESSONS } from './week4';
import { SKILLS, RUBRICS, getSkill, getRubric } from './rubrics';

/**
 * All 20 lessons (5 per week, 4 weeks), sorted by id.
 * Lessons are the backbone of the curriculum; every day in the program
 * maps to one lesson (PRD §4, §6).
 */
export const LESSONS: Lesson[] = [
  ...WEEK1_LESSONS,
  ...WEEK2_LESSONS,
  ...WEEK3_LESSONS,
  ...WEEK4_LESSONS,
].sort((a, b) => a.id - b.id);

// Re-export content and helper functions for client/server access
export { WARMUPS, SKILLS, RUBRICS, getWarmups, getSkill, getRubric };

/**
 * Fetch a single lesson by id.
 * @param id Lesson number, 1..20
 * @returns Lesson, or undefined if id is out of range
 */
export function getLesson(id: number): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

/**
 * Map skill ids to their rubrics.
 * Drops any skill ids that don't have an associated rubric.
 * @param skillIds Array of skill ids (e.g., ["vocal.breath_support"])
 * @returns Array of Rubrics for those skills
 */
export function getRubricsForSkills(skillIds: string[]): Rubric[] {
  return skillIds
    .map((skillId) => getRubric(skillId))
    .filter((rubric) => rubric !== undefined) as Rubric[];
}
