import { Response } from "express";
import { asyncLocalStorage } from "@/utils/requestContext";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  requestId?: string;
  errorStack?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string = "Error",
  statusCode: number = 400,
  errorStack?: string,
): void => {
  const store = asyncLocalStorage.getStore();
  const response: ApiResponse = {
    success: false,
    message,
    ...(store && { requestId: store.requestId }),
    ...(errorStack && { errorStack }),
  };
  res.status(statusCode).json(response);
};
