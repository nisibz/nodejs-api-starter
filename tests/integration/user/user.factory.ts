import { createUser } from "@/repositories/user";
import { hashPassword } from "@/utils/bcrypt";
import { signToken } from "@/utils/jwt";
import { prisma } from "@/utils/prisma";
import { Prisma, User } from "@prisma/client";

export const createUserFactory = async (
  overrides: Partial<Prisma.UserCreateInput> = {},
): Promise<{ user: User; token: string }> => {
  const { password: plainPassword, ...restOverrides } = overrides;

  const email = `user_${Date.now()}@test.com`;
  const password = hashPassword(plainPassword ?? "password");

  const user = await createUser({
    email,
    password,
    ...restOverrides,
  });

  const token = signToken(user.id);

  return { user, token };
};

export const cleanUsers = async (): Promise<void> => {
  await prisma.user.deleteMany({});
};
