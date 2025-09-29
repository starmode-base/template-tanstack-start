import { getAuth } from "@clerk/tanstack-react-start/server";

/**
 * Fetch the clerk user from the Clerk API
 */
export const getClerkUser = async (request: Request) => {
  const { sessionClaims, userId, isAuthenticated } = await getAuth(request);

  const email = sessionClaims?.email;

  if (typeof email !== "string") {
    console.warn(
      "No email found in claims, see https://clerk.com/docs/backend-requests/custom-session-token",
    );

    return null;
  }

  if (!isAuthenticated || !userId) {
    return null;
  }

  return { id: userId, email };
};
