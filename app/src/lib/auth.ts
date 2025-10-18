import { auth } from "@clerk/tanstack-react-start/server";
import { sql } from "drizzle-orm";
import { db, schema } from "~/postgres/db";
import { memoizeAsync } from "./memoize";

/**
 * Fetch the clerk user from the Clerk API
 */
const getClerkUser = async () => {
  const { sessionClaims, userId, isAuthenticated } = await auth();

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

const upsertViewerMemoized = memoizeAsync(
  upsertViewer,
  5000,
  (clerkUser) => clerkUser.id + clerkUser.email,
);

/**
 * Sync the Clerk user (email address) with the database and return the viewer,
 * or null if the user is not signed in.
 */
export async function syncViewer() {
  const t = performance.now();

  const clerkUser = await getClerkUser();

  if (!clerkUser) {
    return null;
  }

  const viewer = await upsertViewerMemoized(clerkUser);

  console.debug("syncViewer", performance.now() - t);
  return viewer;
}
