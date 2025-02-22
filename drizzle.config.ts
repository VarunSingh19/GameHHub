import { defineConfig } from "drizzle-kit";

if (!process.env.MONGODB_URI) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.MONGODB_URI,
  },
});
