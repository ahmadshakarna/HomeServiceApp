export async function GET(
  request: Request,
  { id }: { id: string }
) {
  try {
    if (!id) {
      return Response.json(
        {
          error: "Category id is required",
        },
        {
          status: 400,
        }
      );
    }

    const { getCategoryWithServices } =
      await import(
        "@/lib/server/service-actions"
      );

    const result =
      await getCategoryWithServices(id);

    if (!result) {
      return Response.json(
        {
          error: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error(
      "GET CATEGORY SERVICES ERROR:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch services",
      },
      {
        status: 500,
      }
    );
  }
}