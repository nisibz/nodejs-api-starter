import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { logPrismaQuery } from "./logger";
import { config } from "../config/config";

const connectionString = config.database_url;
const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
  adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prisma.$on("query", (e): void => {
  logPrismaQuery(e);
});

prisma.$on("error", (e): void => {
  console.error("Prisma error:", e);
});
