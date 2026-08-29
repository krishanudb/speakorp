import { Card, CardContent, CardHeader, CardTitle } from '@databricks/appkit-ui/react';
import { getEntries, getCompletedLessonIds, rollingByWeek } from '@/lib/progressStore';

/**
 * Progress Dashboard: visualizes per-skill weekly rolling scores and completed lesson count.
 * Shows an empty state if no progress entries exist yet.
 */
export function ProgressDashboard() {
  const entries = getEntries();
  const completedLessonIds = getCompletedLessonIds();
  const weeklyScores = rollingByWeek(entries);

  if (entries.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-6">
        <Card>
          <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
            <p className="text-lg">Complete a lesson to see your progress</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract unique weeks and skills for chart rendering
  const weeks = Array.from(new Set(weeklyScores.map((s) => s.week))).sort((a, b) => a - b);
  const skills = Array.from(new Set(weeklyScores.map((s) => s.skillId))).sort();

  // Assign colors to skills
  const skillColors: Record<string, string> = {
    'vocal.breath_support': '#4F46E5', // indigo
    'vocal.pacing': '#06B6D4', // cyan
    'vocal.clarity': '#8B5CF6', // purple
    'presence.posture': '#EC4899', // pink
    'presence.energy': '#F59E0B', // amber
    'presence.eye_contact': '#10B981', // emerald
    'storytelling.structure': '#6366F1', // indigo-light
    'storytelling.hook': '#14B8A6', // teal
    'storytelling.delivery': '#EF4444', // red
  };

  // Default colors for unknown skills
  const skillColorList = [
    '#4F46E5', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B',
    '#10B981', '#6366F1', '#14B8A6', '#EF4444', '#3B82F6',
  ];
  let colorIndex = 0;

  const getSkillColor = (skillId: string): string => {
    if (skillColors[skillId]) return skillColors[skillId];
    const color = skillColorList[colorIndex % skillColorList.length];
    colorIndex++;
    return color;
  };

  // Create a map of skill -> color
  const skillToColor = new Map<string, string>();
  for (const skill of skills) {
    skillToColor.set(skill, getSkillColor(skill));
  }

  // SVG chart dimensions
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 50, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Scale functions
  const minWeek = Math.min(...weeks);
  const maxWeek = Math.max(...weeks);
  const weekRange = maxWeek - minWeek || 1;

  const scaleX = (week: number) =>
    padding.left + ((week - minWeek) / weekRange) * plotWidth;

  const scaleY = (score: number) =>
    padding.top + plotHeight - (score / 100) * plotHeight;

  // Build path data for each skill
  const paths: Array<{ skillId: string; pathData: string; color: string }> = [];

  for (const skill of skills) {
    const skillData = weeklyScores
      .filter((s) => s.skillId === skill)
      .sort((a, b) => a.week - b.week);

    if (skillData.length > 0) {
      const points = skillData.map((d) => `${scaleX(d.week)},${scaleY(d.rollingScore)}`);
      const pathData = `M ${points.join(' L ')}`;
      paths.push({
        skillId: skill,
        pathData,
        color: skillToColor.get(skill) || '#000',
      });
    }
  }

  // Build x-axis labels
  const xAxisLabels = weeks.map((week) => ({
    week,
    x: scaleX(week),
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 mt-6">
      {/* Completed Lessons Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span> Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">{completedLessonIds.length}</span>{' '}
            lesson{completedLessonIds.length !== 1 ? 's' : ''} completed
          </p>
        </CardContent>
      </Card>

      {/* Weekly Trendline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Skill Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full min-w-[600px] border border-border rounded"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((score) => (
                <line
                  key={`grid-${score}`}
                  x1={padding.left}
                  y1={scaleY(score)}
                  x2={chartWidth - padding.right}
                  y2={scaleY(score)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              ))}

              {/* Y-axis */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={chartHeight - padding.bottom}
                stroke="#000"
                strokeWidth="2"
              />

              {/* X-axis */}
              <line
                x1={padding.left}
                y1={chartHeight - padding.bottom}
                x2={chartWidth - padding.right}
                y2={chartHeight - padding.bottom}
                stroke="#000"
                strokeWidth="2"
              />

              {/* Y-axis labels */}
              {[0, 25, 50, 75, 100].map((score) => (
                <text
                  key={`y-label-${score}`}
                  x={padding.left - 10}
                  y={scaleY(score) + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#666"
                >
                  {score}
                </text>
              ))}

              {/* X-axis labels */}
              {xAxisLabels.map(({ week, x }) => (
                <text
                  key={`x-label-${week}`}
                  x={x}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                >
                  W{week}
                </text>
              ))}

              {/* Skill lines */}
              {paths.map(({ skillId, pathData, color }) => (
                <path
                  key={`line-${skillId}`}
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Data points */}
              {weeklyScores.map((score, idx) => (
                <circle
                  key={`point-${idx}`}
                  cx={scaleX(score.week)}
                  cy={scaleY(score.rollingScore)}
                  r="4"
                  fill={skillToColor.get(score.skillId) || '#000'}
                  opacity="0.8"
                />
              ))}

              {/* Y-axis label */}
              <text
                x={20}
                y={padding.top + plotHeight / 2}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
                transform={`rotate(-90 20 ${padding.top + plotHeight / 2})`}
              >
                Score
              </text>

              {/* X-axis label */}
              <text
                x={padding.left + plotWidth / 2}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                Week
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {skills.map((skill) => (
              <div key={skill} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: skillToColor.get(skill) }}
                />
                <span className="text-muted-foreground">{skill}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
