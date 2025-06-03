import { PrismaClient } from "@prisma/client";
import { logPrismaQuery } from "./logger";

export const prisma = new PrismaClient({
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
