import { Request, Response, NextFunction } from "express";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { asyncLocalStorage, filterSensitiveData, RequestContext } from "./requestContext";

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

// Helper to build common log context
const buildLogContext = (context: RequestContext) => ({
  requestId: context.requestId,
  userId: context.userId,
  method: context.method,
  url: context.url,
  ip: context.ip,
});

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
    ...buildLogContext(context),
    query: filterSensitiveData(req.query),
    params: filterSensitiveData(req.params),
  });

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const isError = res.statusCode >= 400;

    if (isError) {
      logger.error("Error occurred", {
        ...buildLogContext(context),
        error: {
          message: context.error?.message,
          stack: context.error?.stack,
        },
        query: filterSensitiveData(context.query),
        params: filterSensitiveData(context.params),
        body: filterSensitiveData(context.body),
        headers: filterSensitiveData(context.headers),
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    } else {
      logger.info("Request completed", {
        ...buildLogContext(context),
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

// Convenience function - dynamically log with level
export const log = (
  level: "info" | "error" | "warn" | "debug",
  message: string,
  meta?: Record<string, any>,
): void => {
  getLogger()[level](message, { detail: meta });
};

export default logger;
