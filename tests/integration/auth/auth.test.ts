import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "@/server";
import { prisma } from "@/utils/prisma";
import { cleanUsers, createUserFactory } from "../user/user.factory";

const apiAuthPath = "/api/auth";

describe("Auth Integration Tests", (): void => {
  beforeAll(async (): Promise<void> => {
    await cleanUsers();
  });

  afterAll(async (): Promise<void> => {
    await cleanUsers();
    await prisma.$disconnect();
  });

  const testUser = { email: "testuser@example.com", password: "testpassword" };

  describe(`POST ${apiAuthPath}/register`, () => {
    test("should register a new user successfully", async (): Promise<void> => {
      const res = await request(app)
        .post(apiAuthPath + "/register")
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "User registered successfully");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("email", testUser.email);
      expect(res.body.data).not.toHaveProperty("password");
    });

    test("should fail to register with existing email", async (): Promise<void> => {
      await cleanUsers();
      // Register once
      await request(app)
        .post(apiAuthPath + "/register")
        .send(testUser)
        .expect(201);

      // Try to register again with same email
      const res = await request(app)
        .post(apiAuthPath + "/register")
        .send(testUser)
        .expect(400);

      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "User already exists");
    });

    test("should fail registration with missing email", async (): Promise<void> => {
      const res = await request(app)
        .post(apiAuthPath + "/register")
        .send({ password: "validpass" })
        .expect(400);

      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Validation failed");
      expect(res.body).toHaveProperty("errors");
      expect(Array.isArray(res.body.errors)).toBe(true);
      const emailError = res.body.errors.find((e: any) => e.field === "email");
      expect(emailError).toBeDefined();
      expect(emailError.code).toBe("REQUIRED");
    });

    test("should fail login with missing password", async (): Promise<void> => {
      const res = await request(app)
        .post(apiAuthPath + "/login")
        .send({ email: testUser.email })
        .expect(400);

      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Validation failed");
      expect(res.body).toHaveProperty("errors");
      expect(Array.isArray(res.body.errors)).toBe(true);
      const passwordError = res.body.errors.find((e: any) => e.field === "password");
      expect(passwordError).toBeDefined();
      expect(passwordError.code).toBe("REQUIRED");
    });

    test("should fail with weak password", async (): Promise<void> => {
      const res = await request(app)
        .post(apiAuthPath + "/register")
        .send({
          email: "weak@test.com",
          password: "123", // Too short
        })
        .expect(400);

      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Validation failed");
      expect(res.body).toHaveProperty("errors");
      const passwordError = res.body.errors.find((e: any) => e.field === "password");
      expect(passwordError).toBeDefined();
      expect(passwordError.code).toBe("MIN_LENGTH");
      expect(passwordError.message).toContain("6 characters");
    });

    test("should treat email case-insensitively", async (): Promise<void> => {
      await request(app)
        .post(apiAuthPath + "/register")
        .send({
          email: "CaseSensitive@Example.COM",
          password: "password123",
        });

      const res = await request(app)
        .post(apiAuthPath + "/login")
        .send({
          email: "casesensitive@example.com",
          password: "password123",
        })
        .expect(200);

      expect(res.body).toHaveProperty("success", true);

      const user = await prisma.user.findUnique({
        where: { email: "casesensitive@example.com" },
      });
      expect(user?.email).toBe("casesensitive@example.com");
    });
  });

  describe(`POST ${apiAuthPath}/login`, (): void => {
    beforeEach(async (): Promise<void> => {
      await cleanUsers();
      await createUserFactory(testUser);
    });

    test("should login successfully with correct credentials", async (): Promise<void> => {
      const res = await request(app)
        .post(apiAuthPath + "/login")
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "Login successful");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("email", testUser.email);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(typeof res.body.data.accessToken).toBe("string");
    });

    test("should fail login with wrong password", async (): Promise<void> => {
      const res = await request(app)
        .post(apiAuthPath + "/login")
        .send({ email: testUser.email, password: "wrongpassword" })
        .expect(401);

      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });

    test("should fail login with non-existent email", async (): Promise<void> => {
      const res = await request(app)
        .post(apiAuthPath + "/login")
        .send({ email: "nonexistent@example.com", password: "any" })
        .expect(401);

      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });
  });
});
