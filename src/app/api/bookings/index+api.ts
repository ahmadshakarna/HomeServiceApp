export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      customerId,
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

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create booking",
      },
      {
        status: 400,
      }
    );
  }
}

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(request.url);

    const customerId =
      url.searchParams.get(
        "customerId"
      );

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

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load bookings",
      },
      {
        status: 500,
      }
    );
  }
}