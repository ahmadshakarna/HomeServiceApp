import {
  and,
  asc,
  eq,
  inArray,
} from "drizzle-orm";

import { db } from "./db/client";

import {
  categories,
  providerServices,
  serviceProviders,
  providerAvailability,
  services,
} from "./db/schema";

type ProviderApplicationInput = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  bio: string;
  experienceYears: number;
};


// ========================================
// GET MY PROVIDER APPLICATION
// ========================================

export const getProviderApplication =
  async (
    clerkUserId: string
  ) => {
    const rows = await db
      .select()
      .from(serviceProviders)
      .where(
        eq(
          serviceProviders.clerkUserId,
          clerkUserId
        )
      )
      .limit(1);

    return rows[0] ?? null;
  };


// ========================================
// SAVE PROVIDER DRAFT
// ========================================

export const saveProviderDraft =
  async (
    clerkUserId: string,
    input: ProviderApplicationInput
  ) => {
    const fullName =
      input.fullName.trim();

    const phone =
      input.phone.trim();

    const email =
      input.email.trim();

    const city =
      input.city.trim();

    const bio =
      input.bio.trim();

    // ----------------------------
    // Validation
    // ----------------------------

    if (!fullName) {
      throw new Error(
        "Full name is required"
      );
    }

    if (!phone) {
      throw new Error(
        "Phone number is required"
      );
    }

    if (!city) {
      throw new Error(
        "City is required"
      );
    }

    if (
      !Number.isInteger(
        input.experienceYears
      ) ||
      input.experienceYears < 0 ||
      input.experienceYears > 60
    ) {
      throw new Error(
        "Invalid experience years"
      );
    }

    // ----------------------------
    // Existing application
    // ----------------------------

    const existing =
      await getProviderApplication(
        clerkUserId
      );

    if (
      existing?.approvalStatus ===
      "approved"
    ) {
      throw new Error(
        "Provider account is already approved"
      );
    }

    if (
      existing?.approvalStatus ===
      "pending"
    ) {
      throw new Error(
        "Application is already under review"
      );
    }

    // ----------------------------
    // Update existing draft/rejected
    // ----------------------------

    if (existing) {
      const rows = await db
        .update(serviceProviders)
        .set({
          fullName,
          phone,

          email:
            email || null,

          city,

          bio:
            bio || null,

          experienceYears:
            input.experienceYears,

          approvalStatus:
            "draft",

          rejectionReason:
            null,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            serviceProviders.id,
            existing.id
          )
        )
        .returning();

      return rows[0];
    }

    // ----------------------------
    // Create new draft
    // ----------------------------

    const rows = await db
      .insert(serviceProviders)
      .values({
        clerkUserId,

        fullName,
        phone,

        email:
          email || null,

        city,

        bio:
          bio || null,

        experienceYears:
          input.experienceYears,

        approvalStatus:
          "draft",

        isVerified:
          false,

        isActive:
          true,
      })
      .returning();

    return rows[0];
  };

  // ========================================
// GET SERVICES FOR APPLICATION
// ========================================

export const getProviderApplicationServices =
  async (clerkUserId: string) => {
    const application =
      await getProviderApplication(
        clerkUserId
      );

    if (!application) {
      return {
        application: null,
        availableServices: [],
        selectedServices: [],
      };
    }

    const availableServices =
      await db
        .select({
          serviceId: services.id,
          serviceName: services.name,
          serviceIcon: services.icon,
          serviceDescription:
            services.description,

          categoryId: categories.id,
          categoryName: categories.name,
        })
        .from(services)

        .innerJoin(
          categories,
          eq(
            services.categoryId,
            categories.id
          )
        )

        .where(
          and(
            eq(
              services.isActive,
              true
            ),
            eq(
              categories.isActive,
              true
            )
          )
        )

        .orderBy(
          asc(categories.sortOrder),
          asc(services.sortOrder)
        );

    const selectedServices =
      await db
        .select({
          serviceId:
            providerServices.serviceId,

          priceAgorot:
            providerServices.priceAgorot,
        })
        .from(providerServices)

        .where(
          eq(
            providerServices.providerId,
            application.id
          )
        );

    return {
      application,
      availableServices,
      selectedServices,
    };
  };


