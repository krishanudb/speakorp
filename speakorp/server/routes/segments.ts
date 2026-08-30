import type { RouteRegistrar } from './registry';
import { store, newId } from '../store';
import type { UploadSegmentRequest, UploadSegmentResponse } from '../../shared/api';
import type { SegmentFeatures } from '../../shared/types';
import type { ApiError } from '../../shared/api';

/**
 * Pure validator for UploadSegmentRequest body.
 * MVP note: media stays client-side; mediaUrl is a placeholder (memory://{segmentId}).
 */
export function validateUploadBody(body: unknown): body is UploadSegmentRequest {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const obj = body as Record<string, unknown>;

  // Validate transcript: must be a string
  if (typeof obj.transcript !== 'string') {
    return false;
  }

  // Validate hasVideo: must be a boolean
  if (typeof obj.hasVideo !== 'boolean') {
    return false;
  }

  // Validate features: must be an object with numeric fields
  if (typeof obj.features !== 'object' || obj.features === null) {
    return false;
  }

  const features = obj.features as Record<string, unknown>;

  // Validate all required numeric fields in SegmentFeatures
  const requiredFeatures: (keyof SegmentFeatures)[] = [
    'durationSec',
    'wordCount',
    'wordsPerMinute',
    'pauseCount',
    'longestPauseSec',
  ];

  for (const key of requiredFeatures) {
    const value = features[key];
    if (typeof value !== 'number' || isNaN(value)) {
      return false;
    }
  }

  return true;
}

/**
 * POST /api/sessions/:sessionId/segments/:segmentId/upload
 *
 * Attaches transcript + features to a segment placeholder and enqueues
 * a processing job. MVP posts JSON (media stays client-side).
 */
export const registerSegmentRoutes: RouteRegistrar = (app) => {
  app.post(
    '/api/sessions/:sessionId/segments/:segmentId/upload',
    (req, res) => {
      const { sessionId, segmentId } = req.params;

      // Validate that the segment exists and belongs to this session
      const segment = store.segments.get(segmentId);
      if (!segment) {
        return res.status(404).json({ error: `Segment ${segmentId} not found` } as ApiError);
      }

      if (segment.sessionId !== sessionId) {
        return res
          .status(404)
          .json({ error: `Segment ${segmentId} does not belong to session ${sessionId}` } as ApiError);
      }

      // Validate request body
      if (!validateUploadBody(req.body)) {
        return res.status(400).json({
          error:
            'Invalid upload body: must include transcript (string), hasVideo (boolean), and features (object with numeric durationSec, wordCount, wordsPerMinute, pauseCount, longestPauseSec)',
        } as ApiError);
      }

      const { transcript, hasVideo, features } = req.body as UploadSegmentRequest;

      // Update the stored SegmentRecording
      segment.transcript = transcript;
      segment.hasVideo = hasVideo;
      segment.durationSec = features.durationSec;
      segment.mediaUrl = `memory://${segmentId}`;

      // Create a ProcessingJob
      const jobId = newId('job');
      const job = {
        id: jobId,
        sessionId,
        segmentId,
        status: 'processing' as const,
        createdAt: Date.now(),
      };
      store.jobs.set(jobId, job);

      // Respond with the job id
      const response: UploadSegmentResponse = {
        processingJobId: jobId,
      };
      res.status(200).json(response);
    }
  );
};
