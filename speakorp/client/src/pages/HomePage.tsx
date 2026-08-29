import { Card, CardContent, CardHeader, CardTitle } from '@databricks/appkit-ui/react';
import { NavLink } from 'react-router';

/** Landing page: what the app is + entry points into the program. */
export function HomePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Executive Communication Practice</h2>
        <p className="text-lg text-muted-foreground">
          Daily 15–25 minute speaking drills across three pillars — vocal command, executive
          presence, and storytelling — with AI feedback scored against a per-skill rubric.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Each session runs a warmup, targeted drills, and one applied scenario you record.
            Your recording is analyzed and scored, and you get specific coaching plus a progress
            trendline over the 20-lesson (4-week) program.
          </p>
          <p>
            <NavLink to="/lessons" className="text-primary underline underline-offset-4">
              Browse the program →
            </NavLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
