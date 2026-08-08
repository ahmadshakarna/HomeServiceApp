// ========================================
// GET WORKING HOURS
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

    const userId =
      await requireUserId(
        request
      );

    const {
      getProviderApplicationAvailability,
    } = await import(
      "@/lib/server/provider-application-actions"
    );

    const result =
      await getProviderApplicationAvailability(
        userId
      );

    return Response.json(
      result
    );

  } catch (error) {
    console.error(
      "GET PROVIDER AVAILABILITY ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load working hours";

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
// SAVE WORKING HOURS
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

    const userId =
      await requireUserId(
        request
      );

    const body =
      await request.json();

    const schedule =
      Array.isArray(
        body.schedule
      )
        ? body.schedule
        : [];

    const {
      saveProviderApplicationAvailability,
    } = await import(
      "@/lib/server/provider-application-actions"
    );

    const result =
      await saveProviderApplicationAvailability(
        userId,

        schedule.map(
          (day: any) => ({
            dayOfWeek:
              Number(
                day.dayOfWeek
              ),

            isAvailable:
              Boolean(
                day.isAvailable
              ),

            startTime:
              day.startTime
                ? String(
                    day.startTime
                  )
                : null,

            endTime:
              day.endTime
                ? String(
                    day.endTime
                  )
                : null,
          })
        )
      );

    return Response.json(
      result
    );

  } catch (error) {
    console.error(
      "SAVE PROVIDER AVAILABILITY ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to save working hours";

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