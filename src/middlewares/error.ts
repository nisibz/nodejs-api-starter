import { NextFunction, Request, Response } from "express";
import { sendError } from "@/utils/response";
import { apiPathNotFound } from "@/utils/error";
import { setContext } from "@/utils/requestContext";

export const error404Handler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(apiPathNotFound);
};

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.status || 500;
  const errorMessages = err.messages || ["Internal Server Error"];
  const errorString = Array.isArray(errorMessages) ? errorMessages.join(", ") : errorMessages;

  // Store error in AsyncLocalStorage for logging in finish event
  setContext({
    error: {
      message: err.message || errorString,
      stack: err.stack,
    },
  });

  sendError(res, errorString, statusCode, err.stack);
};
