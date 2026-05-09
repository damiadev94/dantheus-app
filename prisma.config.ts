import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Carga .env.test si NODE_ENV=test, si no carga .env por defecto
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),
  },
});