type ProviderServiceInput = {
  serviceId: string;
  priceAgorot: number;
};


export const saveProviderApplicationServices =
  async (
    clerkUserId: string,
    selections:
      ProviderServiceInput[]
  ) => {
    const application =
      await getProviderApplication(
        clerkUserId
      );

    if (!application) {
      throw new Error(
        "Save your personal information first"
      );
    }

    if (
      application.approvalStatus ===
      "pending"
    ) {
      throw new Error(
        "Application is already under review"
      );
    }

    if (
      application.approvalStatus ===
      "approved"
    ) {
      throw new Error(
        "Provider is already approved"
      );
    }

    if (
      selections.length === 0
    ) {
      throw new Error(
        "Select at least one service"
      );
    }

    const unique =
      Array.from(
        new Map(
          selections.map(
            (item) => [
              item.serviceId,
              item,
            ]
          )
        ).values()
      );

    for (const item of unique) {
      if (
        !Number.isInteger(
          item.priceAgorot
        ) ||
        item.priceAgorot <= 0
      ) {
        throw new Error(
          "Enter a valid price for every service"
        );
      }
    }

    const ids =
      unique.map(
        (item) =>
          item.serviceId
      );

    const valid =
      await db
        .select({
          id: services.id,
        })
        .from(services)
        .where(
          and(
            inArray(
              services.id,
              ids
            ),
            eq(
              services.isActive,
              true
            )
          )
        );

    if (
      valid.length !==
      ids.length
    ) {
      throw new Error(
        "One or more services are invalid"
      );
    }

    await db
      .delete(providerServices)
      .where(
        eq(
          providerServices.providerId,
          application.id
        )
      );

    await db
      .insert(providerServices)
      .values(
        unique.map(
          (item) => ({
            providerId:
              application.id,

            serviceId:
              item.serviceId,

            priceAgorot:
              item.priceAgorot,

            isAvailable: true,
          })
        )
      );

    return {
      success: true,
      count: unique.length,
    };
  };

  // ========================================
// PROVIDER WORKING HOURS
// ========================================

type ProviderAvailabilityInput = {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string | null;
  endTime: string | null;
};


// ========================================
// GET WORKING HOURS
// ========================================

export const getProviderApplicationAvailability =
  async (
    clerkUserId: string
  ) => {
    const application =
      await getProviderApplication(
        clerkUserId
      );

    if (!application) {
      throw new Error(
        "Provider application not found"
      );
    }

    const availability =
      await db
        .select()
        .from(
          providerAvailability
        )
        .where(
          eq(
            providerAvailability.providerId,
            application.id
          )
        )
        .orderBy(
          asc(
            providerAvailability.dayOfWeek
          )
        );

    return {
      application,
      availability,
    };
  };


// ========================================
// SAVE WORKING HOURS
// ========================================

