import { PrismaClient } from "@prisma/client";
import seedUsers from "./seed/users.mjs";

const prisma = new PrismaClient();

async function seed() {
  try {
    await seedUsers();
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

try {
  await seed();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
