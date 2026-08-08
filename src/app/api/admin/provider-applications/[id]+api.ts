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

    // استخراج ID من URL
    const url =
      new URL(
        request.url
      );

    const parts =
      url.pathname
        .split("/")
        .filter(Boolean);

    const providerId =
      parts[
        parts.length - 1
      ];

    if (!providerId) {
      throw new Error(
        "Provider ID is required"
      );
    }

    const {
      getProviderApplicationDetails,
    } = await import(
      "@/lib/server/admin-provider-actions"
    );

    const result =
      await getProviderApplicationDetails(
        providerId
      );

    return Response.json(
      result
    );

  } catch (error) {
    console.error(
      "ADMIN PROVIDER DETAILS ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load provider application";

    let status = 400;

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

    if (
      message ===
      "Provider application not found"
    ) {
      status = 404;
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

// ========================================
// APPROVE / REJECT
// ADMIN ONLY
// ========================================

export async function PATCH(
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

    const url =
      new URL(
        request.url
      );

    const parts =
      url.pathname
        .split("/")
        .filter(Boolean);

    const providerId =
      parts[
        parts.length - 1
      ];

    if (!providerId) {
      throw new Error(
        "Provider ID is required"
      );
    }

    const body =
      await request.json();

    const action =
      String(
        body.action ?? ""
      );

    if (
      action === "approve"
    ) {
      const {
        approveProviderApplication,
      } = await import(
        "@/lib/server/admin-provider-actions"
      );

      const application =
        await approveProviderApplication(
          providerId
        );

      return Response.json({
        success: true,
        application,
      });
    }


    if (
      action === "reject"
    ) {
      const {
        rejectProviderApplication,
      } = await import(
        "@/lib/server/admin-provider-actions"
      );

      const application =
        await rejectProviderApplication(
          providerId,
          String(
            body.reason ?? ""
          )
        );

      return Response.json({
        success: true,
        application,
      });
    }


    throw new Error(
      "Invalid action"
    );

  } catch (error) {
    console.error(
      "ADMIN PROVIDER DECISION ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update application";

    let status = 400;

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