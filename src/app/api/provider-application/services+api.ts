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
      getProviderApplicationServices,
    } = await import(
      "@/lib/server/provider-application-actions"
    );

    const result =
      await getProviderApplicationServices(
        userId
      );

    return Response.json(
      result
    );

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load services";

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

    const selections =
      Array.isArray(
        body.services
      )
        ? body.services
        : [];

    const {
      saveProviderApplicationServices,
    } = await import(
      "@/lib/server/provider-application-actions"
    );

    const result =
      await saveProviderApplicationServices(
        userId,

        selections.map(
          (item: any) => ({
            serviceId:
              String(
                item.serviceId ??
                  ""
              ),

            priceAgorot:
              Number(
                item.priceAgorot ??
                  0
              ),
          })
        )
      );

    return Response.json(
      result
    );

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to save services";

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