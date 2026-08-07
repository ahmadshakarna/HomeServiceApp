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

    const { getServiceById } =
      await import(
        "@/lib/server/service-actions"
      );

    const result = await getServiceById(id);

    if (!result) {
      return Response.json(
        {
          error: "Service not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error(
      "GET SERVICE ERROR:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch service",
      },
      {
        status: 500,
      }
    );
  }
}