export const saveProviderApplicationAvailability =
  async (
    clerkUserId: string,
    schedule:
      ProviderAvailabilityInput[]
  ) => {
    const application =
      await getProviderApplication(
        clerkUserId
      );

    if (!application) {
      throw new Error(
        "Provider application not found"
      );
    }

    if (
      application.approvalStatus ===
      "pending"
    ) {
      throw new Error(
        "Application is already under review"
      );
    }

    if (
      application.approvalStatus ===
      "approved"
    ) {
      throw new Error(
        "Provider is already approved"
      );
    }

    if (
      !Array.isArray(schedule) ||
      schedule.length !== 7
    ) {
      throw new Error(
        "Working hours must contain all 7 days"
      );
    }

    const usedDays =
      new Set<number>();

    let availableDays = 0;

    for (
      const day of schedule
    ) {
      if (
        !Number.isInteger(
          day.dayOfWeek
        ) ||
        day.dayOfWeek < 0 ||
        day.dayOfWeek > 6
      ) {
        throw new Error(
          "Invalid day of week"
        );
      }

      if (
        usedDays.has(
          day.dayOfWeek
        )
      ) {
        throw new Error(
          "Duplicate day found"
        );
      }

      usedDays.add(
        day.dayOfWeek
      );

      if (
        day.isAvailable
      ) {
        availableDays++;

        if (
          !day.startTime ||
          !day.endTime
        ) {
          throw new Error(
            "Start and end times are required for available days"
          );
        }

        const timeRegex =
          /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (
          !timeRegex.test(
            day.startTime
          ) ||
          !timeRegex.test(
            day.endTime
          )
        ) {
          throw new Error(
            "Invalid working time"
          );
        }

        if (
          day.startTime >=
          day.endTime
        ) {
          throw new Error(
            "End time must be after start time"
          );
        }
      }
    }

    if (
      availableDays === 0
    ) {
      throw new Error(
        "Select at least one working day"
      );
    }

    // Remove old schedule
    await db
      .delete(
        providerAvailability
      )
      .where(
        eq(
          providerAvailability.providerId,
          application.id
        )
      );

    // Save new schedule
    await db
      .insert(
        providerAvailability
      )
      .values(
        schedule.map(
          (day) => ({
            providerId:
              application.id,

            dayOfWeek:
              day.dayOfWeek,

            isAvailable:
              day.isAvailable,

            startTime:
              day.isAvailable
                ? day.startTime
                : null,

            endTime:
              day.isAvailable
                ? day.endTime
                : null,
          })
        )
      );

    return {
      success: true,
      availableDays,
    };
  };

  // ========================================
// SUBMIT PROVIDER APPLICATION
// ========================================

export const submitProviderApplication =
  async (
    clerkUserId: string
  ) => {
    const application =
      await getProviderApplication(
        clerkUserId
      );

    if (!application) {
      throw new Error(
        "Provider application not found"
      );
    }

    // Already submitted
    if (
      application.approvalStatus ===
      "pending"
    ) {
      throw new Error(
        "Application is already under review"
      );
    }

    // Already approved
    if (
      application.approvalStatus ===
      "approved"
    ) {
      throw new Error(
        "Provider is already approved"
      );
    }

    // ====================================
    // Check personal information
    // ====================================

    if (
      !application.fullName?.trim()
    ) {
      throw new Error(
        "Full name is required"
      );
    }

    if (
      !application.phone?.trim()
    ) {
      throw new Error(
        "Phone number is required"
      );
    }

    if (
      !application.city?.trim()
    ) {
      throw new Error(
        "City is required"
      );
    }

    // ====================================
    // Check services
    // ====================================

    const selectedServices =
      await db
        .select({
          id:
            providerServices.id,

          priceAgorot:
            providerServices.priceAgorot,
        })
        .from(
          providerServices
        )
        .where(
          eq(
            providerServices.providerId,
            application.id
          )
        );

    if (
      selectedServices.length ===
      0
    ) {
      throw new Error(
        "Select at least one service"
      );
    }

    const invalidPrice =
      selectedServices.some(
        (service) =>
          service.priceAgorot <= 0
      );

    if (invalidPrice) {
      throw new Error(
        "All services must have a valid price"
      );
    }

    // ====================================
    // Check working hours
    // ====================================

    const schedule =
      await db
        .select()
        .from(
          providerAvailability
        )
        .where(
          eq(
            providerAvailability.providerId,
            application.id
          )
        );

    if (
      schedule.length !== 7
    ) {
      throw new Error(
        "Complete your working hours"
      );
    }

    const availableDays =
      schedule.filter(
        (day) =>
          day.isAvailable
      );

    if (
      availableDays.length ===
      0
    ) {
      throw new Error(
        "Select at least one working day"
      );
    }

    // ====================================
    // SUBMIT
    // ====================================

    const rows =
      await db
        .update(
          serviceProviders
        )
        .set({
          approvalStatus:
            "pending",

          rejectionReason:
            null,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            serviceProviders.id,
            application.id
          )
        )
        .returning();

    return rows[0];
  };