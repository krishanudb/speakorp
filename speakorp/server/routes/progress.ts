import type { RouteRegistrar } from './registry';
import { store } from '../store';
import type { ProgressSnapshot, Session, SkillScore } from '../../shared/types';
import type { ProgressResponse } from '../../shared/api';
import { getLesson } from '../../shared/content/index';

/**
 * Compute progress snapshots by aggregating stored scores into per-skill per-week
 * rolling averages. Returns sorted snapshots grouped by (skillId, weekNumber).
 */
export function computeProgress(input: {
  userId: string;
  sessions: Session[];
  segmentsBySession: Map<string, string[]>; // sessionId -> segmentIds
  scoresBySegment: Map<string, SkillScore[]>; // segmentId -> scores
  weekOf: (lessonId: number) => number | undefined;
  skillId?: string;
}): ProgressSnapshot[] {
  const groups = new Map<string, { scores: number[]; weekNumber: number; skillId: string }>();

  // Iterate through each session
  for (const session of input.sessions) {
    // Get week number for this session's lesson
    const weekNumber = input.weekOf(session.lessonId);
    if (weekNumber === undefined) {
      continue; // Skip sessions with unknown lesson ids
    }

    // Get segment ids for this session
    const segmentIds = input.segmentsBySession.get(session.id) ?? [];

    // Collect all scores for this session's segments
    for (const segmentId of segmentIds) {
      const segmentScores = input.scoresBySegment.get(segmentId) ?? [];

      for (const skillScore of segmentScores) {
        // Filter by skillId if provided
        if (input.skillId && skillScore.skillId !== input.skillId) {
          continue;
        }

        // Create a key for grouping
        const key = `${skillScore.skillId}:${weekNumber}`;

        if (!groups.has(key)) {
          groups.set(key, {
            scores: [],
            weekNumber,
            skillId: skillScore.skillId,
          });
        }

        groups.get(key)!.scores.push(skillScore.score);
      }
    }
  }

  // Convert groups to snapshots, computing rolling averages
  const snapshots: ProgressSnapshot[] = Array.from(groups.values()).map((group) => {
    const average = group.scores.reduce((a, b) => a + b, 0) / group.scores.length;
    return {
      userId: input.userId,
      skillId: group.skillId,
      weekNumber: group.weekNumber,
      rollingScore: Math.round(average),
    };
  });

  // Sort by weekNumber then skillId
  snapshots.sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) {
      return a.weekNumber - b.weekNumber;
    }
    return a.skillId.localeCompare(b.skillId);
  });

  return snapshots;
}

/**
 * GET /api/users/:userId/progress?skillId=...
 * Returns progress snapshots aggregated from stored scores.
 */
export const registerProgressRoutes: RouteRegistrar = (app) => {
  app.get('/api/users/:userId/progress', (req, res) => {
    const { userId } = req.params;
    const { skillId } = req.query;

    // Build sessionsByUser and segment/score maps from store
    const sessionsByUser = Array.from(store.sessions.values()).filter(
      (s) => s.userId === userId,
    );

    // Build segmentsBySession: sessionId -> segmentIds
    const segmentsBySession = new Map<string, string[]>();
    for (const segment of store.segments.values()) {
      const sessionId = segment.sessionId;
      if (!segmentsBySession.has(sessionId)) {
        segmentsBySession.set(sessionId, []);
      }
      segmentsBySession.get(sessionId)!.push(segment.id);
    }

    // Build scoresBySegment: segmentId -> scores
    const scoresBySegment = store.scores;

    // Compute snapshots
    const snapshots = computeProgress({
      userId,
      sessions: sessionsByUser,
      segmentsBySession,
      scoresBySegment,
      weekOf: (lessonId) => getLesson(lessonId)?.week,
      skillId: typeof skillId === 'string' ? skillId : undefined,
    });

    const response: ProgressResponse = { snapshots };
    res.json(response);
  });
};
