import bcrypt from "bcryptjs";

async function seedUsers(prisma) {
  try {
    const usersToCreate = Array.from({ length: 5 }, (_v, i) => ({
      email: `user${i + 1}@example.com`,
      password: `password${i + 1}`,
    }));

    for (const userData of usersToCreate) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          password: hashedPassword,
        },
      });
    }

    console.log("User seeding completed successfully!");
  } catch (error) {
    console.error("Error during user seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default seedUsers;
