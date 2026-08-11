// This file defines the schema for the "grocery_items" table in the database using Drizzle ORM. It specifies the structure of the table, including column names, data types, and constraints.
import {  pgTable,uuid,text,boolean,integer,timestamp,bigint, uniqueIndex,time} from "drizzle-orm/pg-core";
import {
  sql,
} from "drizzle-orm";
export const groceryItems = pgTable("grocery_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(1),
  purchased: boolean("purchased").notNull().default(false),
  priority: text("priority").notNull().default("medium"),
  updated_at: bigint("updated_at", { mode: "number" }).notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey(),

  name: text("name").notNull(),

  slug: text("slug")
    .notNull()
    .unique(),

  description: text("description"),

  icon: text("icon"),

  sortOrder: integer("sort_order")
    .notNull()
    .default(0),

  isActive: boolean("is_active")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
export const services = pgTable("services", {
  id: uuid("id").primaryKey(),

  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, {
      onDelete: "cascade",
    }),

  name: text("name").notNull(),

  slug: text("slug")
    .notNull()
    .unique(),

  description: text("description"),

  icon: text("icon"),

  sortOrder: integer("sort_order")
    .notNull()
    .default(0),

  isActive: boolean("is_active")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

// ===============================
// SERVICE PROVIDERS
// ===============================

export const serviceProviders = pgTable("service_providers", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  // Clerk user id
  // نخليه nullable حاليًا حتى نقدر نضيف Providers تجريبيين
  clerkUserId: text("clerk_user_id")
    .unique(),

  fullName: text("full_name")
    .notNull(),

  phone: text("phone"),

  email: text("email"),

  profileImage: text("profile_image"),

  bio: text("bio"),

  city: text("city"),

  experienceYears: integer("experience_years")
    .notNull()
    .default(0),

  isVerified: boolean("is_verified")
    .notNull()
    .default(false),

  isActive: boolean("is_active")
    .notNull()
    .default(true),

  approvalStatus: text("approval_status")
  .notNull()
  .default("draft"),

   rejectionReason: text("rejection_reason"),   

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

   
});


// ===============================
// PROVIDER SERVICES
// ===============================

export const providerServices = pgTable(
  "provider_services",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    providerId: uuid("provider_id")
      .notNull()
      .references(() => serviceProviders.id, {
        onDelete: "cascade",
      }),

    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, {
        onDelete: "cascade",
      }),

    // السعر بالأغورات
    // 8000 = 80.00 ₪
    priceAgorot: integer("price_agorot")
      .notNull()
      .default(0),

    isAvailable: boolean("is_available")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    providerServiceUnique: uniqueIndex(
      "provider_services_provider_service_unique"
    ).on(
      table.providerId,
      table.serviceId
    ),
  })
);

export const providerAvailability = pgTable(
  "provider_availability",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    providerId: uuid("provider_id")
      .notNull()
      .references(() => serviceProviders.id, {
        onDelete: "cascade",
      }),

    // 0 = Sunday
    // 1 = Monday
    // ...
    // 6 = Saturday
    dayOfWeek: integer("day_of_week")
      .notNull(),

    startTime: time("start_time"),

    endTime: time("end_time"),

    isAvailable: boolean("is_available")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    providerDayUnique: uniqueIndex(
      "provider_availability_provider_day_unique"
    ).on(
      table.providerId,
      table.dayOfWeek
    ),
  })
);

// Bookings table
// ===============================
// BOOKINGS
// ===============================

export const bookings = pgTable(
  "bookings",

  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),


    // Clerk user id للعميل
    customerId: text(
      "customer_id"
    )
      .notNull(),


    providerId: uuid(
      "provider_id"
    )
      .notNull()
      .references(
        () =>
          serviceProviders.id,
        {
          onDelete:
            "cascade",
        }
      ),


    serviceId: uuid(
      "service_id"
    )
      .notNull()
      .references(
        () =>
          services.id,
        {
          onDelete:
            "cascade",
        }
      ),


    // السعر وقت الحجز
    // يبقى محفوظ حتى لو تغير سعر الخدمة لاحقًا
    priceAgorot: integer(
      "price_agorot"
    )
      .notNull(),


    bookingDate: text(
      "booking_date"
    )
      .notNull(),


    startTime: time(
      "start_time"
    )
      .notNull(),


    address: text(
      "address"
    )
      .notNull(),


    notes: text(
      "notes"
    ),


    status: text(
      "status"
    )
      .notNull()
      .default(
        "pending"
      ),


    createdAt: timestamp(
      "created_at",
      {
        withTimezone:
          true,
      }
    )
      .defaultNow()
      .notNull(),


    updatedAt: timestamp(
      "updated_at",
      {
        withTimezone:
          true,
      }
    )
      .defaultNow()
      .notNull(),
  },


  // ========================================
  // INDEXES
  // ========================================

  (table) => ({
    providerTimeUnique:
      uniqueIndex(
        "bookings_provider_date_time_active_unique"
      )
        .on(
          table.providerId,
          table.bookingDate,
          table.startTime
        )
        .where(
          sql`${table.status} <> 'cancelled'`
        ),
  })
);

// =====================================
// reviews
// =====================================
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    bookingId: uuid(
      "booking_id"
    )
      .notNull()
      .references(
        () => bookings.id,
        {
          onDelete:
            "cascade",
        }
      ),

    // Clerk customer id
    customerId: text(
      "customer_id"
    )
      .notNull(),

    providerId: uuid(
      "provider_id"
    )
      .notNull()
      .references(
        () =>
          serviceProviders.id,
        {
          onDelete:
            "cascade",
        }
      ),

    rating: integer(
      "rating"
    )
      .notNull(),

    comment: text(
      "comment"
    ),

    createdAt: timestamp(
      "created_at",
      {
        withTimezone:
          true,
      }
    )
      .defaultNow()
      .notNull(),

    updatedAt: timestamp(
      "updated_at",
      {
        withTimezone:
          true,
      }
    )
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    bookingReviewUnique:
      uniqueIndex(
        "reviews_booking_unique"
      ).on(
        table.bookingId
      ),
  })
);