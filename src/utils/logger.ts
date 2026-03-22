import winston from "winston";
import { trace } from "@opentelemetry/api";

// Custom format to add trace context from OpenTelemetry
const traceFormat = winston.format((info) => {
  const span = trace.getActiveSpan();
  if (span) {
    const spanContext = span.spanContext();
    info.traceId = spanContext.traceId;
    info.spanId = spanContext.spanId;
  }
  return info;
})();

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    traceFormat, // Add trace context from OpenTelemetry
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.json()),
    }),
  ],
  defaultMeta: {},
});

export default logger;
