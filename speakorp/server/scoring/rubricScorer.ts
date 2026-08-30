import {
  SegmentFeatures,
  SkillScore,
  scoreToBand,
} from '../../shared/types';

export interface ScoreInput {
  segmentRecordingId: string;
  skillIds: string[];
  features: SegmentFeatures;
  transcript: string;
}

interface ScorerOutput {
  score: number;
  raw: Record<string, number | string | null>;
}

/**
 * Per-skill deterministic scoring heuristics.
 * Each scorer function receives the SegmentFeatures and transcript,
 * and returns a score (0–100) plus rawFeatures explaining the computation.
 */
const SKILL_SCORERS: Record<
  string,
  (features: SegmentFeatures, transcript: string) => ScorerOutput
> = {
  // ---- Vocal skills ----

  'vocal.breath_support': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      pauseCount: features.pauseCount,
      longestPauseSec: features.longestPauseSec,
      durationSec: features.durationSec,
      wordCount: features.wordCount,
    };

    // Good breath support: fewer/short mid-speech pauses
    // Heuristic: penalize high pauseCount and long pauses; reward adequate duration
    let score = 70; // baseline
    score += Math.max(0, 10 - features.pauseCount * 2); // reduce 2 points per pause, cap at +10
    score -= Math.min(10, features.longestPauseSec * 5); // penalize long pauses, cap at -10
    score += features.durationSec >= 30 ? 5 : 0; // bonus for adequate duration
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw: { ...raw, rule: 'fewer_shorter_pauses_adequate_duration' },
    };
  },

  'vocal.strategic_pausing': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      longestPauseSec: features.longestPauseSec,
      pauseCount: features.pauseCount,
    };

    // Strategic pausing: presence of at least one deliberate pause (≥0.6s)
    let score = 40; // baseline low—requires deliberate pause
    if (features.longestPauseSec >= 0.6) {
      score = 75 + (features.pauseCount >= 2 ? 15 : 10); // strong if 1+ strategic pause
    } else if (features.longestPauseSec >= 0.4) {
      score = 60; // some pausing, but not quite "strategic"
    }
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      raw: {
        ...raw,
        rule: 'deliberate_pause_presence_geq_0.6s',
      },
    };
  },

  'vocal.pace_control': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      wordsPerMinute: features.wordsPerMinute,
      durationSec: features.durationSec,
      wordCount: features.wordCount,
    };

    // Natural range: 110–160 WPM
    const wpm = features.wordsPerMinute;
    let score = 70;

    if (wpm >= 110 && wpm <= 160) {
      score = 90 + (Math.abs(wpm - 135) <= 10 ? 5 : 0); // bonus near optimal ~135
    } else if (wpm >= 90 && wpm <= 180) {
      score = 70; // acceptable but not ideal
    } else if (wpm >= 60 && wpm <= 200) {
      score = 50; // slow or fast, but not extreme
    } else {
      score = 30; // very slow or very fast
    }
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw: { ...raw, rule: 'wpm_in_110_160_optimal_135' },
    };
  },

  'vocal.pitch_variety': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      durationSec: features.durationSec,
      wordCount: features.wordCount,
      note: 'proxy from duration and word count adequacy; pitch not measured in MVP',
    };

    // Proxy: adequate word count and duration suggest more opportunity for varied pitch.
    // Capped below 90 so an UNMEASURED signal never yields a spurious "strong" band.
    let score = 70; // baseline
    score += features.wordCount >= 100 ? 8 : 0;
    score += features.durationSec >= 45 ? 7 : 0;
    score = Math.max(0, Math.min(89, Math.round(score)));

    return {
      score,
      raw,
    };
  },

  // ---- Presence skills (no pose data in MVP) ----

  'presence.neutral_posture': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      durationSec: features.durationSec,
      note: 'pose data not measured in MVP; baseline adjusted by duration adequacy',
    };

    let score = 70;
    score += features.durationSec >= 30 ? 5 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw,
    };
  },

  'presence.eliminate_fidgeting': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      durationSec: features.durationSec,
      note: 'pose data not measured in MVP; baseline adjusted by duration adequacy',
    };

    let score = 70;
    score += features.durationSec >= 30 ? 5 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw,
    };
  },

  'presence.purposeful_stillness': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      durationSec: features.durationSec,
      note: 'pose data not measured in MVP; baseline adjusted by duration adequacy',
    };

    let score = 70;
    score += features.durationSec >= 30 ? 5 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw,
    };
  },

  'presence.open_closed_gestures': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      durationSec: features.durationSec,
      note: 'pose data not measured in MVP; baseline adjusted by duration adequacy',
    };

    let score = 70;
    score += features.durationSec >= 30 ? 5 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw,
    };
  },

  // ---- Storytelling skills (LLM judgment deferred to composer) ----

  'storytelling.identify_reveal': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      wordCount: features.wordCount,
      note: 'narrative structure judged by LLM composer; proxy from word count adequacy',
    };

    let score = 70;
    score += features.wordCount >= 80 ? 10 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw,
    };
  },

  'storytelling.setup_tension_reveal': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      wordCount: features.wordCount,
      note: 'narrative structure judged by LLM composer; proxy from word count adequacy',
    };

    let score = 70;
    score += features.wordCount >= 100 ? 10 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw,
    };
  },

  'storytelling.build_tension_pacing': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      durationSec: features.durationSec,
      wordsPerMinute: features.wordsPerMinute,
      note: 'narrative pacing judged by LLM composer; proxy from WPM and duration',
    };

    let score = 70;
    const wpm = features.wordsPerMinute;
    if (wpm >= 100 && wpm <= 170) {
      score += 10;
    }
    score += features.durationSec >= 40 ? 5 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw,
    };
  },

  'storytelling.dont_lead_conclusion': (features, _transcript) => {
    const raw: Record<string, number | string | null> = {
      wordCount: features.wordCount,
      note: 'narrative structure judged by LLM composer; proxy from word count adequacy',
    };

    let score = 70;
    score += features.wordCount >= 80 ? 10 : 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      raw,
    };
  },
};

/**
 * Deterministic rubric scorer. Returns one SkillScore per skillId.
 * Same input always produces the same output (no randomness).
 */
export function scoreSegment(input: ScoreInput): SkillScore[] {
  const { segmentRecordingId, skillIds, transcript } = input;

  // Sanitize features so a non-finite upstream value (e.g. NaN WPM from a
  // zero-duration segment) can never propagate into a NaN score and break the
  // documented 0..100 integer invariant.
  const num = (v: number): number => (Number.isFinite(v) ? v : 0);
  const features: SegmentFeatures = {
    durationSec: num(input.features.durationSec),
    wordCount: num(input.features.wordCount),
    wordsPerMinute: num(input.features.wordsPerMinute),
    pauseCount: num(input.features.pauseCount),
    longestPauseSec: num(input.features.longestPauseSec),
  };

  return skillIds.map((skillId) => {
    const scorerFn = SKILL_SCORERS[skillId];

    let scoreOutput: ScorerOutput;
    if (scorerFn) {
      scoreOutput = scorerFn(features, transcript);
    } else {
      // Unknown skillId: baseline 70 with note
      scoreOutput = {
        score: 70,
        raw: {
          note: `unknown skillId "${skillId}"; using baseline score`,
        },
      };
    }

    const score = Math.max(0, Math.min(100, Math.round(scoreOutput.score)));
    const band = scoreToBand(score);
    const id = `score_${segmentRecordingId}_${skillId}`;

    return {
      id,
      segmentRecordingId,
      skillId,
      rawFeatures: scoreOutput.raw,
      score,
      band,
    };
  });
}
