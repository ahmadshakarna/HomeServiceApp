import {
  and,
  desc,
  eq,
  ne,
} from "drizzle-orm";

import { db } from "./db/client";

import {
  bookings,
  categories,
  providerAvailability,
  providerServices,
  reviews,
  serviceProviders,
  services,
} from "./db/schema";


type CreateBookingInput = {
  // هذا لا يأتي من العميل مباشرة.
  // API يمرره بعد استخراجه من Clerk.
  customerId: string;

  providerId: string;
  serviceId: string;

  bookingDate: string;
  startTime: string;

  address: string;
  notes?: string | null;
};


// ========================================
// POSTGRES ERROR HELPERS
// ========================================

const getPostgresErrorCode = (
  error: unknown
) => {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return null;
  }


  const directCode =
    (
      error as {
        code?: unknown;
      }
    ).code;


  if (
    typeof directCode ===
    "string"
  ) {
    return directCode;
  }


  const cause =
    (
      error as {
        cause?: unknown;
      }
    ).cause;


  if (
    typeof cause === "object" &&
    cause !== null
  ) {
    const causeCode =
      (
        cause as {
          code?: unknown;
        }
      ).code;


    if (
      typeof causeCode ===
      "string"
    ) {
      return causeCode;
    }
  }


  return null;
};


// ========================================
// CREATE BOOKING
// ========================================

export const createBooking =
  async (
    input: CreateBookingInput
  ) => {
    const {
      customerId,
      providerId,
      serviceId,
      bookingDate,
      startTime,
      address,
      notes,
    } = input;


    // =====================================
    // BASIC VALIDATION
    // =====================================

    if (
      !customerId ||
      !providerId ||
      !serviceId ||
      !bookingDate ||
      !startTime ||
      !address?.trim()
    ) {
      throw new Error(
        "Missing required booking information"
      );
    }


    const dateRegex =
      /^\d{4}-\d{2}-\d{2}$/;


    if (
      !dateRegex.test(
        bookingDate
      )
    ) {
      throw new Error(
        "Invalid booking date"
      );
    }


    const timeRegex =
      /^([01]\d|2[0-3]):([0-5]\d)$/;


    const requestedTime =
      String(
        startTime
      ).slice(
        0,
        5
      );


    if (
      !timeRegex.test(
        requestedTime
      )
    ) {
      throw new Error(
        "Invalid booking time"
      );
    }


    // =====================================
    // PROVIDER + SERVICE RELATION
    // =====================================

    const providerServiceRows =
      await db
        .select({
          providerServiceId:
            providerServices.id,

          priceAgorot:
            providerServices.priceAgorot,

          providerId:
            serviceProviders.id,

          serviceId:
            services.id,
        })
        .from(
          providerServices
        )

        .innerJoin(
          serviceProviders,
          eq(
            providerServices.providerId,
            serviceProviders.id
          )
        )

        .innerJoin(
          services,
          eq(
            providerServices.serviceId,
            services.id
          )
        )

        .where(
          and(
            eq(
              providerServices.providerId,
              providerId
            ),

            eq(
              providerServices.serviceId,
              serviceId
            ),

            eq(
              providerServices.isAvailable,
              true
            ),

            eq(
              serviceProviders.isActive,
              true
            ),

            // لا يمكن الحجز عند مقدم خدمة
            // غير معتمد
            eq(
              serviceProviders.approvalStatus,
              "approved"
            ),

            eq(
              services.isActive,
              true
            )
          )
        )

        .limit(
          1
        );


    const providerService =
      providerServiceRows[
        0
      ];


    if (!providerService) {
      throw new Error(
        "This service is not available from this provider"
      );
    }


    // =====================================
    // GET DAY OF WEEK
    // =====================================

    const bookingDateObject =
      new Date(
        `${bookingDate}T12:00:00Z`
      );


    if (
      Number.isNaN(
        bookingDateObject.getTime()
      )
    ) {
      throw new Error(
        "Invalid booking date"
      );
    }


    const dayOfWeek =
      bookingDateObject
        .getUTCDay();


    // =====================================
    // PROVIDER AVAILABILITY
    // =====================================

    const availabilityRows =
      await db
        .select()
        .from(
          providerAvailability
        )

        .where(
          and(
            eq(
              providerAvailability.providerId,
              providerId
            ),

            eq(
              providerAvailability.dayOfWeek,
              dayOfWeek
            ),

            eq(
              providerAvailability.isAvailable,
              true
            )
          )
        )

        .limit(
          1
        );


    const availability =
      availabilityRows[
        0
      ];


    if (
      !availability ||
      !availability.startTime ||
      !availability.endTime
    ) {
      throw new Error(
        "Provider is not available on this day"
      );
    }


    const availableStart =
      availability.startTime.slice(
        0,
        5
      );


    const availableEnd =
      availability.endTime.slice(
        0,
        5
      );


    if (
      requestedTime <
        availableStart ||
      requestedTime >=
        availableEnd
    ) {
      throw new Error(
        "Selected time is outside provider working hours"
      );
    }


    // =====================================
    // PREVENT DOUBLE BOOKING
    // =====================================

    const existingBooking =
      await db
        .select({
          id:
            bookings.id,
        })
        .from(
          bookings
        )

        .where(
          and(
            eq(
              bookings.providerId,
              providerId
            ),

            eq(
              bookings.bookingDate,
              bookingDate
            ),

            eq(
              bookings.startTime,
              requestedTime
            ),

            ne(
              bookings.status,
              "cancelled"
            )
          )
        )

        .limit(
          1
        );


    if (
      existingBooking.length >
      0
    ) {
      throw new Error(
        "This time slot is already booked"
      );
    }


    // =====================================
    // CREATE
    // =====================================

    try {
      const result =
        await db
          .insert(
            bookings
          )

          .values({
            // مصدره Clerk server-side
            customerId,

            providerId,
            serviceId,

            // السعر دائمًا من DB
            priceAgorot:
              providerService.priceAgorot,

            bookingDate,

            startTime:
              requestedTime,

            address:
              address.trim(),

            notes:
              notes?.trim() ||
              null,

            status:
              "pending",
          })

          .returning();


      return result[
        0
      ];

    } catch (error) {
      // PostgreSQL:
      // 23505 = unique_violation
      //
      // هذا هو خط الدفاع النهائي
      // إذا وصل طلبان لنفس الموعد
      // بنفس اللحظة وتجاوزا فحص SELECT.
      if (
        getPostgresErrorCode(
          error
        ) === "23505"
      ) {
        throw new Error(
          "This time slot is already booked"
        );
      }


      throw error;
    }
  };


