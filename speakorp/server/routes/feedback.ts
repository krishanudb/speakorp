import type { RouteRegistrar } from './registry';
import { store } from '../store';
import type { FeedbackResponse } from '../../shared/api';
import type { SegmentFeatures } from '../../shared/types';
import { scoreSegment } from '../scoring/rubricScorer';
import { composeFeedback } from '../scoring/feedbackComposer';
import { getLesson, getRubricsForSkills } from '../../shared/content/index';

/** Derive minimal SegmentFeatures from stored duration and transcript. */
export function deriveFeatures(durationSec: number, transcript: string): SegmentFeatures {
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const wordsPerMinute = durationSec > 0 ? (wordCount / (durationSec / 60)) : 0;

  return {
    durationSec,
    wordCount,
    wordsPerMinute,
    pauseCount: 0,
    longestPauseSec: 0,
  };
}

export const registerFeedbackRoutes: RouteRegistrar = (app, ctx) => {
  app.get('/api/sessions/:sessionId/segments/:segmentId/feedback', async (req, res) => {
    try {
      const { sessionId, segmentId } = req.params;

      // Look up the SegmentRecording
      const segment = store.segments.get(segmentId);
      if (!segment || segment.sessionId !== sessionId) {
        return res.status(404).json({ error: 'Segment not found' });
      }

      // Check if scores are already computed
      const existingScores = store.scores.get(segmentId);
      const existingFeedback = store.feedback.get(segmentId);

      if (existingScores && existingFeedback) {
        const response: FeedbackResponse = {
          status: 'ready',
          skillScores: existingScores,
          feedbackMessages: existingFeedback,
        };
        return res.json(response);
      }

      // If no transcript yet, return processing status
      if (!segment.transcript) {
        const response: FeedbackResponse = {
          status: 'processing',
          skillScores: [],
          feedbackMessages: [],
        };
        return res.json(response);
      }

      // Run the pipeline
      try {
        // Derive features from stored data
        const features = deriveFeatures(segment.durationSec, segment.transcript);

        // Score the segment
        const scores = scoreSegment({
          segmentRecordingId: segmentId,
          skillIds: segment.skillIds,
          features,
          transcript: segment.transcript,
        });

        // Look up the session to get lesson info
        const session = store.sessions.get(sessionId);
        let lessonTitle = '';
        let dayType: 'isolated' | 'combo' | 'integration' = 'isolated';

        if (session) {
          const lesson = getLesson(session.lessonId);
          if (lesson) {
            lessonTitle = lesson.title;
            dayType = lesson.dayType;
          }
        }

        // Get rubrics for the skills
        const rubrics = getRubricsForSkills(segment.skillIds);

        // Compose feedback
        const messages = await composeFeedback(ctx.serving, {
          segmentRecordingId: segmentId,
          transcript: segment.transcript,
          skillScores: scores,
          rubrics,
          lessonTitle,
          dayType,
        });

        // Store results
        store.scores.set(segmentId, scores);
        store.feedback.set(segmentId, messages);

        // Mark any matching job as ready
        for (const [jobId, job] of store.jobs.entries()) {
          if (job.segmentId === segmentId) {
            job.status = 'ready';
          }
        }

        const response: FeedbackResponse = {
          status: 'ready',
          skillScores: scores,
          feedbackMessages: messages,
        };

        return res.json(response);
      } catch (pipelineError) {
        console.error(`[feedback] Pipeline error for segment ${segmentId}:`, pipelineError);
        return res.status(500).json({
          status: 'failed',
          skillScores: [],
          feedbackMessages: [],
        });
      }
    } catch (err) {
      console.error('[feedback] Unexpected error:', err);
      return res.status(500).json({
        status: 'failed',
        skillScores: [],
        feedbackMessages: [],
      });
    }
  });
};
