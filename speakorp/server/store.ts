// Simple in-memory store for the MVP. The PRD's Results Store / job queue is
// approximated with process-local maps — swappable later for Lakebase/Delta.
// NOTE: state resets on app restart; acceptable for the MVP (progress is also
// mirrored client-side in localStorage).

import type {
  FeedbackMessage,
  ProcessingStatus,
  SegmentFeatures,
  SegmentRecording,
  Session,
  SkillScore,
} from '../shared/types';

export interface ProcessingJob {
  id: string;
  sessionId: string;
  segmentId: string;
  status: ProcessingStatus;
  createdAt: number;
}

class MemoryStore {
  readonly sessions = new Map<string, Session>();
  readonly segments = new Map<string, SegmentRecording>();
  /** Client-computed acoustic/timing proxies, kept for the scorer. */
  readonly features = new Map<string, SegmentFeatures>();
  readonly jobs = new Map<string, ProcessingJob>();
  /** segmentId -> scores */
  readonly scores = new Map<string, SkillScore[]>();
  /** segmentId -> feedback */
  readonly feedback = new Map<string, FeedbackMessage[]>();

  reset(): void {
    this.sessions.clear();
    this.segments.clear();
    this.features.clear();
    this.jobs.clear();
    this.scores.clear();
    this.feedback.clear();
  }
}

/** Process-wide singleton store shared across route modules. */
export const store = new MemoryStore();

let counter = 0;
/** Small, dependency-free unique id generator. */
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}
