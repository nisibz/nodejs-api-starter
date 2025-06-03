import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "@/utils/response";
import { getPaginationParams } from "@/utils/pagination";
import { getAllUsers } from "@/services/user";

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await getAllUsers(paginationParams);
    sendSuccess(res, result, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const userInfo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, res.locals.user, "User info retrieved successfully");
  } catch (error) {
    next(error);
  }
};
