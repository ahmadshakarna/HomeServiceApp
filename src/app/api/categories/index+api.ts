export async function GET() {
  try {
    const { listCategories } =
      await import("@/lib/server/category-actions");

    const categories = await listCategories();

    console.log("CATEGORIES:", categories);

    return Response.json({
      categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}