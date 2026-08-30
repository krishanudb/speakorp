import { useState, useEffect } from 'react';
import { Card, CardContent } from '@databricks/appkit-ui/react';
import { NavLink } from 'react-router';
import type { LessonSummary } from '@shared/api';
import { api } from '../lib/api';

export function ProgramOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);

  useEffect(() => {
    api
      .listLessons()
      .then((response) => {
        setLessons(response.lessons);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load lessons');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="max-w-3xl mx-auto mt-6">Loading lessons...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto mt-6 text-red-600">Error: {error}</div>;
  }

  if (lessons.length === 0) {
    return <div className="max-w-3xl mx-auto mt-6">No lessons found.</div>;
  }

  // Group lessons by week
  const grouped = new Map<number, LessonSummary[]>();
  for (const lesson of lessons) {
    if (!grouped.has(lesson.week)) {
      grouped.set(lesson.week, []);
    }
    grouped.get(lesson.week)!.push(lesson);
  }

  // Sort weeks and lessons within each week
  const sortedWeeks = Array.from(grouped.keys()).sort((a, b) => a - b);

  const dayTypeLabel = (dayType: string) => {
    const labels: Record<string, string> = {
      isolated: 'Isolated',
      combo: 'Combo',
      integration: 'Integration',
    };
    return labels[dayType] || dayType;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-6 pb-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">4-Week Program</h2>
        <p className="text-lg text-muted-foreground">
          20 lessons across four weeks, building from isolated skills to integrated scenarios.
        </p>
      </div>

      {sortedWeeks.map((week) => (
        <div key={week} className="space-y-4">
          <h3 className="text-2xl font-semibold text-foreground">Week {week}</h3>
          <div className="space-y-3">
            {grouped
              .get(week)!
              .sort((a, b) => a.day - b.day)
              .map((lesson) => (
                <NavLink
                  key={lesson.id}
                  to={`/lessons/${lesson.id}`}
                  className="block no-underline"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-muted-foreground">
                              Day {lesson.day}
                            </span>
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                              {dayTypeLabel(lesson.dayType)}
                            </span>
                            {lesson.requiresVideo && (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                video
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">
                            {lesson.title}
                          </h4>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </NavLink>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