// ========================================
// LIST PROVIDER BOOKED TIME SLOTS
// ========================================

export const listProviderBookedTimeSlots =
  async (
    providerId: string,
    bookingDate: string
  ) => {
    if (
      !providerId ||
      !bookingDate
    ) {
      throw new Error(
        "Provider id and booking date are required"
      );
    }


    const dateRegex =
      /^\d{4}-\d{2}-\d{2}$/;


    if (
      !dateRegex.test(
        bookingDate
      )
    ) {
      throw new Error(
        "Invalid booking date"
      );
    }


    const rows =
      await db
        .select({
          startTime:
            bookings.startTime,
        })
        .from(
          bookings
        )
        .where(
          and(
            eq(
              bookings.providerId,
              providerId
            ),

            eq(
              bookings.bookingDate,
              bookingDate
            ),

            ne(
              bookings.status,
              "cancelled"
            )
          )
        );


    return rows.map(
      (row) =>
        row.startTime.slice(
          0,
          5
        )
    );
  };


// ========================================
// LIST CUSTOMER BOOKINGS
// ========================================

export const listCustomerBookings =
  async (
    customerId: string
  ) => {
    if (!customerId) {
      throw new Error(
        "Customer id is required"
      );
    }


    const rows =
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

            // FIX:
            // كان مربوط services.slug
            slug:
              categories.slug,
          },

          provider: {
            id:
              serviceProviders.id,

            fullName:
              serviceProviders.fullName,

            city:
              serviceProviders.city,

            isVerified:
              serviceProviders.isVerified,
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

        .innerJoin(
          serviceProviders,
          eq(
            bookings.providerId,
            serviceProviders.id
          )
        )

        .where(
          eq(
            bookings.customerId,
            customerId
          )
        )

        .orderBy(
          desc(
            bookings.createdAt
          )
        );


    return rows;
  };


// ========================================
// GET CUSTOMER BOOKING BY ID
// ========================================

export const getCustomerBookingById =
  async (
    bookingId: string,
    customerId: string
  ) => {
    if (
      !bookingId ||
      !customerId
    ) {
      return null;
    }


    const rows =
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

            description:
              services.description,

            icon:
              services.icon,
          },

          category: {
            id:
              categories.id,

            name:
              categories.name,

            // FIX:
            // كان مربوط services.slug
            slug:
              categories.slug,
          },

          provider: {
            id:
              serviceProviders.id,

            fullName:
              serviceProviders.fullName,

            phone:
              serviceProviders.phone,

            city:
              serviceProviders.city,

            isVerified:
              serviceProviders.isVerified,
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

        .innerJoin(
          serviceProviders,
          eq(
            bookings.providerId,
            serviceProviders.id
          )
        )

        .where(
          and(
            eq(
              bookings.id,
              bookingId
            ),

            // المستخدم لا يستطيع
            // فتح حجز مستخدم آخر
            eq(
              bookings.customerId,
              customerId
            )
          )
        )

        .limit(
          1
        );


    return rows[
      0
    ] ??
      null;
  };


// ========================================
// CANCEL CUSTOMER BOOKING
// ========================================

