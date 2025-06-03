import { User } from "@prisma/client";
import { createUser, findUserByEmail } from "@/repositories/user";
import { alreadyExists, invalidCredentials } from "@/utils/error";
import { comparePassword, hashPassword } from "@/utils/bcrypt";
import { signToken } from "@/utils/jwt";

export const userRegister = async (data: {
  email: string;
  password: string;
}): Promise<Omit<User, "password">> => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw alreadyExists("User");
  }

  const hashedPassword = hashPassword(data.password);
  const newUser = await createUser({
    email: normalizedEmail,
    password: hashedPassword,
  });

  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const userlogin = async (data: {
  email: string;
  password: string;
}): Promise<{ id: string; email: string; accessToken: string }> => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);

  if (!user || !comparePassword(data.password, user?.password)) {
    throw invalidCredentials;
  }

  const token = signToken(user.id);

  return {
    id: user.id,
    email: user.email,
    accessToken: token,
  };
};
