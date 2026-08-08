export async function GET(
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
      getProviderDashboard,
    } = await import(
      "@/lib/server/provider-dashboard-actions"
    );

    const dashboard =
      await getProviderDashboard(
        userId
      );

    return Response.json(
      dashboard
    );

  } catch (error) {
    console.error(
      "PROVIDER DASHBOARD ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load provider dashboard";

    let status = 400;

    if (
      message ===
      "Unauthorized"
    ) {
      status = 401;
    }

    if (
      message ===
        "Provider account not found" ||
      message ===
        "Provider account is not approved"
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

// ========================================
// UPDATE BOOKING
// ========================================

export async function PATCH(
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

    const body =
      await request.json();

    const bookingId =
      String(
        body.bookingId ??
          ""
      );

    const action =
      String(
        body.action ??
          ""
      );

    if (!bookingId) {
      throw new Error(
        "Booking ID is required"
      );
    }

    const allowedActions = [
      "accept",
      "reject",
      "on_the_way",
      "start",
      "complete",
    ] as const;

    if (
      !allowedActions.includes(
        action as
          (typeof allowedActions)[number]
      )
    ) {
      throw new Error(
        "Invalid booking action"
      );
    }

    const {
      updateProviderBookingStatus,
    } = await import(
      "@/lib/server/provider-dashboard-actions"
    );

    const booking =
      await updateProviderBookingStatus(
        userId,
        bookingId,
        action as
          | "accept"
          | "reject"
          | "on_the_way"
          | "start"
          | "complete"
      );

    return Response.json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error(
      "PROVIDER BOOKING ACTION ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update booking";

    let status = 400;

    if (
      message ===
      "Unauthorized"
    ) {
      status = 401;
    }

    if (
      message ===
        "Provider account not found" ||
      message ===
        "Provider account is not approved"
    ) {
      status = 403;
    }

    if (
      message ===
      "Booking not found"
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