import { useState, useEffect, useRef } from 'react';
import { useParams, NavLink } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@databricks/appkit-ui/react';
import type { RecorderResult } from '@/components/Recorder';
import type { FeedbackResponse } from '@shared/api';
import { api } from '@/lib/api';
import { Recorder } from '@/components/Recorder';
import { FeedbackView } from '@/components/FeedbackView';
import { recordCompletion } from '@/lib/progressStore';

type SessionState = 'idle' | 'recording' | 'uploading' | 'analyzing' | 'done' | 'failed';

export function LessonRunner() {
  const { id } = useParams();
  const lessonId = Number(id);

  // Main lesson loading
  const [lesson, setLesson] = useState<Awaited<ReturnType<typeof api.getLesson>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session flow
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scenarioSegmentId, setScenarioSegmentId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load lesson on mount
  useEffect(() => {
    if (isNaN(lessonId)) {
      setError('Invalid lesson');
      setLoading(false);
      return;
    }

    api
      .getLesson(lessonId)
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
        setLoading(false);
      });
  }, [lessonId]);

  // Timer effect
  useEffect(() => {
    if (!timerRunning) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const startRecording = async () => {
    try {
      setSessionState('recording');
      setUploadError(null);

      const response = await api.startSession({ userId: 'demo-user', lessonId });
      setSessionId(response.sessionId);

      // Find scenario segment
      const scenario = response.segments.find((s) => s.type === 'scenario');
      if (!scenario) {
        throw new Error('No scenario segment found');
      }
      setScenarioSegmentId(scenario.segmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
      setSessionState('failed');
    }
  };

  const handleRecorderComplete = async (result: RecorderResult) => {
    if (!sessionId || !scenarioSegmentId || !lesson) {
      setUploadError('Session not initialized');
      setSessionState('failed');
      return;
    }

    try {
      setSessionState('uploading');

      await api.uploadSegment(sessionId, scenarioSegmentId, {
        transcript: result.transcript,
        hasVideo: result.hasVideo,
        features: result.features,
      });

      setSessionState('analyzing');

      // Poll for feedback
      let attempts = 0;
      const maxAttempts = 15;
      const pollInterval = 1500; // 1.5s

      const poll = async () => {
        try {
          const response = await api.getFeedback(sessionId, scenarioSegmentId);

          if (response.status === 'ready') {
            setFeedback(response);
            setSessionState('done');

            // Record completion
            recordCompletion({
              lessonId,
              week: lesson.lesson.week,
              completedAt: new Date().toISOString(),
              scores: response.skillScores.map((s) => ({
                skillId: s.skillId,
                score: s.score,
              })),
            });
          } else if (response.status === 'failed') {
            setSessionState('failed');
            setUploadError('Feedback generation failed');
          } else if (attempts < maxAttempts) {
            attempts += 1;
            setTimeout(poll, pollInterval);
          } else {
            setSessionState('failed');
            setUploadError('Timeout waiting for feedback');
          }
        } catch (err) {
          if (attempts < maxAttempts) {
            attempts += 1;
            setTimeout(poll, pollInterval);
          } else {
            setSessionState('failed');
            setUploadError(err instanceof Error ? err.message : 'Failed to get feedback');
          }
        }
      };

      poll();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload recording');
      setSessionState('failed');
    }
  };

  // Invalid lesson ID
  if (isNaN(lessonId)) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 mt-16">
        <h2 className="text-2xl font-semibold text-foreground">Invalid lesson</h2>
        <NavLink to="/lessons" className="text-primary underline underline-offset-4">
          Back to lessons →
        </NavLink>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 mt-16">
        <p className="text-muted-foreground">Loading lesson...</p>
      </div>
    );
  }

  // Error loading lesson
  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 mt-16">
        <h2 className="text-2xl font-semibold text-foreground">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <NavLink to="/lessons" className="text-primary underline underline-offset-4">
          Back to lessons →
        </NavLink>
      </div>
    );
  }

  // Lesson not found
  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 mt-16">
        <p className="text-muted-foreground">Lesson not found</p>
        <NavLink to="/lessons" className="text-primary underline underline-offset-4">
          Back to lessons →
        </NavLink>
      </div>
    );
  }

  const { lesson: lessonData, warmups } = lesson;

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-6">
      {/* Title and Concept */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">{lessonData.title}</h2>
        <p className="text-lg text-muted-foreground">{lessonData.concept}</p>
      </div>

      {/* Warmups */}
      {warmups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Warmups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {warmups.map((warmup) => (
              <div key={warmup.code} className="space-y-2">
                <h3 className="font-semibold text-foreground">{warmup.name}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{warmup.script}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Drills */}
      {lessonData.drills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Drills</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lessonData.drills.map((drill, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {drill}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Applied Scenario */}
      <Card>
        <CardHeader>
          <CardTitle>Applied Scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {lessonData.appliedScenario}
          </p>

          {/* Timer */}
          {sessionState !== 'done' && (
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-foreground">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </div>
              <Button
                onClick={() => setTimerRunning(!timerRunning)}
                variant={timerRunning ? 'secondary' : 'default'}
              >
                {timerRunning ? 'Pause' : 'Start'} Timer
              </Button>
            </div>
          )}

          {/* Recording State */}
          {sessionState === 'idle' && (
            <Button onClick={startRecording} variant="default">
              Start Recording
            </Button>
          )}

          {sessionState === 'recording' && scenarioSegmentId && (
            <Recorder requireVideo={lessonData.requiresVideo} onComplete={handleRecorderComplete} />
          )}

          {sessionState === 'uploading' && (
            <p className="text-muted-foreground">Uploading...</p>
          )}

          {sessionState === 'analyzing' && (
            <p className="text-muted-foreground">Analyzing...</p>
          )}

          {sessionState === 'done' && feedback && (
            <div className="space-y-4">
              <FeedbackView
                skillScores={feedback.skillScores}
                feedbackMessages={feedback.feedbackMessages}
              />
              <div className="flex gap-2">
                <NavLink to="/lessons" className="text-primary underline underline-offset-4">
                  Back to lessons
                </NavLink>
                <NavLink to="/progress" className="text-primary underline underline-offset-4">
                  View progress
                </NavLink>
              </div>
            </div>
          )}

          {sessionState === 'failed' && (
            <div className="space-y-2">
              <p className="text-sm text-destructive">{uploadError || 'An error occurred'}</p>
              <Button
                onClick={() => {
                  setSessionState('idle');
                  setUploadError(null);
                  setSessionId(null);
                  setScenarioSegmentId(null);
                }}
                variant="secondary"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
