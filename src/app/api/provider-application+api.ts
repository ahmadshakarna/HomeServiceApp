// ========================================
// GET CURRENT APPLICATION
// ========================================

export async function GET(
  request: Request
) {
  try {
    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );

    const clerkUserId =
      await requireUserId(
        request
      );

    const {
      getProviderApplication,
    } = await import(
      "@/lib/server/provider-application-actions"
    );

    const application =
      await getProviderApplication(
        clerkUserId
      );

    return Response.json({
      application,
    });
  } catch (error) {
    console.error(
      "GET PROVIDER APPLICATION ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load application";

    return Response.json(
      {
        error: message,
      },
      {
        status:
          message ===
          "Unauthorized"
            ? 401
            : 500,
      }
    );
  }
}


// ========================================
// SAVE DRAFT
// ========================================

export async function POST(
  request: Request
) {
  try {
    const {
      requireUserId,
    } = await import(
      "@/lib/server/auth"
    );

    // مهم:
    // الـuser ID يأتي من Clerk token
    // وليس من body
    const clerkUserId =
      await requireUserId(
        request
      );

    const body =
      await request.json();

    const {
      fullName,
      phone,
      email,
      city,
      bio,
      experienceYears,
    } = body;

    const {
      saveProviderDraft,
    } = await import(
      "@/lib/server/provider-application-actions"
    );

    const application =
      await saveProviderDraft(
        clerkUserId,
        {
          fullName:
            String(
              fullName ?? ""
            ),

          phone:
            String(
              phone ?? ""
            ),

          email:
            String(
              email ?? ""
            ),

          city:
            String(
              city ?? ""
            ),

          bio:
            String(
              bio ?? ""
            ),

          experienceYears:
            Number(
              experienceYears ?? 0
            ),
        }
      );

    return Response.json({
      application,
    });
  } catch (error) {
    console.error(
      "SAVE PROVIDER APPLICATION ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to save application";

    return Response.json(
      {
        error: message,
      },
      {
        status:
          message ===
          "Unauthorized"
            ? 401
            : 400,
      }
    );
  }
}