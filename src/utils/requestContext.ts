import { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "crypto";

export interface RequestContext {
  requestId: string;
  body?: any;
  method: string;
  url: string;
  ip?: string;
  userAgent?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, string | string[] | undefined>;
  error?: { message: string; stack?: string };
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

const sensitiveFields = ["password", "token", "authorization", "jwt", "secret", "key"];

export const filterSensitiveData = (obj: any): any => {
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

// Initialize AsyncLocalStorage with request context
// MUST be used before logRequest middleware
export const initRequestContext = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = randomUUID();

  const context: RequestContext = {
    requestId,
    body: filterSensitiveData(req.body),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    query: req.query,
    params: req.params,
    headers: req.headers,
  };

  // Run entire request lifecycle with this context
  asyncLocalStorage.run(context, () => {
    // Set X-Request-ID header for client debugging
    res.setHeader("X-Request-ID", requestId);
    next();
  });
};

// Helper to update error context in AsyncLocalStorage
export const setErrorContext = (error: { message: string; stack?: string }): void => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.error = error;
  }
};
