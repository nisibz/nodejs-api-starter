import { Response } from "express";
import { trace } from "@opentelemetry/api";
import { ValidationError } from "@/utils/error";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  traceId?: string;
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
  const span = trace.getActiveSpan();
  const response: ApiResponse = {
    success: false,
    message,
    ...(span && { traceId: span.spanContext().traceId }),
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
  const span = trace.getActiveSpan();
  const response: ApiResponse = {
    success: false,
    message,
    errors,
    ...(span && { traceId: span.spanContext().traceId }),
    ...(errorStack && { errorStack }),
  };
  res.status(statusCode).json(response);
};
