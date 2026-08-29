import { NavLink } from 'react-router';

/** Friendly fallback for unknown routes (including feature routes not yet added). */
export function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto text-center space-y-4 mt-16">
      <h2 className="text-2xl font-semibold text-foreground">Page not found</h2>
      <p className="text-muted-foreground">
        That screen isn’t available yet.
      </p>
      <NavLink to="/" className="text-primary underline underline-offset-4">
        Back to home →
      </NavLink>
    </div>
  );
}
