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
  serviceProviders,
  services,
} from "./db/schema";

type CreateBookingInput = {
  customerId: string;

  providerId: string;
  serviceId: string;

  bookingDate: string;
  startTime: string;

  address: string;
  notes?: string | null;
};

export const createBooking = async (
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

  // ==========================
  // Basic validation
  // ==========================

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

  // ==========================
  // Provider + Service relation
  // ==========================

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
      .from(providerServices)

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

          eq(
            services.isActive,
            true
          )
        )
      )

      .limit(1);

  const providerService =
    providerServiceRows[0];

  if (!providerService) {
    throw new Error(
      "This service is not available from this provider"
    );
  }

  // ==========================
  // Get day of week
  // ==========================

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
    bookingDateObject.getUTCDay();

  // ==========================
  // Provider availability
  // ==========================

  const availabilityRows =
    await db
      .select()
      .from(providerAvailability)

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

      .limit(1);

  const availability =
    availabilityRows[0];

  if (
    !availability ||
    !availability.startTime ||
    !availability.endTime
  ) {
    throw new Error(
      "Provider is not available on this day"
    );
  }

  // 10:00:00 -> 10:00
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

  const requestedTime =
    startTime.slice(0, 5);

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

  // ==========================
  // Prevent double booking
  // ==========================

  const existingBooking =
    await db
      .select({
        id: bookings.id,
      })
      .from(bookings)

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

      .limit(1);

  if (
    existingBooking.length > 0
  ) {
    throw new Error(
      "This time slot is already booked"
    );
  }

  // ==========================
  // Create booking
  // ==========================

  const result =
    await db
      .insert(bookings)

      .values({
        customerId,

        providerId,
        serviceId,

        // السعر يؤخذ من DB
        priceAgorot:
          providerService.priceAgorot,

        bookingDate,

        startTime:
          requestedTime,

        address:
          address.trim(),

        notes:
          notes?.trim() || null,

        status:
          "pending",
      })

      .returning();

  return result[0];
};

// ========================================
// LIST CUSTOMER BOOKINGS
// ========================================

export const listCustomerBookings = async (
  customerId: string
) => {
  if (!customerId) {
    throw new Error(
      "Customer id is required"
    );
  }

  const rows = await db
    .select({
      booking: {
        id: bookings.id,
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
        id: services.id,
        name: services.name,
        icon: services.icon,
      },

      category: {
        id: categories.id,
        name: categories.name,
      },

      provider: {
        id: serviceProviders.id,
        fullName:
          serviceProviders.fullName,
        city: serviceProviders.city,
        isVerified:
          serviceProviders.isVerified,
      },
    })

    .from(bookings)

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
      desc(bookings.createdAt)
    );

  return rows;
};

// ========================================
// GET CUSTOMER BOOKING BY ID
// ========================================

export const getCustomerBookingById = async (
  bookingId: string,
  customerId: string
) => {
  const rows = await db
    .select({
      booking: {
        id: bookings.id,
        customerId: bookings.customerId,
        providerId: bookings.providerId,
        serviceId: bookings.serviceId,

        priceAgorot: bookings.priceAgorot,

        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,

        address: bookings.address,
        notes: bookings.notes,

        status: bookings.status,

        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
      },

      service: {
        id: services.id,
        name: services.name,
        description: services.description,
        icon: services.icon,
      },

      category: {
        id: categories.id,
        name: categories.name,
      },

      provider: {
        id: serviceProviders.id,
        fullName: serviceProviders.fullName,
        phone: serviceProviders.phone,
        city: serviceProviders.city,
        isVerified: serviceProviders.isVerified,
      },
    })

    .from(bookings)

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

        eq(
          bookings.customerId,
          customerId
        )
      )
    )

    .limit(1);

  return rows[0] ?? null;
};


// ========================================
// CANCEL CUSTOMER BOOKING
// ========================================

export const cancelCustomerBooking = async (
  bookingId: string,
  customerId: string
) => {
  const currentRows = await db
    .select({
      id: bookings.id,
      status: bookings.status,
    })

    .from(bookings)

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

    .limit(1);

  const current =
    currentRows[0];

  if (!current) {
    throw new Error(
      "Booking not found"
    );
  }

  // العميل يستطيع الإلغاء فقط
  // قبل بدء تنفيذ الخدمة
  if (
    current.status !== "pending" &&
    current.status !== "confirmed"
  ) {
    throw new Error(
      "This booking can no longer be cancelled"
    );
  }

  const rows = await db
    .update(bookings)

    .set({
      status: "cancelled",
      updatedAt: new Date(),
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

  return rows[0];
};