const { neon } = require("@neondatabase/serverless");
const crypto = require("node:crypto");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Example: DATABASE_URL=... npm run seed:services"
  );
}

const sql = neon(databaseUrl);

const seedServices = [
  // Cleaning
  {
    categorySlug: "cleaning",
    name: "Standard Home Cleaning",
    slug: "standard-home-cleaning",
    description:
      "General cleaning for bedrooms, living rooms, kitchens and bathrooms.",
    icon: "home-outline",
    sortOrder: 1,
  },
  {
    categorySlug: "cleaning",
    name: "Deep Cleaning",
    slug: "deep-cleaning",
    description: "Detailed deep cleaning for your entire home.",
    icon: "sparkles-outline",
    sortOrder: 2,
  },
  {
    categorySlug: "cleaning",
    name: "Sofa Cleaning",
    slug: "sofa-cleaning",
    description: "Professional sofa and upholstery cleaning.",
    icon: "bed-outline",
    sortOrder: 3,
  },

  // Plumbing
  {
    categorySlug: "plumbing",
    name: "Water Leak Repair",
    slug: "water-leak-repair",
    description: "Detect and repair water leaks around your home.",
    icon: "water-outline",
    sortOrder: 1,
  },
  {
    categorySlug: "plumbing",
    name: "Faucet Repair",
    slug: "faucet-repair",
    description: "Repair or replace damaged faucets.",
    icon: "construct-outline",
    sortOrder: 2,
  },
  {
    categorySlug: "plumbing",
    name: "Drain Cleaning",
    slug: "drain-cleaning",
    description: "Clear blocked sinks and drainage systems.",
    icon: "water-outline",
    sortOrder: 3,
  },

  // Electrical
  {
    categorySlug: "electrical",
    name: "Light Installation",
    slug: "light-installation",
    description: "Install ceiling lights, lamps and lighting fixtures.",
    icon: "bulb-outline",
    sortOrder: 1,
  },
  {
    categorySlug: "electrical",
    name: "Socket Repair",
    slug: "socket-repair",
    description: "Repair or replace electrical sockets.",
    icon: "flash-outline",
    sortOrder: 2,
  },
  {
    categorySlug: "electrical",
    name: "Electrical Inspection",
    slug: "electrical-inspection",
    description:
      "Inspect home electrical systems and identify problems.",
    icon: "search-outline",
    sortOrder: 3,
  },

  // Carpentry
  {
    categorySlug: "carpentry",
    name: "Door Repair",
    slug: "door-repair",
    description: "Repair wooden doors, hinges and frames.",
    icon: "hammer-outline",
    sortOrder: 1,
  },
  {
    categorySlug: "carpentry",
    name: "Furniture Repair",
    slug: "furniture-repair",
    description: "Repair damaged home furniture.",
    icon: "hammer-outline",
    sortOrder: 2,
  },
  {
    categorySlug: "carpentry",
    name: "Furniture Assembly",
    slug: "furniture-assembly",
    description: "Professional furniture assembly service.",
    icon: "construct-outline",
    sortOrder: 3,
  },

  // AC Repair
  {
    categorySlug: "ac-repair",
    name: "AC Maintenance",
    slug: "ac-maintenance",
    description: "General air conditioning maintenance.",
    icon: "snow-outline",
    sortOrder: 1,
  },
  {
    categorySlug: "ac-repair",
    name: "AC Cleaning",
    slug: "ac-cleaning",
    description: "Clean air conditioning units and filters.",
    icon: "snow-outline",
    sortOrder: 2,
  },
  {
    categorySlug: "ac-repair",
    name: "AC Repair",
    slug: "air-conditioner-repair",
    description: "Diagnose and repair air conditioning problems.",
    icon: "build-outline",
    sortOrder: 3,
  },

  // Painting
  {
    categorySlug: "painting",
    name: "Interior Painting",
    slug: "interior-painting",
    description: "Professional painting for rooms and interior walls.",
    icon: "color-palette-outline",
    sortOrder: 1,
  },
  {
    categorySlug: "painting",
    name: "Exterior Painting",
    slug: "exterior-painting",
    description: "Exterior home and wall painting service.",
    icon: "color-palette-outline",
    sortOrder: 2,
  },
  {
    categorySlug: "painting",
    name: "Wall Touch Up",
    slug: "wall-touch-up",
    description: "Small paint repairs and wall touch-ups.",
    icon: "brush-outline",
    sortOrder: 3,
  },

  // Home Salon
  {
    categorySlug: "home-salon",
    name: "Haircut",
    slug: "home-haircut",
    description: "Professional haircut service at home.",
    icon: "cut-outline",
    sortOrder: 1,
  },
  {
    categorySlug: "home-salon",
    name: "Hair Styling",
    slug: "hair-styling",
    description: "Professional hair styling at home.",
    icon: "cut-outline",
    sortOrder: 2,
  },
  {
    categorySlug: "home-salon",
    name: "Beauty Service",
    slug: "home-beauty-service",
    description: "Personal beauty and care service at home.",
    icon: "sparkles-outline",
    sortOrder: 3,
  },
];

async function seed() {
  // مهم: id و category_id من نوع UUID
  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id UUID PRIMARY KEY,

      category_id UUID NOT NULL
        REFERENCES categories(id)
        ON DELETE CASCADE,

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

  for (const service of seedServices) {
    // نجيب ID التصنيف عن طريق slug
    const categoryRows = await sql`
      SELECT id
      FROM categories
      WHERE slug = ${service.categorySlug}
      LIMIT 1
    `;

    const category = categoryRows[0];

    if (!category) {
      console.warn(
        `Category not found: ${service.categorySlug}. Skipping ${service.name}`
      );

      continue;
    }

    await sql`
      INSERT INTO services (
        id,
        category_id,
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
        ${crypto.randomUUID()}::uuid,
        ${category.id}::uuid,
        ${service.name},
        ${service.slug},
        ${service.description},
        ${service.icon},
        ${service.sortOrder},
        TRUE,
        NOW(),
        NOW()
      )
      ON CONFLICT (slug)
      DO UPDATE SET
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        sort_order = EXCLUDED.sort_order,
        is_active = TRUE,
        updated_at = NOW()
    `;
  }

  const services = await sql`
    SELECT
      services.id,
      services.name,
      services.slug,
      categories.name AS category,
      services.sort_order,
      services.is_active
    FROM services

    INNER JOIN categories
      ON categories.id = services.category_id

    ORDER BY
      categories.sort_order ASC,
      services.sort_order ASC
  `;

  console.log(
    `Seed complete: ${seedServices.length} services added/updated.`
  );

  console.table(services);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});