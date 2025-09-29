import { createMiddleware } from "@tanstack/react-start";
import { syncViewer } from "./auth";

/**
 * Middleware to ensure the viewer is signed in and has a viewer record in the
 * database.
 */
export const ensureViewerMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const t = performance.now();

  // Get the current clerk user id
  const viewer = await syncViewer();

  if (!viewer) {
    throw new Error("Unauthorized");
  }

  console.debug("ensureViewerMiddleware", performance.now() - t);
  return next({ context: { viewer } });
});
