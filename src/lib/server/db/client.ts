// This file is used to create a database client for the application. It uses the neon package to connect to a Neon database and the drizzle-orm package to provide an ORM interface for interacting with the database. The schema for the database is imported from the schema.ts file.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for API routes.");
}

const sql = neon(databaseUrl);

export const db = drizzle({ client: sql, schema });