import { prisma } from "@/utils/prisma";
import { Prisma, User } from "@prisma/client";

export const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
  try {
    return await prisma.user.create({
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const findAllUsers = async (
  skip: number,
  take: number,
  where?: Prisma.UserWhereInput,
  orderBy?: Prisma.UserOrderByWithRelationInput
): Promise<User[]> => {
  try {
    return await prisma.user.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: "desc" },
    });
  } catch (error) {
    throw error;
  }
};

export const countUser = async (
  where?: Prisma.UserWhereInput
): Promise<number> => {
  try {
    return await prisma.user.count({ where });
  } catch (error) {
    throw error;
  }
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { id },
  });
};
