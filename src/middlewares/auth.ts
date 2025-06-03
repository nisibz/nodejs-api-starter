import { Request, Response, NextFunction } from "express";
import { invalidToken, missingAuthToken } from "@/utils/error";
import { verifyToken } from "@/utils/jwt";
import { getUserById } from "@/services/user";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw missingAuthToken;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await getUserById(decoded.id);

    if (!user) throw invalidToken;

    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
