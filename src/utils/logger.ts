import { Request, Response, NextFunction } from "express";
import winston from "winston";

const sensitiveFields = ["password", "token", "authorization", "jwt", "secret", "key"];

const filterSensitiveData = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => filterSensitiveData(item));
  }

  const filtered: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      filtered[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }
  return filtered;
};

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
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  logger.info("Incoming request", {
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    body: filterSensitiveData(req.body),
    query: filterSensitiveData(req.query),
    params: req.params,
  });

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

export const logPrismaQuery = (event: {
  query: string;
  params: string;
  duration: number;
  timestamp?: Date;
}): void => {
  logger.debug("Prisma query executed", {
    query: event.query,
    duration: `${event.duration}ms`,
    params: filterSensitiveData(JSON.parse(event.params)),
    timestamp: event.timestamp,
  });
};

export const logError = (error: Error, context?: any): void => {
  logger.error("Error occurred", {
    message: error.message,
    stack: error.stack,
    context: filterSensitiveData(context),
  });
};

export default logger;
