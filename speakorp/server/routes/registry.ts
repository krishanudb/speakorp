// Route-registry extension point.
//
// Each backend feature adds a route module under server/routes/ that exports a
// `RouteRegistrar`, then appends it to the `routeRegistrars` array below. This
// keeps server.ts stable and confines cross-feature edits to a single, small,
// easy-to-merge list.

import type { Application } from 'express';
import type { ServingHandle } from './context';
import { registerHealthRoutes } from './health';
import { registerSessionsRoutes } from './sessions';

export interface RouteContext {
  /** Serving-plugin handle for LLM calls, or null when not configured. */
  serving: ServingHandle | null;
}

export type RouteRegistrar = (app: Application, ctx: RouteContext) => void;

/** All feature route registrars. Feature branches append their entry here. */
export const routeRegistrars: RouteRegistrar[] = [
  registerHealthRoutes,
  registerSessionsRoutes,
];
