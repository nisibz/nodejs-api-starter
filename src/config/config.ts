import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET || "",
  access_token_expires: process.env.ACCESS_TOKEN_EXPIRES || "7D",
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000"],
};
