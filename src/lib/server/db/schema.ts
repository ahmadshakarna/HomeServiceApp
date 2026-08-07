// This file defines the schema for the "grocery_items" table in the database using Drizzle ORM. It specifies the structure of the table, including column names, data types, and constraints.
import {  pgTable,uuid,varchar,text,boolean,integer,timestamp,bigint} from "drizzle-orm/pg-core";

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