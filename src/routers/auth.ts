import express from "express";
import { validate } from "@/middlewares/validate";
import { loginSchema, registerSchema } from "@/schemas/auth";
import { login, register } from "@/controllers/auth";

const authRoutet = express.Router();

authRoutet.route("/register").post(validate(registerSchema), register);
authRoutet.route("/login").post(validate(loginSchema), login);

export default authRoutet;
