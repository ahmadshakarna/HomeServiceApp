// ========================================
// REVIEWS API
// ========================================


// ========================================
// GET REVIEW / PROVIDER SUMMARY
// ========================================

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(
        request.url
      );


    const providerId =
      url.searchParams.get(
        "providerId"
      );


    // =====================================
    // PUBLIC PROVIDER REVIEW SUMMARY
    // =====================================

    if (providerId) {
      const {
        getProviderReviewSummary,
      } = await import(
        "@/lib/server/booking-actions"
      );


      const summary =
        await getProviderReviewSummary(
          providerId
        );


      return Response.json({
        summary,
      });
    }


    // =====================================
    // CUSTOMER'S REVIEW FOR A BOOKING
    // =====================================

    const bookingId =
      url.searchParams.get(
        "bookingId"
      );


    if (!bookingId) {
      return Response.json(
        {
          error:
            "Booking id is required",
        },
        {
          status:
            400,
        }
      );
    }


    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );


    const customerId =
      await requireUserId(
        request
      );


    const {
      getCustomerBookingReview,
    } = await import(
      "@/lib/server/booking-actions"
    );


    const review =
      await getCustomerBookingReview(
        bookingId,
        customerId
      );


    return Response.json({
      review,
    });

  } catch (error) {
    console.error(
      "GET REVIEW ERROR:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Failed to load review";


    return Response.json(
      {
        error:
          message,
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
// CREATE REVIEW
// ========================================

export async function POST(
  request: Request
) {
  try {
    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );


    const customerId =
      await requireUserId(
        request
      );


    const body =
      await request.json();


    const bookingId =
      typeof body.bookingId ===
      "string"
        ? body.bookingId
        : "";


    const rating =
      Number(
        body.rating
      );


    const comment =
      typeof body.comment ===
      "string"
        ? body.comment
        : null;


    if (!bookingId) {
      return Response.json(
        {
          error:
            "Booking id is required",
        },
        {
          status:
            400,
        }
      );
    }


    const {
      createCustomerBookingReview,
    } = await import(
      "@/lib/server/booking-actions"
    );


    const review =
      await createCustomerBookingReview({
        bookingId,

        // Clerk server-side
        customerId,

        rating,
        comment,
      });


    return Response.json(
      {
        review,
      },
      {
        status:
          201,
      }
    );

  } catch (error) {
    console.error(
      "CREATE REVIEW ERROR:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit review";


    let status =
      500;


    if (
      message ===
      "Unauthorized"
    ) {
      status =
        401;
    } else if (
      message ===
        "Booking not found"
    ) {
      status =
        404;
    } else if (
      message ===
        "This booking has already been reviewed"
    ) {
      status =
        409;
    } else if (
      message ===
        "Only completed bookings can be reviewed" ||
      message ===
        "Rating must be between 1 and 5" ||
      message ===
        "Review comment is too long"
    ) {
      status =
        400;
    }


    return Response.json(
      {
        error:
          message,
      },
      {
        status,
      }
    );
  }
}