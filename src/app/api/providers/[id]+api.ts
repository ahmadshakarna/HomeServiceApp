export async function GET(
  request: Request,
  { id }: { id: string }
) {
  try {
    if (!id) {
      return Response.json(
        {
          error: "Provider id is required",
        },
        {
          status: 400,
        }
      );
    }

    const { getProviderById } =
      await import(
        "@/lib/server/provider-actions"
      );

    const result =
      await getProviderById(id);

    if (!result) {
      return Response.json(
        {
          error: "Provider not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error(
      "GET PROVIDER ERROR:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch provider",
      },
      {
        status: 500,
      }
    );
  }
}