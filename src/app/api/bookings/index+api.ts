export async function POST(
  request: Request
) {
  try {
    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );

    // العميل الحقيقي يؤخذ من Clerk
    // وليس من body
    const customerId =
      await requireUserId(
        request
      );


    const body =
      await request.json();


    const {
      providerId,
      serviceId,
      bookingDate,
      startTime,
      address,
      notes,
    } = body;


    const {
      createBooking,
    } = await import(
      "@/lib/server/booking-actions"
    );


    const booking =
      await createBooking({
        customerId,
        providerId,
        serviceId,
        bookingDate,
        startTime,
        address,
        notes,
      });


    return Response.json(
      {
        booking,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "CREATE BOOKING ERROR:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Failed to create booking";


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


// ========================================
// GET MY BOOKINGS
// ========================================

export async function GET(
  request: Request
) {
  try {
    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );


    // لا نقبل customerId من query
    const customerId =
      await requireUserId(
        request
      );


    const {
      listCustomerBookings,
    } = await import(
      "@/lib/server/booking-actions"
    );


    const bookings =
      await listCustomerBookings(
        customerId
      );


    return Response.json({
      bookings,
    });

  } catch (error) {
    console.error(
      "GET BOOKINGS ERROR:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Failed to load bookings";


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