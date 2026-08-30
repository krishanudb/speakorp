// Lessons API: list all lessons and fetch lesson details with warmups.
// GET /api/lessons → summary of all lessons
// GET /api/lessons/:id → full lesson + associated warmups

import type { RouteRegistrar } from './registry';
import { LESSONS, getLesson, getWarmups } from '../../shared/content/index';
import type { ListLessonsResponse, GetLessonResponse, LessonSummary } from '../../shared/api';

/**
 * Register lessons list and detail endpoints.
 */
export const registerLessonsRoutes: RouteRegistrar = (app) => {
  /**
   * GET /api/lessons
   * Return summary of all 20 lessons for the lesson picker or progress view.
   */
  app.get('/api/lessons', (_req, res) => {
    const lessons: LessonSummary[] = LESSONS.map((l) => ({
      id: l.id,
      week: l.week,
      day: l.day,
      title: l.title,
      dayType: l.dayType,
      skillIds: l.skillIds,
      fullyScored: l.fullyScored,
      requiresVideo: l.requiresVideo,
    }));

    const response: ListLessonsResponse = { lessons };
    res.json(response);
  });

  /**
   * GET /api/lessons/:id
   * Return full lesson + warmups for that lesson.
   * 404 if lesson id is invalid.
   */
  app.get('/api/lessons/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const lesson = getLesson(id);

    if (!lesson) {
      res.status(404).json({ error: `Lesson ${id} not found` });
      return;
    }

    const warmups = getWarmups(lesson.warmupCodes);
    const response: GetLessonResponse = { lesson, warmups };
    res.json(response);
  });
};
