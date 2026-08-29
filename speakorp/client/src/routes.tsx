// Client route registry — the frontend extension point.
//
// Each frontend feature adds a page under client/src/pages/ and appends a route
// entry here. App.tsx builds both the router and the top-nav from this array,
// so feature branches touch only this one small list plus their own page file.

import type { ReactNode } from 'react';
import { HomePage } from './pages/HomePage';
import { LessonRunner } from './pages/LessonRunner';

export interface AppRoute {
  path: string;
  /** Nav label; omit `nav` to keep it out of the top nav. */
  label: string;
  nav?: boolean;
  element: ReactNode;
}

export const appRoutes: AppRoute[] = [
  { path: '/', label: 'Home', nav: true, element: <HomePage /> },
  { path: '/lessons/:id', label: 'Lesson', nav: false, element: <LessonRunner /> },
];
