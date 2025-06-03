import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "@/utils/response";
import { userlogin, userRegister } from "@/services/auth";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userRegister(req.body);
    sendSuccess(res, user, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await userlogin(req.body);
    sendSuccess(res, result, "Login successful");
  } catch (error) {
    next(error);
  }
};
