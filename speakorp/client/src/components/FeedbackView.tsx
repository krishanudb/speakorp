import type { ReactNode } from 'react';
import type { SkillScore, FeedbackMessage } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@databricks/appkit-ui/react';
import { bandLabel, bandClasses } from '@/lib/bandColor';
import { cn } from '@/lib/utils';

export interface FeedbackViewProps {
  skillScores: SkillScore[];
  feedbackMessages: FeedbackMessage[];
  skillNames?: Record<string, string>;
}

/**
 * Renders feedback per skill, joining SkillScore and FeedbackMessage by skillId.
 * Displays skill name, score with progress bar, band badge, feedback summary,
 * specificTip, and optional timestamp hint.
 */
export function FeedbackView(props: FeedbackViewProps): ReactNode {
  const { skillScores, feedbackMessages, skillNames } = props;

  // Group feedback messages by skillId for quick lookup
  const feedbackBySkill = new Map<string, FeedbackMessage[]>();
  for (const feedback of feedbackMessages) {
    const existing = feedbackBySkill.get(feedback.skillId) || [];
    existing.push(feedback);
    feedbackBySkill.set(feedback.skillId, existing);
  }

  // If no scores, render empty state
  if (skillScores.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No feedback yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {skillScores.map((score) => {
        const skillName = skillNames?.[score.skillId] ?? score.skillId;
        const feedbackList = feedbackBySkill.get(score.skillId) || [];
        const firstFeedback = feedbackList[0];

        // Calculate progress percentage (score is 0..100)
        const progressPercent = Math.min(100, Math.max(0, score.score));

        return (
          <Card key={score.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{skillName}</CardTitle>
                <div className={cn('px-3 py-1 rounded-md text-sm font-medium', bandClasses(score.band))}>
                  {bandLabel(score.band)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Score and Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="text-2xl font-bold text-foreground">{score.score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Feedback */}
              {firstFeedback && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  {firstFeedback.summary && (
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Feedback: </span>
                      {firstFeedback.summary}
                    </p>
                  )}
                  {firstFeedback.specificTip && (
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Tip: </span>
                      {firstFeedback.specificTip}
                    </p>
                  )}
                  {firstFeedback.timestampRef !== null && (
                    <p className="text-xs text-muted-foreground pt-1">
                      at {formatTimestamp(firstFeedback.timestampRef)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Format seconds into MM:SS format.
 */
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
