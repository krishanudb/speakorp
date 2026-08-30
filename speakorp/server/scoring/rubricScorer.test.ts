import { describe, it, expect } from 'vitest';
import { scoreSegment, ScoreInput } from './rubricScorer';
import { SegmentFeatures, scoreToBand } from '../../shared/types';

describe('rubricScorer', () => {
  const baseFeatures: SegmentFeatures = {
    durationSec: 45,
    wordCount: 120,
    wordsPerMinute: 135,
    pauseCount: 3,
    longestPauseSec: 0.8,
  };

  const baseInput: ScoreInput = {
    segmentRecordingId: 'seg_001',
    skillIds: ['vocal.breath_support', 'vocal.pace_control'],
    features: baseFeatures,
    transcript: 'This is a test transcript.',
  };

  it('returns one SkillScore per skillId', () => {
    const result = scoreSegment(baseInput);
    expect(result).toHaveLength(baseInput.skillIds.length);
    expect(result[0].skillId).toBe('vocal.breath_support');
    expect(result[1].skillId).toBe('vocal.pace_control');
  });

  it('produces scores as integers within 0..100', () => {
    const result = scoreSegment(baseInput);
    result.forEach((skillScore) => {
      expect(Number.isInteger(skillScore.score)).toBe(true);
      expect(skillScore.score).toBeGreaterThanOrEqual(0);
      expect(skillScore.score).toBeLessThanOrEqual(100);
    });
  });

  it('band matches scoreToBand(score)', () => {
    const result = scoreSegment(baseInput);
    result.forEach((skillScore) => {
      const expectedBand = scoreToBand(skillScore.score);
      expect(skillScore.band).toBe(expectedBand);
    });
  });

  it('generates correct id format: score_${segmentRecordingId}_${skillId}', () => {
    const result = scoreSegment(baseInput);
    result.forEach((skillScore) => {
      const expectedId = `score_${baseInput.segmentRecordingId}_${skillScore.skillId}`;
      expect(skillScore.id).toBe(expectedId);
    });
  });

  it('deterministic: same input produces identical output', () => {
    const result1 = scoreSegment(baseInput);
    const result2 = scoreSegment(baseInput);

    expect(result1).toHaveLength(result2.length);
    result1.forEach((score, i) => {
      const score2 = result2[i];
      expect(score.id).toBe(score2.id);
      expect(score.skillId).toBe(score2.skillId);
      expect(score.score).toBe(score2.score);
      expect(score.band).toBe(score2.band);
      expect(score.rawFeatures).toEqual(score2.rawFeatures);
    });
  });

  it('unknown skillId yields baseline score with note', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_002',
      skillIds: ['unknown.skill_id'],
      features: baseFeatures,
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result).toHaveLength(1);
    const score = result[0];
    expect(score.score).toBe(70);
    expect(score.rawFeatures.note).toMatch(/unknown skillId/);
  });

  it('handles empty skillIds array', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_003',
      skillIds: [],
      features: baseFeatures,
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result).toHaveLength(0);
  });

  it('scores vocal.breath_support low with high pauseCount and long pauses', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_004',
      skillIds: ['vocal.breath_support'],
      features: {
        durationSec: 30,
        wordCount: 60,
        wordsPerMinute: 120,
        pauseCount: 8,
        longestPauseSec: 2.0,
      },
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result[0].score).toBeLessThan(70);
  });

  it('scores vocal.strategic_pausing high with longestPauseSec >= 0.6', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_005',
      skillIds: ['vocal.strategic_pausing'],
      features: {
        durationSec: 30,
        wordCount: 80,
        wordsPerMinute: 130,
        pauseCount: 2,
        longestPauseSec: 1.0,
      },
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result[0].score).toBeGreaterThanOrEqual(75);
  });

  it('scores vocal.strategic_pausing low with longestPauseSec < 0.4', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_006',
      skillIds: ['vocal.strategic_pausing'],
      features: {
        durationSec: 30,
        wordCount: 80,
        wordsPerMinute: 130,
        pauseCount: 2,
        longestPauseSec: 0.2,
      },
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result[0].score).toBeLessThan(60);
  });

  it('scores vocal.pace_control high for WPM in 110–160 range', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_007',
      skillIds: ['vocal.pace_control'],
      features: {
        durationSec: 45,
        wordCount: 100,
        wordsPerMinute: 135,
        pauseCount: 2,
        longestPauseSec: 0.5,
      },
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result[0].score).toBeGreaterThanOrEqual(90);
  });

  it('scores vocal.pace_control low for extreme WPM (very fast or very slow)', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_008',
      skillIds: ['vocal.pace_control'],
      features: {
        durationSec: 30,
        wordCount: 30,
        wordsPerMinute: 50,
        pauseCount: 1,
        longestPauseSec: 0.3,
      },
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result[0].score).toBeLessThan(50);
  });

  it('presence skills include MVP note in rawFeatures', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_009',
      skillIds: ['presence.neutral_posture'],
      features: baseFeatures,
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result[0].rawFeatures.note).toMatch(/pose data not measured in MVP/);
  });

  it('storytelling skills include LLM composer note in rawFeatures', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_010',
      skillIds: ['storytelling.identify_reveal'],
      features: baseFeatures,
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result[0].rawFeatures.note).toMatch(/LLM composer/);
  });

  it('vocal.pitch_variety includes MVP proxy note', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_011',
      skillIds: ['vocal.pitch_variety'],
      features: baseFeatures,
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result[0].rawFeatures.note).toMatch(/pitch not measured in MVP/);
  });

  it('handles multiple skillIds of different pillars', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_012',
      skillIds: [
        'vocal.breath_support',
        'presence.neutral_posture',
        'storytelling.identify_reveal',
      ],
      features: baseFeatures,
      transcript: 'test',
    };

    const result = scoreSegment(input);
    expect(result).toHaveLength(3);
    expect(result[0].skillId).toBe('vocal.breath_support');
    expect(result[1].skillId).toBe('presence.neutral_posture');
    expect(result[2].skillId).toBe('storytelling.identify_reveal');

    result.forEach((score) => {
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
      expect(score.band).toBe(scoreToBand(score.score));
    });
  });

  it('rawFeatures includes input features used in scoring', () => {
    const input: ScoreInput = {
      segmentRecordingId: 'seg_013',
      skillIds: ['vocal.breath_support'],
      features: baseFeatures,
      transcript: 'test',
    };

    const result = scoreSegment(input);
    const raw = result[0].rawFeatures;
    expect(raw.pauseCount).toBe(baseFeatures.pauseCount);
    expect(raw.longestPauseSec).toBe(baseFeatures.longestPauseSec);
    expect(raw.durationSec).toBe(baseFeatures.durationSec);
  });
});
