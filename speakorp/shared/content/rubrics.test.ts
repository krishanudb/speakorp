import { describe, it, expect } from 'vitest';
import { SKILLS, RUBRICS, getSkill, getRubric } from './rubrics';

describe('rubrics', () => {
  describe('SKILLS', () => {
    it('should export exactly 12 skills', () => {
      expect(SKILLS).toHaveLength(12);
    });

    it('should have unique ids', () => {
      const ids = SKILLS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(12);
    });

    it('should have all required fields', () => {
      SKILLS.forEach((skill) => {
        expect(skill).toHaveProperty('id');
        expect(skill).toHaveProperty('pillar');
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('lessonIntroduced');
        expect(typeof skill.id).toBe('string');
        expect(['vocal', 'presence', 'storytelling']).toContain(skill.pillar);
        expect(typeof skill.name).toBe('string');
        expect(typeof skill.lessonIntroduced).toBe('number');
      });
    });
  });

  describe('RUBRICS', () => {
    it('should export exactly 12 rubrics', () => {
      expect(RUBRICS).toHaveLength(12);
    });

    it('should have all skillIds matching SKILLS ids', () => {
      const skillIds = new Set(SKILLS.map((s) => s.id));
      RUBRICS.forEach((rubric) => {
        expect(skillIds.has(rubric.skillId)).toBe(true);
      });
    });

    it('should have one rubric per skill', () => {
      const skillIds = new Set(SKILLS.map((s) => s.id));
      const rubricSkillIds = new Set(RUBRICS.map((r) => r.skillId));
      expect(rubricSkillIds.size).toBe(12);
      expect(skillIds).toEqual(rubricSkillIds);
    });

    it('should have all required fields', () => {
      RUBRICS.forEach((rubric) => {
        expect(rubric).toHaveProperty('skillId');
        expect(rubric).toHaveProperty('inputs');
        expect(rubric).toHaveProperty('metric');
        expect(rubric).toHaveProperty('bands');
        expect(rubric).toHaveProperty('sampleFeedback');
        expect(typeof rubric.skillId).toBe('string');
        expect(typeof rubric.inputs).toBe('string');
        expect(typeof rubric.metric).toBe('string');
        expect(typeof rubric.bands).toBe('string');
        expect(typeof rubric.sampleFeedback).toBe('string');
      });
    });
  });

  describe('getSkill', () => {
    it('should return a skill by its id', () => {
      const skill = getSkill('vocal.breath_support');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('vocal.breath_support');
      expect(skill?.name).toBe('Breath Support');
    });

    it('should return undefined for unknown id', () => {
      const skill = getSkill('unknown.skill');
      expect(skill).toBeUndefined();
    });

    it('should return undefined for empty id', () => {
      const skill = getSkill('');
      expect(skill).toBeUndefined();
    });
  });

  describe('getRubric', () => {
    it('should return a rubric by its skillId', () => {
      const rubric = getRubric('vocal.breath_support');
      expect(rubric).toBeDefined();
      expect(rubric?.skillId).toBe('vocal.breath_support');
      expect(rubric?.inputs).toContain('word-timestamps');
    });

    it('should return undefined for unknown skillId', () => {
      const rubric = getRubric('unknown.skill');
      expect(rubric).toBeUndefined();
    });

    it('should return undefined for empty skillId', () => {
      const rubric = getRubric('');
      expect(rubric).toBeUndefined();
    });
  });
});
