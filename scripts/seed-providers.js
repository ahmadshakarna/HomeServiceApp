const { neon } = require("@neondatabase/serverless");
const crypto = require("node:crypto");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Example: DATABASE_URL=... npm run seed:providers"
  );
}

const sql = neon(databaseUrl);

// ==============================
// Providers
// ==============================

const providers = [
  {
    fullName: "Ahmad Khalil",
    phone: "0599000001",
    email: "ahmad.provider@example.com",
    bio: "Experienced home maintenance professional specializing in plumbing services.",
    city: "Ramallah",
    experienceYears: 6,
    isVerified: true,

    services: [
      {
        slug: "water-leak-repair",
        priceAgorot: 8000,
      },
      {
        slug: "faucet-repair",
        priceAgorot: 6000,
      },
      {
        slug: "drain-cleaning",
        priceAgorot: 10000,
      },
    ],
  },

  {
    fullName: "Mohammad Ali",
    phone: "0599000002",
    email: "mohammad.provider@example.com",
    bio: "Professional electrician providing installation, repair and inspection services.",
    city: "Jerusalem",
    experienceYears: 8,
    isVerified: true,

    services: [
      {
        slug: "light-installation",
        priceAgorot: 9000,
      },
      {
        slug: "socket-repair",
        priceAgorot: 7000,
      },
      {
        slug: "electrical-inspection",
        priceAgorot: 12000,
      },
    ],
  },

  {
    fullName: "Omar Hassan",
    phone: "0599000003",
    email: "omar.provider@example.com",
    bio: "Air conditioning technician experienced in maintenance, cleaning and repair.",
    city: "Bethlehem",
    experienceYears: 5,
    isVerified: true,

    services: [
      {
        slug: "ac-maintenance",
        priceAgorot: 10000,
      },
      {
        slug: "ac-cleaning",
        priceAgorot: 8000,
      },
      {
        slug: "air-conditioner-repair",
        priceAgorot: 15000,
      },
    ],
  },

  {
    fullName: "Yousef Nasser",
    phone: "0599000004",
    email: "yousef.provider@example.com",
    bio: "Carpenter specialized in doors, furniture repair and furniture assembly.",
    city: "Nablus",
    experienceYears: 7,
    isVerified: false,

    services: [
      {
        slug: "door-repair",
        priceAgorot: 9000,
      },
      {
        slug: "furniture-repair",
        priceAgorot: 12000,
      },
      {
        slug: "furniture-assembly",
        priceAgorot: 10000,
      },
    ],
  },

  {
    fullName: "Sara Hassan",
    phone: "0599000005",
    email: "sara.provider@example.com",
    bio: "Professional home cleaning provider offering standard and deep cleaning services.",
    city: "Ramallah",
    experienceYears: 4,
    isVerified: true,

    services: [
      {
        slug: "standard-home-cleaning",
        priceAgorot: 10000,
      },
      {
        slug: "deep-cleaning",
        priceAgorot: 18000,
      },
      {
        slug: "sofa-cleaning",
        priceAgorot: 12000,
      },
    ],
  },
];

// ==============================
// Seed
// ==============================

async function seed() {
  for (const provider of providers) {
    // نشوف إذا مقدم الخدمة موجود مسبقًا
    const existingProviders = await sql`
      SELECT id
      FROM service_providers
      WHERE email = ${provider.email}
      LIMIT 1
    `;

    let providerId;

    if (existingProviders.length > 0) {
      providerId = existingProviders[0].id;

      await sql`
        UPDATE service_providers
        SET
          full_name = ${provider.fullName},
          phone = ${provider.phone},
          bio = ${provider.bio},
          city = ${provider.city},
          experience_years = ${provider.experienceYears},
          is_verified = ${provider.isVerified},
          is_active = TRUE,
          updated_at = NOW()
        WHERE id = ${providerId}::uuid
      `;
    } else {
      providerId = crypto.randomUUID();

      await sql`
        INSERT INTO service_providers (
          id,
          full_name,
          phone,
          email,
          bio,
          city,
          experience_years,
          is_verified,
          is_active,
          created_at,
          updated_at
        )
        VALUES (
          ${providerId}::uuid,
          ${provider.fullName},
          ${provider.phone},
          ${provider.email},
          ${provider.bio},
          ${provider.city},
          ${provider.experienceYears},
          ${provider.isVerified},
          TRUE,
          NOW(),
          NOW()
        )
      `;
    }

    // نحذف الربط القديم حتى ما يتكرر
    await sql`
      DELETE FROM provider_services
      WHERE provider_id = ${providerId}::uuid
    `;

    // ربط مقدم الخدمة بالخدمات
    for (const providerService of provider.services) {
      const serviceRows = await sql`
        SELECT id, name
        FROM services
        WHERE slug = ${providerService.slug}
        LIMIT 1
      `;

      const service = serviceRows[0];

      if (!service) {
        console.warn(
          `Service not found: ${providerService.slug}`
        );

        continue;
      }

      await sql`
        INSERT INTO provider_services (
          id,
          provider_id,
          service_id,
          price_agorot,
          is_available,
          created_at,
          updated_at
        )
        VALUES (
          ${crypto.randomUUID()}::uuid,
          ${providerId}::uuid,
          ${service.id}::uuid,
          ${providerService.priceAgorot},
          TRUE,
          NOW(),
          NOW()
        )
      `;
    }

    console.log(`✓ Provider seeded: ${provider.fullName}`);
  }

  // ==============================
  // Preview
  // ==============================

  const result = await sql`
    SELECT
      sp.full_name AS provider,
      sp.city,
      sp.experience_years,
      sp.is_verified,
      s.name AS service,
      ps.price_agorot
    FROM provider_services ps

    INNER JOIN service_providers sp
      ON sp.id = ps.provider_id

    INNER JOIN services s
      ON s.id = ps.service_id

    ORDER BY
      sp.full_name,
      s.name
  `;

  console.table(result);

  console.log(
    `Seed complete: ${providers.length} providers added/updated.`
  );
}

seed().catch((error) => {
  console.error("Provider seed failed:");
  console.error(error);

  process.exit(1);
});