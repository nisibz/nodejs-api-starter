import express from "express";
import { config } from "./config/config";
import { routes } from "./routers";
import cors from "cors";
import logger, { logRequest } from "@/utils/logger";
import { initRequestContext } from "@/utils/requestContext";
import { error404Handler, errorHandler } from "./middlewares/error";

// Use allowed origins from config
const allowedOrigins = config.allowedOrigins;

const app = express();

// Update the CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Initialize request context BEFORE logRequest
app.use(initRequestContext);
app.use(logRequest);

routes(app);

app.use(error404Handler);
app.use(errorHandler);

app.listen(config.port, (): void => {
  logger.info(`Server running on port ${config.port}`);
});

export default app;
