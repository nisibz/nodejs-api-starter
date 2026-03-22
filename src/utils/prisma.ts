import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/config";

const connectionString = config.database_url;
const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
  adapter,
});
