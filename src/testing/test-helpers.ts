import invariant from "tiny-invariant";
import { and, eq } from "drizzle-orm";
import { db, schema } from "~/postgres/db";
import { clearViewerCache, syncViewer } from "~/lib/auth";
import { mockAuth } from "vitest.clerk.setup";

/**
 * Creates a barrier that blocks until `count` callers have arrived, then
 * releases all of them simultaneously
 */
export function createBarrier(count: number) {
  let arrived = 0;
  let release: () => void;

  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });

  return async () => {
    arrived++;

    if (arrived === count) {
      release();
    }

    await barrier;
  };
}

/**
 * Test actors for switching between different authentication states
 */
export const act = {
  /**
   * Act as a regular user (not a superuser).
   * Creates the user in the database if needed.
   * Ensures the user is NOT a superuser.
   * Safe to call multiple times.
   */
  asUser: async (clerkUserId: string) => {
    mockAuth.authenticated(clerkUserId, `${clerkUserId}@example.com`);
    const viewer = await syncViewer();
    invariant(viewer);

    // Ensure user is NOT a superuser
    const [user] = await db()
      .update(schema.users)
      .set({ isSuperuser: false })
      .where(
        and(
          eq(schema.users.clerkUserId, clerkUserId),
          // Only update if the user is currently a superuser
          eq(schema.users.isSuperuser, true),
        ),
      )
      .returning({ id: schema.users.id, email: schema.users.email });

    if (user) {
      // Clear viewer cache since superuser status changed
      clearViewerCache(user.id);
    }

    return { id: viewer.id, email: viewer.email };
  },

  /**
   * Act as a superuser.
   * Creates the user in the database if needed.
   * Safe to call multiple times.
   */
  asSuperuser: async (clerkUserId: string) => {
    mockAuth.authenticated(clerkUserId, `${clerkUserId}@example.com`);
    const viewer = await syncViewer();
    invariant(viewer);

    const [user] = await db()
      .update(schema.users)
      .set({ isSuperuser: true })
      .where(
        and(
          eq(schema.users.clerkUserId, clerkUserId),
          // Only update if the user is currently a regular user
          eq(schema.users.isSuperuser, false),
        ),
      )
      .returning({ id: schema.users.id, email: schema.users.email });

    if (user) {
      // Clear viewer cache since superuser status changed
      clearViewerCache(user.id);
    }

    return { id: viewer.id, email: viewer.email };
  },

  /**
   * Act as an unauthenticated (anonymous) user.
   */
  asAnonymous: () => {
    mockAuth.unauthenticated();
  },
};
