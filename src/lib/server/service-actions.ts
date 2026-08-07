import { and, asc, eq } from "drizzle-orm";
import { db } from "./db/client";
import { categories, services } from "./db/schema";

// جميع خدمات Category معينة
export const listServicesByCategory = async (
  categoryId: string
) => {
  const rows = await db
    .select({
      id: services.id,
      categoryId: services.categoryId,
      name: services.name,
      slug: services.slug,
      description: services.description,
      icon: services.icon,
      sortOrder: services.sortOrder,
      isActive: services.isActive,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
    })
    .from(services)
    .where(
      and(
        eq(services.categoryId, categoryId),
        eq(services.isActive, true)
      )
    )
    .orderBy(
      asc(services.sortOrder),
      asc(services.name)
    );

  return rows;
};

// Category + خدماتها
export const getCategoryWithServices = async (
  categoryId: string
) => {
  const categoryRows = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.isActive, true)
      )
    )
    .limit(1);

  const category = categoryRows[0];

  if (!category) {
    return null;
  }

  const categoryServices =
    await listServicesByCategory(categoryId);

  return {
    category,
    services: categoryServices,
  };
};

// Service واحدة + معلومات الـ Category
export const getServiceById = async (
  serviceId: string
) => {
  const rows = await db
    .select({
      service: {
        id: services.id,
        categoryId: services.categoryId,
        name: services.name,
        slug: services.slug,
        description: services.description,
        icon: services.icon,
        sortOrder: services.sortOrder,
        isActive: services.isActive,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
      },

      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
      },
    })
    .from(services)
    .innerJoin(
      categories,
      eq(services.categoryId, categories.id)
    )
    .where(
      and(
        eq(services.id, serviceId),
        eq(services.isActive, true),
        eq(categories.isActive, true)
      )
    )
    .limit(1);

  return rows[0] ?? null;
};