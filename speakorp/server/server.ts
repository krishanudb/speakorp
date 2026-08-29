import { createApp, server, serving } from '@databricks/appkit';
import { routeRegistrars, type RouteContext } from './routes/registry';
import type { ServingHandle } from './routes/context';

await createApp({
  plugins: [server(), serving()],
  async onPluginsReady(appkit) {
    // Adapt the serving plugin to our minimal structural handle; tolerate it
    // being unconfigured locally so the rest of the API still boots.
    let servingHandle: ServingHandle | null = null;
    try {
      const s = appkit.serving();
      servingHandle = {
        invoke: (req) => s.invoke(req),
      };
    } catch (err) {
      console.warn('[speakorp] serving plugin unavailable; AI feedback will be degraded:', err);
    }

    const ctx: RouteContext = { serving: servingHandle };

    appkit.server.extend((app) => {
      for (const register of routeRegistrars) {
        register(app, ctx);
      }
    });
  },
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
