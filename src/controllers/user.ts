import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "@/utils/response";
import { getQueryParams, SortableFieldsConfig } from "@/utils/pagination";
import { getAllUsers } from "@/services/user";
import { log } from "@/utils/logger";

const USER_SORTABLE_CONFIG: SortableFieldsConfig = {
  fields: ['id', 'email', 'createdAt', 'updatedAt'],
  defaultField: 'createdAt',
  defaultOrder: 'desc',
};

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const queryParams = getQueryParams(req.query, USER_SORTABLE_CONFIG);
    const result = await getAllUsers(queryParams);
    sendSuccess(res, result, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const userInfo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    log("info", "User info", res.locals.user);
    sendSuccess(res, res.locals.user, "User info retrieved successfully");
  } catch (error) {
    next(error);
  }
};
