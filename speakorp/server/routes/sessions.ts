import type { Request, Response } from 'express';
import type {
  Lesson,
  SegmentRecording,
  Session,
} from '../../shared/types';
import type {
  SessionSegmentSpec,
  StartSessionRequest,
  StartSessionResponse,
} from '../../shared/api';
import type { RouteRegistrar } from './registry';
import { store, newId } from '../store';
import { getLesson, getWarmups } from '../../shared/content/index';

/**
 * Build segment specs and placeholder recordings for a session.
 * Pure function for testability.
 */
export function buildSegments(
  lesson: Lesson,
  sessionId: string
): { specs: SessionSegmentSpec[]; placeholders: SegmentRecording[] } {
  const specs: SessionSegmentSpec[] = [];
  const placeholders: SegmentRecording[] = [];

  // 1. Warmup segment
  const warmupSegmentId = newId('seg');
  const warmups = getWarmups(lesson.warmupCodes);
  const warmupInstructions = warmups
    .map((w) => `${w.code}: ${w.script}`)
    .join('\n');

  specs.push({
    segmentId: warmupSegmentId,
    type: 'warmup',
    skillIds: [],
    instructions: warmupInstructions,
    timerSeconds: 300,
  });

  placeholders.push({
    id: warmupSegmentId,
    sessionId,
    segmentType: 'warmup',
    skillIds: [],
    mediaUrl: '',
    hasVideo: false,
    transcript: '',
    durationSec: 0,
  });

  // 2. Scenario segment
  const scenarioSegmentId = newId('seg');

  specs.push({
    segmentId: scenarioSegmentId,
    type: 'scenario',
    skillIds: lesson.skillIds,
    instructions: lesson.appliedScenario,
    timerSeconds: 90,
  });

  placeholders.push({
    id: scenarioSegmentId,
    sessionId,
    segmentType: 'scenario',
    skillIds: lesson.skillIds,
    mediaUrl: '',
    hasVideo: false,
    transcript: '',
    durationSec: 0,
  });

  return { specs, placeholders };
}

/**
 * POST /api/sessions/start
 * Create a new session and segment specs for a lesson.
 */
export const registerSessionsRoutes: RouteRegistrar = (app) => {
  app.post(
    '/api/sessions/start',
    (req: Request<never, never, StartSessionRequest>, res: Response) => {
      const { userId, lessonId } = req.body;

      // Validate userId
      if (typeof userId !== 'string' || userId.trim().length === 0) {
        return res.status(400).json({ error: 'userId must be a non-empty string' });
      }

      // Validate lessonId and fetch the lesson
      let lesson: Lesson;
      try {
        lesson = getLesson(lessonId);
      } catch {
        return res.status(400).json({ error: `Invalid lessonId: ${lessonId}` });
      }

      // Create session
      const sessionId = newId('sess');
      const session: Session = {
        id: sessionId,
        userId: userId.trim(),
        lessonId,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
      };
      store.sessions.set(sessionId, session);

      // Build segments
      const { specs, placeholders } = buildSegments(lesson, sessionId);

      // Store segment placeholders
      placeholders.forEach((placeholder) => {
        store.segments.set(placeholder.id, placeholder);
      });

      // Respond
      const response: StartSessionResponse = {
        sessionId,
        segments: specs,
      };
      res.json(response);
    }
  );
};