export const cancelCustomerBooking =
  async (
    bookingId: string,
    customerId: string
  ) => {
    if (
      !bookingId ||
      !customerId
    ) {
      throw new Error(
        "Booking not found"
      );
    }


    const currentRows =
      await db
        .select({
          id:
            bookings.id,

          status:
            bookings.status,
        })

        .from(
          bookings
        )

        .where(
          and(
            eq(
              bookings.id,
              bookingId
            ),

            // العميل الموثق فقط
            eq(
              bookings.customerId,
              customerId
            )
          )
        )

        .limit(
          1
        );


    const current =
      currentRows[
        0
      ];


    if (!current) {
      throw new Error(
        "Booking not found"
      );
    }


    // العميل يستطيع الإلغاء فقط
    // قبل بدء تنفيذ الخدمة
    if (
      current.status !==
        "pending" &&
      current.status !==
        "confirmed"
    ) {
      throw new Error(
        "This booking can no longer be cancelled"
      );
    }


    const rows =
      await db
        .update(
          bookings
        )

        .set({
          status:
            "cancelled",

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
              bookings.customerId,
              customerId
            )
          )
        )

        .returning();


    return rows[
      0
    ];
  };
// ========================================
// GET CUSTOMER BOOKING REVIEW
// ========================================

export const getCustomerBookingReview =
  async (
    bookingId: string,
    customerId: string
  ) => {
    if (
      !bookingId ||
      !customerId
    ) {
      return null;
    }


    const rows =
      await db
        .select({
          id:
            reviews.id,

          bookingId:
            reviews.bookingId,

          providerId:
            reviews.providerId,

          rating:
            reviews.rating,

          comment:
            reviews.comment,

          createdAt:
            reviews.createdAt,
        })
        .from(
          reviews
        )
        .where(
          and(
            eq(
              reviews.bookingId,
              bookingId
            ),

            eq(
              reviews.customerId,
              customerId
            )
          )
        )
        .limit(
          1
        );


    return rows[
      0
    ] ?? null;
  };


// ========================================
// CREATE CUSTOMER BOOKING REVIEW
// ========================================

type CreateBookingReviewInput = {
  bookingId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
};


export const createCustomerBookingReview =
  async (
    input: CreateBookingReviewInput
  ) => {
    const {
      bookingId,
      customerId,
      rating,
      comment,
    } = input;


    if (
      !bookingId ||
      !customerId
    ) {
      throw new Error(
        "Booking not found"
      );
    }


    if (
      !Number.isInteger(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      throw new Error(
        "Rating must be between 1 and 5"
      );
    }


    const cleanComment =
      comment?.trim() ||
      null;


    if (
      cleanComment &&
      cleanComment.length >
        1000
    ) {
      throw new Error(
        "Review comment is too long"
      );
    }


    // =====================================
    // VERIFY BOOKING OWNERSHIP + STATUS
    // =====================================

    const bookingRows =
      await db
        .select({
          id:
            bookings.id,

          providerId:
            bookings.providerId,

          status:
            bookings.status,
        })
        .from(
          bookings
        )
        .where(
          and(
            eq(
              bookings.id,
              bookingId
            ),

            eq(
              bookings.customerId,
              customerId
            )
          )
        )
        .limit(
          1
        );


    const booking =
      bookingRows[
        0
      ];


    if (!booking) {
      throw new Error(
        "Booking not found"
      );
    }


    if (
      booking.status !==
      "completed"
    ) {
      throw new Error(
        "Only completed bookings can be reviewed"
      );
    }


    // =====================================
    // PREVENT DUPLICATE REVIEW
    // =====================================

    const existing =
      await db
        .select({
          id:
            reviews.id,
        })
        .from(
          reviews
        )
        .where(
          eq(
            reviews.bookingId,
            bookingId
          )
        )
        .limit(
          1
        );


    if (
      existing.length >
      0
    ) {
      throw new Error(
        "This booking has already been reviewed"
      );
    }


    // =====================================
    // CREATE REVIEW
    // =====================================

    try {
      const rows =
        await db
          .insert(
            reviews
          )
          .values({
            bookingId,

            // مصدره Clerk server-side
            customerId,

            // لا نأخذه من العميل
            providerId:
              booking.providerId,

            rating,

            comment:
              cleanComment,
          })
          .returning();


      return rows[
        0
      ];

    } catch (error) {
      // reviews_booking_unique
      if (
        getPostgresErrorCode(
          error
        ) === "23505"
      ) {
        throw new Error(
          "This booking has already been reviewed"
        );
      }


      throw error;
    }
  };
// ========================================
// GET PROVIDER REVIEW SUMMARY
// ========================================

export const getProviderReviewSummary =
  async (
    providerId: string
  ) => {
    if (!providerId) {
      return {
        averageRating:
          0,

        reviewCount:
          0,
      };
    }


    const rows =
      await db
        .select({
          rating:
            reviews.rating,
        })
        .from(
          reviews
        )
        .where(
          eq(
            reviews.providerId,
            providerId
          )
        );


    const reviewCount =
      rows.length;


    if (
      reviewCount ===
      0
    ) {
      return {
        averageRating:
          0,

        reviewCount:
          0,
      };
    }


    const total =
      rows.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.rating,
        0
      );


    const averageRating =
      Math.round(
        (
          total /
          reviewCount
        ) *
          10
      ) /
      10;


    return {
      averageRating,
      reviewCount,
    };
  };