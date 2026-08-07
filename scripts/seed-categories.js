const { neon } = require("@neondatabase/serverless");
const crypto = require("node:crypto");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Example: DATABASE_URL=... npm run seed:categories"
  );
}

const sql = neon(databaseUrl);

const seedCategories = [
  {
    name: "Cleaning",
    slug: "cleaning",
    description: "Professional home cleaning services",
    icon: "sparkles-outline",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Plumbing",
    slug: "plumbing",
    description: "Plumbing repair and installation services",
    icon: "water-outline",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Electrical",
    slug: "electrical",
    description: "Electrical repair and installation services",
    icon: "flash-outline",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "Carpentry",
    slug: "carpentry",
    description: "Carpentry and furniture repair services",
    icon: "hammer-outline",
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "AC Repair",
    slug: "ac-repair",
    description: "Air conditioning repair and maintenance",
    icon: "snow-outline",
    sortOrder: 5,
    isActive: true,
  },
  {
    name: "Painting",
    slug: "painting",
    description: "Home painting and decoration services",
    icon: "color-palette-outline",
    sortOrder: 6,
    isActive: true,
  },
  {
    name: "Home Salon",
    slug: "home-salon",
    description: "Personal care services at home",
    icon: "cut-outline",
    sortOrder: 7,
    isActive: true,
  },
];

async function seed() {
  // إنشاء الجدول إذا لم يكن موجود
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // إضافة أو تحديث التصنيفات
  for (const category of seedCategories) {
    await sql`
      INSERT INTO categories (
        id,
        name,
        slug,
        description,
        icon,
        sort_order,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        ${crypto.randomUUID()},
        ${category.name},
        ${category.slug},
        ${category.description},
        ${category.icon},
        ${category.sortOrder},
        ${category.isActive},
        NOW(),
        NOW()
      )
      ON CONFLICT (slug)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        sort_order = EXCLUDED.sort_order,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `;
  }

  // للتأكد من البيانات
  const categories = await sql`
    SELECT
      id,
      name,
      slug,
      description,
      icon,
      sort_order,
      is_active,
      created_at,
      updated_at
    FROM categories
    ORDER BY sort_order ASC
  `;

  console.log(
    `Seed complete: ${seedCategories.length} categories added/updated.`
  );

  console.table(categories);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});