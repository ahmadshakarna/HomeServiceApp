import { asc, eq, sql } from "drizzle-orm";
import { db } from "./db/client";
import { categories, services } from "./db/schema";

export const listCategories = async () => {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      icon: categories.icon,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,

      servicesCount: sql<number>`
        COUNT(${services.id})
      `.mapWith(Number),
    })
    .from(categories)
    .leftJoin(
      services,
      sql`
        ${services.categoryId} = ${categories.id}
        AND ${services.isActive} = true
      `
    )
    .where(eq(categories.isActive, true))
    .groupBy(categories.id)
    .orderBy(
      asc(categories.sortOrder),
      asc(categories.name)
    );

  return rows;
};