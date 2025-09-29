import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { sql } from "drizzle-orm";
import { getClerkUser } from "~/auth/clerk";
import { db, schema } from "~/postgres/db";

/**
 * Upsert the viewer in the database from the Clerk API
 */
export async function upsertViewer(clerkUser: { id: string; email: string }) {
  const t = performance.now();
  const [viewer] = await db()
    .insert(schema.users)
    .values({
      clerkUserId: clerkUser.id,
      email: clerkUser.email,
    })
    .onConflictDoUpdate({
      target: [schema.users.clerkUserId],
      set: {
        email: clerkUser.email,
        // Only update the updatedAt field if the email is different
        updatedAt: sql`case when excluded.email is distinct from ${schema.users.email} then now() else ${schema.users.updatedAt} end`,
      },
    })
    .returning();

  console.debug("upsertViewer", performance.now() - t);

  return viewer ?? null;
}

/**
 * Middleware to ensure the viewer is signed in and has a viewer record in the
 * database.
 */
export const ensureViewerMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  // Get the current clerk user id
  const clerkUser = await getClerkUser(getWebRequest());

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const t = performance.now();
  const viewer = await upsertViewer(clerkUser);
  console.debug("upsertViewer", performance.now() - t);

  if (!viewer) {
    throw new Error("Unauthorized");
  }

  return next({ context: { viewer } });
});
