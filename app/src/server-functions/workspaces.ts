import { createServerFn } from "@tanstack/react-start";
import { eq, inArray, sql } from "drizzle-orm";
import invariant from "tiny-invariant";
import z from "zod";
import { ensureViewerMiddleware } from "~/lib/auth-middleware";
import { OrganizationName, SecureToken } from "~/lib/validators";
import { db, schema } from "~/postgres/db";

/**
 * Create workspace
 *
 * Any authenticated user can create a workspace, becomes an _administrator_ of
 * the created workspace
 */
export const createWorkspaceSF = createServerFn()
  .middleware([ensureViewerMiddleware])
  .inputValidator(z.object({ name: OrganizationName }))
  .handler(async ({ data: input, context }) => {
    await db().transaction(async (tx) => {
      const [workspace] = await tx
        .insert(schema.workspaces)
        .values({ name: input.name })
        .returning();

      invariant(workspace, "Failed to insert workspace");

      await tx.insert(schema.workspaceMemberships).values({
        role: "administrator",
        userId: context.viewer.id,
        workspaceId: workspace.id,
      });

      return workspace;
    });
  });

/**
 * Update workspace
 *
 * Viewer must be an _administrator_ of the workspace or a _superuser_
 */
export const updateWorkspaceSF = createServerFn()
  .middleware([ensureViewerMiddleware])
  .inputValidator(z.object({ id: SecureToken, name: OrganizationName }))
  .handler(async ({ data: input, context }) => {
    context.ensureAdminRole(input.id);

    await db().transaction(async (tx) => {
      const [workspace] = await tx
        .update(schema.workspaces)
        .set({ name: input.name })
        .where(eq(schema.workspaces.id, input.id))
        .returning();

      invariant(workspace, "Failed to update workspace");

      return workspace;
    });
  });

/**
 * Delete workspace
 *
 * Viewer must be an _administrator_ of the workspace or a _superuser_
 */
export const deleteWorkspaceSF = createServerFn()
  .middleware([ensureViewerMiddleware])
  .inputValidator(z.object({ id: SecureToken }))
  .handler(async ({ data: input, context }) => {
    context.ensureAdminRole(input.id);

    const [workspace] = await db()
      .delete(schema.workspaces)
      .where(eq(schema.workspaces.id, input.id))
      .returning();

    invariant(workspace, "Failed to delete workspace");

    return workspace;
  });

/**
 * Get workspace
 *
 * Returns the workspace for the given ID if the viewer has _any_ role in the
 * workspace or is a _superuser_
 */
export const getWorkspaceSF = createServerFn()
  .middleware([ensureViewerMiddleware])
  .inputValidator(z.object({ id: SecureToken }))
  .handler(async ({ data: input, context }) => {
    context.ensureAnyRole(input.id);

    const workspace = await db()
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, input.id));

    invariant(workspace, "Workspace not found");

    return workspace;
  });

/**
 * List workspaces
 *
 * Returns the list of workspaces where the viewer has _any_ role, or all
 * workspaces if the viewer is a _superuser_
 */
export const listWorkspacesSF = createServerFn()
  .middleware([ensureViewerMiddleware])
  .handler(async ({ context }) => {
    const workspaces = await db().query.workspaces.findMany({
      where: context.viewer.isSuperuser
        ? sql`true`
        : inArray(schema.workspaces.id, context.viewer.workspaceIds),
    });

    return workspaces;
  });
