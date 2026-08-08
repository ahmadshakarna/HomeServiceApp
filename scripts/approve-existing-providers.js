const {
  neon,
} = require(
  "@neondatabase/serverless"
);

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required"
  );
}

const sql = neon(
  databaseUrl
);

async function approveProviders() {
  const result = await sql`
    UPDATE service_providers

    SET
      approval_status = 'approved',
      updated_at = NOW()

    WHERE clerk_user_id IS NULL

    RETURNING
      id,
      full_name,
      approval_status
  `;

  console.table(result);

  console.log(
    `✓ Approved ${result.length} existing seed providers`
  );
}

approveProviders().catch(
  (error) => {
    console.error(
      "Approve providers failed:",
      error
    );

    process.exit(1);
  }
);