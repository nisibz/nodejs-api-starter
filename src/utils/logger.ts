import { Request, Response, NextFunction } from "express";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { asyncLocalStorage, filterSensitiveData } from "./requestContext";

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const filteredMeta = filterSensitiveData(meta);
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...filteredMeta,
      });
    }),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.json()),
    }),
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
  defaultMeta: {},
});

// Helper to get logger with current request context
export const getLogger = () => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    return logger.child({
      requestId: store.requestId,
      userId: store.userId,
    });
  }
  return logger;
};

// Log request events - gets context from AsyncLocalStorage
// MUST be used after initRequestContext middleware
export const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  const context = asyncLocalStorage.getStore();
  if (!context) {
    return next();
  }

  const startTime = Date.now();

  // Log incoming request WITHOUT body
  logger.info("Incoming request", {
    requestId: context.requestId,
    userId: context.userId,
    method: context.method,
    url: context.url,
    ip: context.ip,
    query: filterSensitiveData(req.query),
    params: req.params,
  });

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const isError = res.statusCode >= 400;

    if (isError) {
      logger.error("Error occurred", {
        requestId: context.requestId,
        userId: context.userId,
        errorMessage: context.error?.message,
        errorStack: context.error?.stack,
        method: context.method,
        url: context.url,
        query: filterSensitiveData(context.query),
        params: filterSensitiveData(context.params),
        body: filterSensitiveData(context.body),
        headers: filterSensitiveData(context.headers),
        ip: context.ip,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    } else {
      logger.info("Request completed", {
        requestId: context.requestId,
        userId: context.userId,
        method: context.method,
        url: context.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

export const logPrismaQuery = (event: {
  query: string;
  params: string;
  duration: number;
  timestamp?: Date;
}): void => {
  const logger = getLogger();
  logger.debug("Prisma query executed", {
    query: event.query,
    duration: `${event.duration}ms`,
    params: filterSensitiveData(JSON.parse(event.params)),
    timestamp: event.timestamp,
  });
};

export interface ErrorLogData {
  errorMessage: string;
  errorStack?: string;
  method: string;
  url: string;
  query: Record<string, any>;
  params: Record<string, any>;
  body: Record<string, any>;
  headers: Record<string, string | string[] | undefined>;
  ip: string | undefined;
}

export const logErrorData = (data: ErrorLogData): void => {
  const logger = getLogger();
  logger.error("Error occurred", {
    errorMessage: data.errorMessage,
    errorStack: data.errorStack,
    method: data.method,
    url: data.url,
    query: filterSensitiveData(data.query),
    params: filterSensitiveData(data.params),
    body: filterSensitiveData(data.body),
    headers: filterSensitiveData(data.headers),
    ip: data.ip,
  });
};

// Convenience function - dynamically log with level
export const log = (
  level: "info" | "error" | "warn" | "debug",
  message: string,
  meta?: Record<string, any>
): void => {
  getLogger()[level](message, meta);
};

export default logger;
