import winston from "winston";

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
  ),
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? winston.format.json()
          : winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const logEntry = { level, message, timestamp, ...meta };
              return JSON.stringify(logEntry, null, 2);
            }),
    }),
  ],
  defaultMeta: {},
});

export default logger;
