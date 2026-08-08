// ========================================
// GET PENDING PROVIDER APPLICATIONS
// ADMIN ONLY
// ========================================

export async function GET(
  request: Request
) {
  try {
    const {
      requireAdminUserId,
    } = await import(
      "@/lib/server/auth"
    );

    // إذا المستخدم مش Admin
    // الطلب يتوقف هنا
    await requireAdminUserId(
      request
    );

    const {
      listPendingProviderApplications,
    } = await import(
      "@/lib/server/admin-provider-actions"
    );

    const applications =
      await listPendingProviderApplications();

    return Response.json({
      applications,
    });

  } catch (error) {
    console.error(
      "ADMIN PROVIDER APPLICATIONS ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load applications";

    let status = 500;

    if (
      message ===
      "Unauthorized"
    ) {
      status = 401;
    }

    if (
      message ===
      "Forbidden"
    ) {
      status = 403;
    }

    return Response.json(
      {
        error: message,
      },
      {
        status,
      }
    );
  }
}