import {
  and,
  desc,
  eq,
} from "drizzle-orm";

import { db } from "./db/client";

import {
  bookings,
  categories,
  serviceProviders,
  services,
} from "./db/schema";


// ========================================
// GET APPROVED PROVIDER
// ========================================

export const getApprovedProviderByUserId =
  async (
    clerkUserId: string
  ) => {
    const rows =
      await db
        .select()
        .from(
          serviceProviders
        )
        .where(
          eq(
            serviceProviders.clerkUserId,
            clerkUserId
          )
        )
        .limit(1);

    const provider =
      rows[0];

    if (!provider) {
      throw new Error(
        "Provider account not found"
      );
    }

    if (
      provider.approvalStatus !==
      "approved"
    ) {
      throw new Error(
        "Provider account is not approved"
      );
    }

    if (!provider.isActive) {
      throw new Error(
        "Provider account is inactive"
      );
    }

    return provider;
  };


// ========================================
// GET PROVIDER DASHBOARD
// ========================================

export const getProviderDashboard =
  async (
    clerkUserId: string
  ) => {
    const provider =
      await getApprovedProviderByUserId(
        clerkUserId
      );

    const bookingRows =
      await db
        .select({
          booking: {
            id:
              bookings.id,

            customerId:
              bookings.customerId,

            providerId:
              bookings.providerId,

            serviceId:
              bookings.serviceId,

            priceAgorot:
              bookings.priceAgorot,

            bookingDate:
              bookings.bookingDate,

            startTime:
              bookings.startTime,

            address:
              bookings.address,

            notes:
              bookings.notes,

            status:
              bookings.status,

            createdAt:
              bookings.createdAt,

            updatedAt:
              bookings.updatedAt,
          },

          service: {
            id:
              services.id,

            name:
              services.name,

            slug:
              services.slug,

            icon:
              services.icon,
          },

          category: {
            id:
              categories.id,

            name:
              categories.name,

            slug:
              categories.slug,
          },
        })

        .from(
          bookings
        )

        .innerJoin(
          services,
          eq(
            bookings.serviceId,
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
            bookings.providerId,
            provider.id
          )
        )

        .orderBy(
          desc(
            bookings.createdAt
          )
        );


    // =====================================
    // STATS
    // =====================================

    const stats = {
      total:
        bookingRows.length,

      pending:
        bookingRows.filter(
          (item) =>
            item.booking.status ===
            "pending"
        ).length,

      confirmed:
        bookingRows.filter(
          (item) =>
            item.booking.status ===
            "confirmed"
        ).length,

      inProgress:
        bookingRows.filter(
          (item) =>
            item.booking.status ===
              "on_the_way" ||
            item.booking.status ===
              "in_progress"
        ).length,

      completed:
        bookingRows.filter(
          (item) =>
            item.booking.status ===
            "completed"
        ).length,

      cancelled:
        bookingRows.filter(
          (item) =>
            item.booking.status ===
            "cancelled"
        ).length,
    };


    return {
      provider,
      stats,
      bookings:
        bookingRows,
    };
  };

  // ========================================
// UPDATE PROVIDER BOOKING STATUS
// ========================================

type ProviderBookingAction =
  | "accept"
  | "reject"
  | "on_the_way"
  | "start"
  | "complete";

export const updateProviderBookingStatus =
  async (
    clerkUserId: string,
    bookingId: string,
    action: ProviderBookingAction
  ) => {
    const provider =
      await getApprovedProviderByUserId(
        clerkUserId
      );

    const rows =
      await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(
              bookings.id,
              bookingId
            ),
            eq(
              bookings.providerId,
              provider.id
            )
          )
        )
        .limit(1);

    const booking =
      rows[0];

    if (!booking) {
      throw new Error(
        "Booking not found"
      );
    }

    let nextStatus:
      | "confirmed"
      | "cancelled"
      | "on_the_way"
      | "in_progress"
      | "completed";

    // =====================================
    // ACCEPT
    // =====================================

    if (action === "accept") {
      if (
        booking.status !==
        "pending"
      ) {
        throw new Error(
          "Only pending bookings can be accepted"
        );
      }

      nextStatus =
        "confirmed";
    }

    // =====================================
    // REJECT
    // =====================================

    else if (
      action === "reject"
    ) {
      if (
        booking.status !==
        "pending"
      ) {
        throw new Error(
          "Only pending bookings can be rejected"
        );
      }

      nextStatus =
        "cancelled";
    }

    // =====================================
    // ON MY WAY
    // =====================================

    else if (
      action ===
      "on_the_way"
    ) {
      if (
        booking.status !==
        "confirmed"
      ) {
        throw new Error(
          "Booking must be confirmed first"
        );
      }

      nextStatus =
        "on_the_way";
    }

    // =====================================
    // START JOB
    // =====================================

    else if (
      action === "start"
    ) {
      if (
        booking.status !==
        "on_the_way"
      ) {
        throw new Error(
          "Provider must be on the way first"
        );
      }

      nextStatus =
        "in_progress";
    }

    // =====================================
    // COMPLETE JOB
    // =====================================

    else if (
      action === "complete"
    ) {
      if (
        booking.status !==
        "in_progress"
      ) {
        throw new Error(
          "Job must be in progress first"
        );
      }

      nextStatus =
        "completed";
    }

    else {
      throw new Error(
        "Invalid booking action"
      );
    }

    const updated =
      await db
        .update(bookings)
        .set({
          status:
            nextStatus,

          updatedAt:
            new Date(),
        })
        .where(
          and(
            eq(
              bookings.id,
              bookingId
            ),
            eq(
              bookings.providerId,
              provider.id
            )
          )
        )
        .returning();

    return updated[0];
  };