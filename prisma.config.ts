import "dotenv/config"
import { defineConfig } from "prisma/config"

// honey: generate needs no DB; a placeholder keeps `npm install` working on Vercel
// where the migration URL may be absent. Migrations always run with the real env set.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? "postgresql://user:password@localhost:5432/gradly",
  },
})
