const { neon } = require("@neondatabase/serverless");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required"
  );
}

const sql = neon(databaseUrl);


// =====================================
// Provider schedules
// =====================================

const providerSchedules = [
  {
    email: "sara.provider@example.com",

    schedule: [
      {
        dayOfWeek: 0,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 2,
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 3,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 4,
        startTime: "09:00",
        endTime: "15:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 5,
        startTime: null,
        endTime: null,
        isAvailable: false,
      },
      {
        dayOfWeek: 6,
        startTime: null,
        endTime: null,
        isAvailable: false,
      },
    ],
  },

  {
    email: "ahmad.provider@example.com",

    schedule: [
      {
        dayOfWeek: 0,
        startTime: "08:00",
        endTime: "16:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "16:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 2,
        startTime: "08:00",
        endTime: "16:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 3,
        startTime: "08:00",
        endTime: "16:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 4,
        startTime: "08:00",
        endTime: "14:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 5,
        startTime: null,
        endTime: null,
        isAvailable: false,
      },
      {
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "15:00",
        isAvailable: true,
      },
    ],
  },

  {
    email: "mohammad.provider@example.com",

    schedule: [
      {
        dayOfWeek: 0,
        startTime: "09:00",
        endTime: "18:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "18:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 2,
        startTime: "09:00",
        endTime: "18:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 3,
        startTime: "09:00",
        endTime: "18:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 4,
        startTime: "09:00",
        endTime: "16:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 5,
        startTime: null,
        endTime: null,
        isAvailable: false,
      },
      {
        dayOfWeek: 6,
        startTime: null,
        endTime: null,
        isAvailable: false,
      },
    ],
  },

  {
    email: "omar.provider@example.com",

    schedule: [
      {
        dayOfWeek: 0,
        startTime: "10:00",
        endTime: "19:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "19:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 2,
        startTime: "10:00",
        endTime: "19:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 3,
        startTime: "10:00",
        endTime: "19:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 4,
        startTime: "10:00",
        endTime: "17:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 5,
        startTime: null,
        endTime: null,
        isAvailable: false,
      },
      {
        dayOfWeek: 6,
        startTime: "11:00",
        endTime: "16:00",
        isAvailable: true,
      },
    ],
  },

  {
    email: "yousef.provider@example.com",

    schedule: [
      {
        dayOfWeek: 0,
        startTime: "08:30",
        endTime: "17:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 1,
        startTime: "08:30",
        endTime: "17:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 2,
        startTime: "08:30",
        endTime: "17:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 3,
        startTime: "08:30",
        endTime: "17:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 4,
        startTime: "08:30",
        endTime: "15:00",
        isAvailable: true,
      },
      {
        dayOfWeek: 5,
        startTime: null,
        endTime: null,
        isAvailable: false,
      },
      {
        dayOfWeek: 6,
        startTime: null,
        endTime: null,
        isAvailable: false,
      },
    ],
  },
];


// =====================================
// Seed
// =====================================

async function seed() {
  for (const providerData of providerSchedules) {

    const providerRows = await sql`
      SELECT id, full_name
      FROM service_providers
      WHERE email = ${providerData.email}
      LIMIT 1
    `;

    const provider = providerRows[0];

    if (!provider) {
      console.warn(
        `Provider not found: ${providerData.email}`
      );

      continue;
    }


    // نحذف الجدول القديم لمقدم الخدمة
    await sql`
      DELETE FROM provider_availability
      WHERE provider_id = ${provider.id}::uuid
    `;


    // إضافة الجدول الجديد
    for (const day of providerData.schedule) {

      await sql`
        INSERT INTO provider_availability (
          provider_id,
          day_of_week,
          start_time,
          end_time,
          is_available,
          created_at,
          updated_at
        )
        VALUES (
          ${provider.id}::uuid,
          ${day.dayOfWeek},
          ${day.startTime},
          ${day.endTime},
          ${day.isAvailable},
          NOW(),
          NOW()
        )
      `;
    }

    console.log(
      `✓ Availability seeded: ${provider.full_name}`
    );
  }


  // =====================================
  // Preview
  // =====================================

  const result = await sql`
    SELECT
      sp.full_name,
      pa.day_of_week,
      pa.start_time,
      pa.end_time,
      pa.is_available
    FROM provider_availability pa

    INNER JOIN service_providers sp
      ON sp.id = pa.provider_id

    ORDER BY
      sp.full_name,
      pa.day_of_week
  `;

  console.table(result);

  console.log(
    "Provider availability seed complete."
  );
}


seed().catch((error) => {
  console.error(
    "Availability seed failed:",
    error
  );

  process.exit(1);
});