import {
  and,
  desc,
  eq,
} from "drizzle-orm";

import { db } from "./db/client";

import {
  categories,
  providerAvailability,
  providerServices,
  serviceProviders,
  services,
} from "./db/schema";


// ========================================
// LIST PENDING PROVIDER APPLICATIONS
// ========================================

export const listPendingProviderApplications =
  async () => {
    const applications =
      await db
        .select({
          id:
            serviceProviders.id,

          clerkUserId:
            serviceProviders.clerkUserId,

          fullName:
            serviceProviders.fullName,

          phone:
            serviceProviders.phone,

          email:
            serviceProviders.email,

          city:
            serviceProviders.city,

          bio:
            serviceProviders.bio,

          experienceYears:
            serviceProviders.experienceYears,

          profileImage:
            serviceProviders.profileImage,

          approvalStatus:
            serviceProviders.approvalStatus,

          isVerified:
            serviceProviders.isVerified,

          createdAt:
            serviceProviders.createdAt,

          updatedAt:
            serviceProviders.updatedAt,
        })

        .from(
          serviceProviders
        )

        .where(
          eq(
            serviceProviders.approvalStatus,
            "pending"
          )
        )

        .orderBy(
          desc(
            serviceProviders.updatedAt
          )
        );

    return applications;
  };

  // ========================================
// GET PROVIDER APPLICATION DETAILS
// ========================================

export const getProviderApplicationDetails =
  async (
    providerId: string
  ) => {
    const rows =
      await db
        .select()
        .from(
          serviceProviders
        )
        .where(
          eq(
            serviceProviders.id,
            providerId
          )
        )
        .limit(1);

    const application =
      rows[0];

    if (!application) {
      throw new Error(
        "Provider application not found"
      );
    }

    // =====================================
    // SERVICES + PRICES
    // =====================================

    const providerServiceRows =
      await db
        .select({
          id:
            providerServices.id,

          serviceId:
            services.id,

          serviceName:
            services.name,

          serviceSlug:
            services.slug,

          categoryId:
            categories.id,

          categoryName:
            categories.name,

          categorySlug:
            categories.slug,

          priceAgorot:
            providerServices.priceAgorot,

          isAvailable:
            providerServices.isAvailable,
        })

        .from(
          providerServices
        )

        .innerJoin(
          services,
          eq(
            providerServices.serviceId,
            services.id
          )
        )

        .innerJoin(
          categories,
          eq(
            services.categoryId,
            categories.id
          )
        )

        .where(
          eq(
            providerServices.providerId,
            providerId
          )
        );

    // =====================================
    // WORKING HOURS
    // =====================================

    const availability =
      await db
        .select()
        .from(
          providerAvailability
        )
        .where(
          eq(
            providerAvailability.providerId,
            providerId
          )
        )
        .orderBy(
          providerAvailability.dayOfWeek
        );

    return {
      application,
      services:
        providerServiceRows,
      availability,
    };
  };

  // ========================================
// APPROVE PROVIDER APPLICATION
// ========================================

export const approveProviderApplication =
  async (
    providerId: string
  ) => {
    const rows =
      await db
        .update(
          serviceProviders
        )
        .set({
          approvalStatus:
            "approved",

          rejectionReason:
            null,

          updatedAt:
            new Date(),
        })
        .where(
          and(
            eq(
              serviceProviders.id,
              providerId
            ),

            eq(
              serviceProviders.approvalStatus,
              "pending"
            )
          )
        )
        .returning();

    if (!rows[0]) {
      throw new Error(
        "Application not found or no longer pending"
      );
    }

    return rows[0];
  };


// ========================================
// REJECT PROVIDER APPLICATION
// ========================================

export const rejectProviderApplication =
  async (
    providerId: string,
    reason: string
  ) => {
    const cleanReason =
      reason.trim();

    if (
      cleanReason.length < 3
    ) {
      throw new Error(
        "Rejection reason is required"
      );
    }

    const rows =
      await db
        .update(
          serviceProviders
        )
        .set({
          approvalStatus:
            "rejected",

          rejectionReason:
            cleanReason,

          updatedAt:
            new Date(),
        })
        .where(
          and(
            eq(
              serviceProviders.id,
              providerId
            ),

            eq(
              serviceProviders.approvalStatus,
              "pending"
            )
          )
        )
        .returning();

    if (!rows[0]) {
      throw new Error(
        "Application not found or no longer pending"
      );
    }

    return rows[0];
  };