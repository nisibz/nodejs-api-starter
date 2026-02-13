import express, { Express, Request, Response } from "express";
import { config } from "../config/config";
import userRoute from "./user";
import authRoute from "./auth";

const router = express.Router();

export const routes = (app: Express): void => {
  app.get("/", (_req: Request, res: Response): void => {
    res.json({ message: `welcome to ${config.workspace}` });
  });

  app.use("/api", router);

  router.get("/", (_req: Request, res: Response): void => {
    res.sendStatus(200);
  });

  router.use("/user", userRoute);
  router.use("/auth", authRoute);
};
