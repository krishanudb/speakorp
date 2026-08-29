import { createApp, server, serving } from '@databricks/appkit';
import { routeRegistrars, type RouteContext } from './routes/registry';
import type { ServingHandle, ServingModelResponse } from './routes/context';

await createApp({
  plugins: [server(), serving()],
  async onPluginsReady(appkit) {
    // Adapt the serving plugin to our minimal structural handle. serving() does
    // not validate configuration, so we gate on the endpoint env var: when it's
    // absent (typical local dev), expose `serving: null` and let routes degrade
    // gracefully instead of hitting an error on first invoke.
    let servingHandle: ServingHandle | null = null;
    if (process.env.DATABRICKS_SERVING_ENDPOINT_NAME) {
      const s = appkit.serving();
      servingHandle = {
        async invoke(req) {
          const res = await s.invoke(req);
          // Normalize the ExecutionResult wrapper returned at runtime; if the
          // raw completion comes back instead, pass it through unchanged.
          const wrapper = res as {
            ok?: boolean;
            data?: ServingModelResponse;
            status?: number;
            message?: string;
          };
          if (typeof wrapper.ok === 'boolean') {
            if (!wrapper.ok) {
              throw new Error(`serving invoke failed (${wrapper.status}): ${wrapper.message}`);
            }
            return wrapper.data ?? {};
          }
          return res;
        },
      };
    } else {
      console.warn('[speakorp] DATABRICKS_SERVING_ENDPOINT_NAME unset; AI feedback degraded.');
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
