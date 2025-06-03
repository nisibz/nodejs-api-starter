import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "@/server";
import { prisma } from "@/utils/prisma";
import { cleanUsers, createUserFactory } from "./user.factory";
import { User } from "@prisma/client";

const apiUserPath = "/api/user";

describe("User Integration Tests", (): void => {
  const testUser = { email: "testuser@example.com", password: "testpassword" };
  let accessToken: string;

  beforeAll(async (): Promise<void> => {
    await cleanUsers();
    const { token } = await createUserFactory(testUser);
    accessToken = token;
  });

  afterAll(async (): Promise<void> => {
    await cleanUsers();
    await prisma.$disconnect();
  });

  describe(`GET ${apiUserPath}/all`, (): void => {
    test(` should return all users without passwords with pagination`, async (): Promise<void> => {
      const res = await request(app)
        .get(apiUserPath + "/all?page=1&limit=10")
        .expect(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "Users retrieved successfully");
      expect(res.body.data).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(res.body.data.data.length).toBeGreaterThan(0);

      expect(res.body.data.pagination).toHaveProperty("page", 1);
      expect(res.body.data.pagination).toHaveProperty("limit", 10);
      expect(res.body.data.pagination).toHaveProperty("total");
      expect(res.body.data.pagination).toHaveProperty("totalPages");
      expect(res.body.data.pagination).toHaveProperty("hasNext");
      expect(res.body.data.pagination).toHaveProperty("hasPrev", false);

      res.body.data.data.forEach((user: User): void => {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).not.toHaveProperty("password");
      });
    });

    test(`should return users with default pagination when no params provided`, async (): Promise<void> => {
      const res = await request(app)
        .get(apiUserPath + "/all")
        .expect(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.pagination).toHaveProperty("page", 1);
      expect(res.body.data.pagination).toHaveProperty("limit", 10);
    });
  });

  describe(`GET ${apiUserPath}/me`, (): void => {
    test(`should return authenticated user info`, async (): Promise<void> => {
      const res = await request(app)
        .get(apiUserPath + "/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "User info retrieved successfully");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("email", testUser.email);
      expect(res.body.data).not.toHaveProperty("password");
    });

    test(`without token should return 401`, async (): Promise<void> => {
      const res = await request(app)
        .get(apiUserPath + "/me")
        .expect(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Missing authorization token");
    });
  });
});
