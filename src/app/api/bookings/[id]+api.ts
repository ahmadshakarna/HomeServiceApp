// ========================================
// GET BOOKING
// ========================================

export async function GET(
  request: Request,
  { id }: { id: string }
) {
  try {
    if (!id) {
      return Response.json(
        {
          error:
            "Booking id is required",
        },
        {
          status: 400,
        }
      );
    }


    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );


    // العميل الحقيقي من Clerk
    const customerId =
      await requireUserId(
        request
      );


    const {
      getCustomerBookingById,
    } = await import(
      "@/lib/server/booking-actions"
    );


    const booking =
      await getCustomerBookingById(
        id,
        customerId
      );


    if (!booking) {
      return Response.json(
        {
          error:
            "Booking not found",
        },
        {
          status: 404,
        }
      );
    }


    return Response.json({
      booking,
    });

  } catch (error) {
    console.error(
      "GET BOOKING ERROR:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Failed to load booking";


    return Response.json(
      {
        error: message,
      },
      {
        status:
          message ===
          "Unauthorized"
            ? 401
            : 500,
      }
    );
  }
}


// ========================================
// UPDATE / CANCEL BOOKING
// ========================================

export async function PATCH(
  request: Request,
  { id }: { id: string }
) {
  try {
    if (!id) {
      return Response.json(
        {
          error:
            "Booking id is required",
        },
        {
          status: 400,
        }
      );
    }


    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );


    // لا نقبل customerId من body
    const customerId =
      await requireUserId(
        request
      );


    const body =
      await request.json();


    const {
      action,
    } = body;


    if (
      action !==
      "cancel"
    ) {
      return Response.json(
        {
          error:
            "Invalid booking action",
        },
        {
          status: 400,
        }
      );
    }


    const {
      cancelCustomerBooking,
    } = await import(
      "@/lib/server/booking-actions"
    );


    const booking =
      await cancelCustomerBooking(
        id,
        customerId
      );


    return Response.json({
      booking,
    });

  } catch (error) {
    console.error(
      "UPDATE BOOKING ERROR:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Failed to update booking";


    let status =
      400;


    if (
      message ===
      "Unauthorized"
    ) {
      status =
        401;
    }


    if (
      message ===
      "Booking not found"
    ) {
      status =
        404;
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