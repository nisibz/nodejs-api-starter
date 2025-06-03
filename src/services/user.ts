import { User } from "@prisma/client";
import { notFound } from "@/utils/error";
import {
  PaginationParams,
  PaginatedResponse,
  calculatePagination,
  getPrismaSkipTake,
} from "@/utils/pagination";
import { countUser, findAllUsers, findUserById } from "@/repositories/user";

export const getAllUsers = async (
  paginationParams: PaginationParams,
): Promise<PaginatedResponse<Omit<User, "password">>> => {
  const { page, limit } = paginationParams;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const [users, total] = await Promise.all([findAllUsers(skip, take), countUser()]);

  const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
  const pagination = calculatePagination(page, limit, total);

  return {
    data: usersWithoutPassword,
    pagination,
  };
};

export const getUserById = async (id: string): Promise<Omit<User, "password">> => {
  const user = await findUserById(id);
  if (!user) throw notFound("User");
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
