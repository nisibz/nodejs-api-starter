import dotenv from "dotenv";
import { expand } from "dotenv-expand";

expand(dotenv.config());

export const config = {
  port: process.env.PORT || 3000,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET || "",
  access_token_expires: process.env.ACCESS_TOKEN_EXPIRES || "7D",
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000"],
  database_url: process.env.DATABASE_URL || "",
};
