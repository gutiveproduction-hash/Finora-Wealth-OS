import type { Config } from "drizzle-kit";

// Used only for `npm run db:generate` (drizzle-kit) to produce SQL migration files
// from the schema in electron/db/schema.ts. The app itself runs migrations at
// startup from electron/db/migrations via drizzle-orm's migrator (see electron/db/index.ts).
export default {
  schema: "./electron/db/schema.ts",
  out: "./electron/db/migrations",
  dialect: "sqlite",
} satisfies Config;
