declare var process: { env: { [key: string]: string | undefined } };
import { defineConfig } from "@prisma/config";

const isTest = process.env.NODE_ENV === "test";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: isTest ? "file:./prisma/test.db" : "file:./prisma/dev.db",
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});