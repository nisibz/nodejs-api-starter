import { User } from "@prisma/client";
import { notFound } from "@/utils/error";
import {
  QueryParams,
  PaginatedResponse,
  calculatePagination,
  getPrismaSkipTake,
  buildPrismaOrderBy,
  buildPrismaSearchWhere,
} from "@/utils/pagination";
import { countUser, findAllUsers, findUserById } from "@/repositories/user";

const USER_SEARCHABLE_FIELDS = ['email'];

export const getAllUsers = async (
  queryParams: QueryParams,
): Promise<PaginatedResponse<Omit<User, "password">>> => {
  const { page, limit, sort, order, search } = queryParams;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const where = buildPrismaSearchWhere(search, USER_SEARCHABLE_FIELDS);
  const orderBy = buildPrismaOrderBy(sort, order);

  const [users, total] = await Promise.all([
    findAllUsers(skip, take, where, orderBy),
    countUser(where),
  ]);

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
