import { getAuth } from "@clerk/tanstack-react-start/server";
import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db, schema } from "~/postgres/db";

/**
 * Fetch the clerk user id from the Clerk API
 */
async function fetchClerkUserId(request: Request) {
  const session = await getAuth(request);

  return session.userId;
}

/**
 * Get the viewer from the database
 */
async function selectViewer(clerkUserId: string) {
  const viewer = await db().query.users.findFirst({
    where: eq(schema.users.clerkUserId, clerkUserId),
  });

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
  const clerkUserId = await fetchClerkUserId(getWebRequest());

  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const viewer = await selectViewer(clerkUserId);

  if (!viewer) {
    throw new Error("Unauthorized");
  }

  return next({ context: { viewer } });
});
