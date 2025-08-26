import {
  clerkClient,
  getAuth,
  type User as ClerkUser,
} from "@clerk/tanstack-react-start/server";
import { invariant } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { sql } from "drizzle-orm";
import { db, schema } from "~/postgres/db";

/**
 * Fetch the clerk user id from the Clerk API
 */
async function fetchClerkUserId(request: Request) {
  const { userId: clerkUserId } = await getAuth(request);
  invariant(clerkUserId, "Unauthorized");

  return clerkUserId;
}

/**
 * Fetch the clerk user from the Clerk API
 *
 * This is about 10x slower than fetchClerkUserId, so we only use it when
 * we need to get the user's email address.
 */
async function fetchClerkUser(clerkUserId: string) {
  return clerkClient().users.getUser(clerkUserId);
}

/**
 * Get the primary email address from a clerk user
 */
function getClerkPrimaryEmailAddress(clerkUser: ClerkUser) {
  const email = clerkUser.primaryEmailAddress?.emailAddress;

  // Users always have an email address since we're using the email address to
  // sign up/in
  invariant(email, "Unauthorized");

  return email;
}

/**
 * Upsert viewer - syncs the clerk user to our database
 */
async function upsertViewer(clerkUserId: string) {
  const [viewer] = await db()
    .insert(schema.users)
    .values({
      clerkUserId,
      email: "PENDING",
    })
    .onConflictDoUpdate({
      target: [schema.users.clerkUserId],
      set: { updatedAt: sql`now()` },
    })
    .returning();

  invariant(viewer, "Failed to upsert viewer");

  return viewer;
}

async function refreshViewerEmail(clerkUserId: string) {
  const clerkUser = await fetchClerkUser(clerkUserId);
  const email = getClerkPrimaryEmailAddress(clerkUser);

  await db()
    .insert(schema.users)
    .values({ clerkUserId, email })
    .onConflictDoUpdate({
      target: [schema.users.clerkUserId],
      set: { email, updatedAt: sql`now()` },
    });
}

export const ensureViewerMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  console.log("🔧 Clerk middleware");

  // Get the clerk user id
  const clerkUserId = await fetchClerkUserId(getWebRequest());

  // Upsert the viewer in the foreground
  const viewer = await upsertViewer(clerkUserId);

  // Refresh the viewer email in the background
  void refreshViewerEmail(clerkUserId);

  return next({
    context: {
      viewer,
    },
  });
});
