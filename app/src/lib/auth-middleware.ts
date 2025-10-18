import { createMiddleware } from "@tanstack/react-start";
import {
  ensureAdminRole,
  ensureAnyRole,
  ensureMemberRole,
  hasAdminRole,
  hasAnyRole,
  hasMemberRole,
  syncViewer,
} from "./auth";

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

  return next({
    context: {
      viewer,
      /**
       * Check if viewer has any role in the workspace (or is a superuser)
       */
      hasAnyRole: (workspaceId: string) => {
        return hasAnyRole(viewer, workspaceId);
      },
      /**
       * Check if viewer has the member role in the workspace (or is a
       * superuser)
       */
      hasMemberRole: (workspaceId: string) => {
        return hasMemberRole(viewer, workspaceId);
      },
      /**
       * Check if viewer has the admin role in the workspace (or is a superuser)
       */
      hasAdminRole: (workspaceId: string) => {
        return hasAdminRole(viewer, workspaceId);
      },
      /**
       * Ensure viewer has any role in the workspace (or is a superuser), throw
       * notFound if not
       */
      ensureAnyRole: (workspaceId: string) => {
        ensureAnyRole(viewer, workspaceId);
      },
      /**
       * Ensure viewer has the member role in the workspace (or is a superuser),
       * throw notFound if not
       */
      ensureMemberRole: (workspaceId: string) => {
        ensureMemberRole(viewer, workspaceId);
      },
      /**
       * Ensure viewer has the admin role in the workspace (or is a superuser),
       * throw notFound if not
       */
      ensureAdminRole: (workspaceId: string) => {
        ensureAdminRole(viewer, workspaceId);
      },
    },
  });
});
