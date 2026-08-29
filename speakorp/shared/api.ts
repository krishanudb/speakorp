// API contract shared between the Express backend and the React client (PRD §5).
// Feature branches implement/consume these shapes; keeping them here lets the
// frontend build against the contract before the backend routes land.

import type {
  FeedbackMessage,
  Lesson,
  ProcessingStatus,
  ProgressSnapshot,
  SegmentFeatures,
  SkillScore,
  Warmup,
} from './types';

// GET /api/lessons
export interface LessonSummary {
  id: number;
  week: number;
  day: number;
  title: string;
  dayType: Lesson['dayType'];
  skillIds: string[];
  fullyScored: boolean;
  requiresVideo: boolean;
}
export type ListLessonsResponse = { lessons: LessonSummary[] };

// GET /api/lessons/:id
export type GetLessonResponse = { lesson: Lesson; warmups: Warmup[] };

// POST /api/sessions/start
export interface StartSessionRequest {
  userId: string;
  lessonId: number;
}
export interface SessionSegmentSpec {
  segmentId: string;
  type: 'warmup' | 'drill' | 'scenario';
  skillIds: string[];
  instructions: string;
  timerSeconds: number;
}
export interface StartSessionResponse {
  sessionId: string;
  segments: SessionSegmentSpec[];
}

// POST /api/sessions/:sessionId/segments/:segmentId/upload
export interface UploadSegmentRequest {
  transcript: string;
  hasVideo: boolean;
  features: SegmentFeatures;
}
export interface UploadSegmentResponse {
  processingJobId: string;
}

// GET /api/sessions/:sessionId/segments/:segmentId/feedback
export interface FeedbackResponse {
  status: ProcessingStatus;
  skillScores: SkillScore[];
  feedbackMessages: FeedbackMessage[];
}

// GET /api/users/:userId/progress?skillId=...
export type ProgressResponse = { snapshots: ProgressSnapshot[] };

export interface ApiError {
  error: string;
}
