// Client route registry — the frontend extension point.
//
// Each frontend feature adds a page under client/src/pages/ and appends a route
// entry here. App.tsx builds both the router and the top-nav from this array,
// so feature branches touch only this one small list plus their own page file.

import type { ReactNode } from 'react';
import { HomePage } from './pages/HomePage';
import { ProgressDashboard } from './pages/ProgressDashboard';

export interface AppRoute {
  path: string;
  /** Nav label; omit `nav` to keep it out of the top nav. */
  label: string;
  nav?: boolean;
  element: ReactNode;
}

export const appRoutes: AppRoute[] = [
  { path: '/', label: 'Home', nav: true, element: <HomePage /> },
  { path: '/progress', label: 'Progress', nav: true, element: <ProgressDashboard /> },
];
