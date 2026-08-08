export async function GET(
  request: Request
) {
  try {
    const {
      requireAdminUserId,
    } = await import(
      "@/lib/server/auth"
    );

    await requireAdminUserId(
      request
    );

    return Response.json({
      isAdmin: true,
    });

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to check admin";

    if (
      message === "Unauthorized" ||
      message === "Forbidden"
    ) {
      return Response.json({
        isAdmin: false,
      });
    }

    return Response.json(
      {
        isAdmin: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}