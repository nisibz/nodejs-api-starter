import express from "express";
import { getAllUser, userInfo } from "@/controllers/user";
import { authenticate } from "@/middlewares/auth";

const userRoutet = express.Router();

userRoutet.route("/").get(getAllUser);
userRoutet.route("/me").get(authenticate, userInfo);

export default userRoutet;
