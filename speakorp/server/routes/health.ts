import type { RouteRegistrar } from './registry';

/** Basic liveness/readiness route; also confirms the API layer is mounted. */
export const registerHealthRoutes: RouteRegistrar = (app) => {
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'speakorp', ts: Date.now() });
  });
};
