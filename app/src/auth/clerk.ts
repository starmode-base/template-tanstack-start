import { getAuth } from "@clerk/tanstack-react-start/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { upsertViewer } from "~/middleware/auth-middleware";

/**
 * Fetch the clerk user from the Clerk API
 */
export const getClerkUser = async (request: Request) => {
  const t = performance.now();

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

  console.debug("getClerkUser", performance.now() - t);
  return { id: userId, email: sessionClaims.email };
};

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
