import { createMiddleware } from "@tanstack/react-start";
import { syncViewer } from "./auth";

/**
 * Middleware to ensure the viewer is signed in and has a viewer record in the
 * database.
 */
export const ensureViewerMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const viewer = await syncViewer();

  if (!viewer) {
    throw new Error("Unauthorized");
  }

  return next({ context: { viewer } });
});
