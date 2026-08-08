export async function POST(
  request: Request
) {
  try {
    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );

    const userId =
      await requireUserId(
        request
      );

    const {
      submitProviderApplication,
    } = await import(
      "@/lib/server/provider-application-actions"
    );

    const application =
      await submitProviderApplication(
        userId
      );

    return Response.json({
      success: true,
      application,
    });

  } catch (error) {
    console.error(
      "SUBMIT PROVIDER APPLICATION ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit application";

    return Response.json(
      {
        error: message,
      },
      {
        status:
          message ===
          "Unauthorized"
            ? 401
            : 400,
      }
    );
  }
}