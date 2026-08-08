export async function GET(
  request: Request,
  { id }: { id: string }
) {
  try {
    if (!id) {
      return Response.json(
        {
          error: "Service id is required",
        },
        {
          status: 400,
        }
      );
    }

    const {
      getProvidersByService,
    } = await import(
      "@/lib/server/provider-actions"
    );

    const providers =
      await getProvidersByService(id);

    return Response.json({
      providers,
    });

  } catch (error) {
    console.error(
      "GET SERVICE PROVIDERS ERROR:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch providers",
      },
      {
        status: 500,
      }
    );
  }
}