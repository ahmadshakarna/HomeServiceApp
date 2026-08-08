import { createClerkClient } from "@clerk/backend";

const secretKey =
  process.env.CLERK_SECRET_KEY;

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!secretKey) {
  throw new Error(
    "CLERK_SECRET_KEY is missing"
  );
}

if (!publishableKey) {
  throw new Error(
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing"
  );
}

const clerkClient =
  createClerkClient({
    secretKey,
    publishableKey,
  });

export async function requireUserId(
  request: Request
) {
  const requestState =
    await clerkClient.authenticateRequest(
      request,
      {
        acceptsToken:
          "session_token",
      }
    );

  if (
    !requestState.isAuthenticated
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  const auth =
    requestState.toAuth();

  if (!auth.userId) {
    throw new Error(
      "Unauthorized"
    );
  }

  return auth.userId;
}