import { Response } from "express";
import { asyncLocalStorage } from "@/utils/requestContext";
import { ValidationError } from "@/utils/error";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  requestId?: string;
  errorStack?: string;
  errors?: ValidationError[];
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

export const sendValidationError = (
  res: Response,
  message: string,
  errors: ValidationError[],
  statusCode: number = 400,
  errorStack?: string,
): void => {
  const store = asyncLocalStorage.getStore();
  const response: ApiResponse = {
    success: false,
    message,
    errors,
    ...(store && { requestId: store.requestId }),
    ...(errorStack && { errorStack }),
  };
  res.status(statusCode).json(response);
};
