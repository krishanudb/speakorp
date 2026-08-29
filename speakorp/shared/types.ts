// Core domain model for the Executive Communication practice app.
// Derived from the PRD data model (§4) and content spec (§6/§8).
// This file is isomorphic (no server/node-only imports) so both the
// Express backend and the React client can import from it.

export type SkillPillar = 'vocal' | 'presence' | 'storytelling';

export type DayType = 'isolated' | 'combo' | 'integration';

export type SegmentType = 'warmup' | 'drill' | 'scenario';

export type ScoreBand = 'needs_work' | 'developing' | 'strong';

export type ProcessingStatus = 'processing' | 'ready' | 'failed';

/** A vocal warmup drill from the shared warmup bank (§6). */
export interface Warmup {
  /** Stable code, e.g. "W1". */
  code: string;
  name: string;
  script: string;
}

/** A trainable skill introduced on a specific lesson. */
export interface Skill {
  /** Stable id, e.g. "vocal.breath_support". */
  id: string;
  pillar: SkillPillar;
  name: string;
  /** Lesson number where this skill is first taught. */
  lessonIntroduced: number;
}

/**
 * Deterministic scoring rubric for a skill (§8). Kept as human-readable
 * descriptions so the rubric can be shown in the UI and fed to the LLM
 * Feedback Composer without the LLM inferring acoustic properties itself.
 */
export interface Rubric {
  skillId: string;
  /** Signals the deterministic scorer needs (e.g. "word-timestamps, pause list"). */
  inputs: string;
  /** The computed metric(s). */
  metric: string;
  /** Scoring-band definition text. */
  bands: string;
  /** Example of the coaching tone expected. */
  sampleFeedback: string;
}

/** A single lesson (1..20) — the LessonPlan + its content spec, combined. */
export interface Lesson {
  /** Lesson number 1..20 (doubles as id). */
  id: number;
  week: number;
  /** Day within the week, 1..5. */
  day: number;
  title: string;
  dayType: DayType;
  /** Skills targeted by this lesson's scored scenario. */
  skillIds: string[];
  /** Warmup codes for this lesson (§6). */
  warmupCodes: string[];
  concept: string;
  drills: string[];
  appliedScenario: string;
  /** True when the applied scenario is fully scored (integration days). */
  fullyScored: boolean;
  /** Presence lessons request video for pose analysis. */
  requiresVideo: boolean;
  /** Week-1 baseline recording flagged for the Week-12 before/after (§6, L5). */
  isBaselineRecording?: boolean;
  /** Month-one capstone flagged for comparison against L1 baseline (§6, L20). */
  isMonthOneCapstone?: boolean;
}

// ---- Runtime entities (created during a practice session) ----

export interface User {
  id: string;
  name: string;
  programStartDate: string;
  currentWeek: number;
  currentDay: number;
}

export interface Session {
  id: string;
  userId: string;
  lessonId: number;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed';
}

export interface SegmentRecording {
  id: string;
  sessionId: string;
  segmentType: SegmentType;
  skillIds: string[];
  mediaUrl: string;
  hasVideo: boolean;
  transcript: string;
  durationSec: number;
}

/** Lightweight acoustic/timing proxies computed client-side for the MVP. */
export interface SegmentFeatures {
  durationSec: number;
  wordCount: number;
  wordsPerMinute: number;
  /** Estimated pause count (silences between words/sentences). */
  pauseCount: number;
  /** Longest estimated pause, seconds. */
  longestPauseSec: number;
}

export interface SkillScore {
  id: string;
  segmentRecordingId: string;
  skillId: string;
  rawFeatures: Record<string, number | string | null>;
  score: number; // 0..100
  band: ScoreBand;
}

export interface FeedbackMessage {
  id: string;
  segmentRecordingId: string;
  skillId: string;
  summary: string;
  specificTip: string;
  /** Optional timestamp (seconds) pointing at a moment in the recording. */
  timestampRef: number | null;
}

export interface ProgressSnapshot {
  userId: string;
  skillId: string;
  weekNumber: number;
  rollingScore: number;
}

/** Map a 0..100 score to a band using the PRD's shared thresholds. */
export function scoreToBand(score: number): ScoreBand {
  if (score >= 90) return 'strong';
  if (score >= 60) return 'developing';
  return 'needs_work';
}
