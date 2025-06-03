import bcrypt from "bcryptjs";

export const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (password: string, userPassword: string): boolean => {
  return bcrypt.compareSync(password, userPassword);
};
