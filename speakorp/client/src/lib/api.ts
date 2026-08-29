// Typed client for the backend API contract (shared/api.ts).
// Frontend features call these helpers rather than using fetch directly.

import type {
  FeedbackResponse,
  GetLessonResponse,
  ListLessonsResponse,
  ProgressResponse,
  StartSessionRequest,
  StartSessionResponse,
  UploadSegmentRequest,
  UploadSegmentResponse,
} from '@shared/api';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

const enc = encodeURIComponent;

export const api = {
  listLessons: () => getJson<ListLessonsResponse>('/api/lessons'),

  getLesson: (id: number) => getJson<GetLessonResponse>(`/api/lessons/${enc(id)}`),

  startSession: (body: StartSessionRequest) =>
    postJson<StartSessionResponse>('/api/sessions/start', body),

  uploadSegment: (sessionId: string, segmentId: string, body: UploadSegmentRequest) =>
    postJson<UploadSegmentResponse>(
      `/api/sessions/${enc(sessionId)}/segments/${enc(segmentId)}/upload`,
      body,
    ),

  getFeedback: (sessionId: string, segmentId: string) =>
    getJson<FeedbackResponse>(
      `/api/sessions/${enc(sessionId)}/segments/${enc(segmentId)}/feedback`,
    ),

  getProgress: (userId: string, skillId?: string) =>
    getJson<ProgressResponse>(
      `/api/users/${enc(userId)}/progress${skillId ? `?skillId=${enc(skillId)}` : ''}`,
    ),
};
