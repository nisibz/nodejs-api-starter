import jwt from "jsonwebtoken";
import { config } from "@/config/config";
import { invalidToken } from "./error";

export const signToken = (id: string): string => {
  return jwt.sign({ id }, config.access_token_secret!, {
    expiresIn: config.access_token_expires,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): { id: string } => {
  try {
    return jwt.verify(token, config.access_token_secret) as {
      id: string;
    };
  } catch (error) {
    throw invalidToken;
  }
};
