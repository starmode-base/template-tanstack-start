import { getAuth } from "@clerk/tanstack-react-start/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { sql } from "drizzle-orm";
import { db, schema } from "~/postgres/db";

/**
 * Fetch the clerk user from the Clerk API
 */
const getClerkUser = async (request: Request) => {
  const { sessionClaims, userId, isAuthenticated } = await getAuth(request);

  if (!isAuthenticated) {
    return null;
  }

  if (typeof sessionClaims.email !== "string") {
    console.warn(
      "No email found in claims, see https://clerk.com/docs/backend-requests/custom-session-token",
    );

    return null;
  }

  return { id: userId, email: sessionClaims.email };
};

/**
 * Upsert the viewer in the database from the Clerk API
 */
async function upsertViewer(clerkUser: { id: string; email: string }) {
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

  return viewer ?? null;
}

/**
 * Sync the Clerk user (email address) with the database and return the viewer,
 * or null if the user is not signed in.
 */
export async function syncViewer() {
  const t = performance.now();

  const clerkUserId = await getClerkUser(getWebRequest());

  if (!clerkUserId) {
    return null;
  }

  // Upsert and return the updated viewer
  const viewer = await upsertViewer(clerkUserId);

  console.debug("syncViewer", performance.now() - t);
  return viewer;
}
