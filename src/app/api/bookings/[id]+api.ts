// ========================================
// GET BOOKING
// ========================================

export async function GET(
  request: Request,
  { id }: { id: string }
) {
  try {
    const url =
      new URL(request.url);

    const customerId =
      url.searchParams.get(
        "customerId"
      );

    if (!id || !customerId) {
      return Response.json(
        {
          error:
            "Booking id and customer id are required",
        },
        {
          status: 400,
        }
      );
    }

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

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load booking",
      },
      {
        status: 500,
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
    const body =
      await request.json();

    const {
      customerId,
      action,
    } = body;

    if (!customerId) {
      return Response.json(
        {
          error:
            "Customer id is required",
        },
        {
          status: 400,
        }
      );
    }

    if (action !== "cancel") {
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

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update booking",
      },
      {
        status: 400,
      }
    );
  }
}