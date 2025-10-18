import { auth } from "@clerk/tanstack-react-start/server";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "~/postgres/db";
import { memoizeAsync } from "./memoize";
import type { WorkspaceMemberRole } from "~/postgres/schema";

/**
 * Viewer type
 */
export interface Viewer {
  id: string;
  email: string;
  workspaceMemberships: {
    workspaceId: string;
    role: WorkspaceMemberRole;
  }[];
  workspaceIds: string[];
  memberWorkspaceIds: string[];
  adminWorkspaceIds: string[];
  isSuperuser: boolean;
}

/**
 * Fetch the currently authenticated Clerk user from the Clerk API
 */
const getClerkUser = async () => {
  const { sessionClaims, userId, isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return null;
  }

  if (typeof sessionClaims.email !== "string") {
    console.warn(
      [
        "No email found in claims, see https://clerk.com/docs/guides/sessions/customize-session-tokens",
        "",
        "Customize the Clerksession token claims to include the email address:",
        "",
        "```json",
        JSON.stringify({ email: "{{user.primary_email_address}}" }, null, 2),
        "```",
      ].join("\n"),
    );

    return null;
  }

  return { id: userId, email: sessionClaims.email };
};

/**
 * Get the viewer (the currently authenticated user) with their workspace
 * memberships
 */
async function getViewer(userId: string): Promise<Viewer | null> {
  const userWithMemberships = await db().query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: {
      id: true,
      email: true,
      isSuperuser: true,
    },
    with: {
      workspaceMemberships: {
        columns: {
          workspaceId: true,
          role: true,
        },
      },
    },
  });

  if (!userWithMemberships) {
    return null;
  }

  const viewer = {
    id: userWithMemberships.id,
    email: userWithMemberships.email,
    workspaceMemberships: userWithMemberships.workspaceMemberships,
    workspaceIds: userWithMemberships.workspaceMemberships.map(
      (membership) => membership.workspaceId,
    ),
    memberWorkspaceIds: userWithMemberships.workspaceMemberships
      .filter((member) => member.role === "member")
      .map((member) => member.workspaceId),
    adminWorkspaceIds: userWithMemberships.workspaceMemberships
      .filter((member) => member.role === "administrator")
      .map((member) => member.workspaceId),
    isSuperuser: userWithMemberships.isSuperuser,
  };

  return viewer;
}

/**
 * Upsert the viewer in the database from the Clerk API
 *
 * This syncs the user's email from Clerk to our database.
 * Returns the internal user ID.
 */
async function upsertViewer(clerkUser: {
  id: string;
  email: string;
}): Promise<string> {
  const [user] = await db()
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
    .returning({ id: schema.users.id });

  if (!user) {
    throw new Error("Failed to sync user");
  }

  return user.id;
}

/**
 * Memoize the getViewer function
 */
const getViewerMemoized = memoizeAsync(getViewer, 5000, (userId) => userId);

/**
 * Memoize the upsertViewer function
 */
const upsertViewerMemoized = memoizeAsync(
  upsertViewer,
  5000,
  (clerkUser) => clerkUser.id + clerkUser.email,
);

/**
 * Sync the Clerk user (email address) with the database and return the viewer
 *
 * Returns the viewer object with memberships, or null if the user is not signed in
 */
export async function syncViewer(): Promise<Viewer | null> {
  const clerkUser = await getClerkUser();

  if (!clerkUser) {
    return null;
  }

  const userId = await upsertViewerMemoized(clerkUser);
  const viewer = await getViewerMemoized(userId);

  return viewer;
}

/**
 * Clear a specific user's viewer cache
 *
 * IMPORTANT: Call this after operations that change organization memberships or
 * superuser status - eg. fields retuned by syncViewer().
 */
export function clearViewerCache(userId: string) {
  getViewerMemoized.clear(userId);
}

/**
 * Clear all viewer caches
 *
 * For test cleanup only. Call after deleting users from the database.
 */
export function clearAllViewerCaches() {
  getViewerMemoized.clear();
  upsertViewerMemoized.clear();
}
