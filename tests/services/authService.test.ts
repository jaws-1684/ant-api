import db from "../../utils/db.ts";
import userService from "../../services/userService.ts";
import authService from "../../services/authService.ts";
import { addRandomUser, randomUser } from "../test_helper.ts";
import { initLazy } from "../test_lazy.ts";
import { UserDTO } from "../../types/index.ts";

describe("Auth service", () => {
  const { lazy, define, clear } = initLazy<{
    user: UserDTO;
  }>();

  define("user", addRandomUser);

  beforeAll(async () => await db.connect());
  afterAll(async () => await db.disconnect());
  beforeEach(async () => {
    await db.drop();
    clear();
  });

  describe("#loginUser", () => {
    it("should login with email and password", async () => {
      const { email, password } = randomUser();
      await userService.addUser({
        email,
        password,
        username: "testuser",
      });
      const user = await authService.loginUser({ email, password });
      expect(user).toHaveProperty("id");
      expect(user.email).toEqual(email);
    });

    it("should login with username and password", async () => {
      const { username, password } = randomUser();
      await userService.addUser({
        username,
        password,
        email: "test@email.com",
      });
      const user = await authService.loginUser({ username, password });
      expect(user.username).toEqual(username);
    });

    it("should throw on invalid password", async () => {
      const user = await lazy.user;
      await expect(
        authService.loginUser({ email: user.email, password: "wrongpassword" }),
      ).rejects.toThrow();
    });

    it("should throw on unknown email", async () => {
      await expect(
        authService.loginUser({
          email: "ghost@email.com",
          password: "password123",
        }),
      ).rejects.toThrow();
    });
  });

  describe("#createAccessToken", () => {
    it("should return an access token for a valid refresh token", async () => {
      const user = await lazy.user;
      const refreshToken = await authService.createRefreshToken(user.id);
      const accessToken = await authService.createAccessToken(refreshToken);
      expect(typeof accessToken).toEqual("string");
      expect(accessToken.length).toBeGreaterThan(0);
    });

    it("should throw on invalid refresh token", async () => {
      await expect(
        authService.createAccessToken("invalidtoken"),
      ).rejects.toThrow();
    });

    it("should throw if refresh token doesnt match stored token", async () => {
      const user = await lazy.user;
      await authService.createRefreshToken(user.id);
      await expect(
        authService.createAccessToken("valid.but.wrong.token"),
      ).rejects.toThrow();
    });
  });
  describe("#updateCredentials", () => {
    it("should not update the email if the password is wrong", async () => {
      const user = await lazy.user;
      const credentials = {
        id: user.id,
        email: "new email",
        password: "blhah",
      };
      await expect(
        authService.updateCredentials(credentials),
      ).rejects.toThrow();
    });
    it("should update the email if the password is correct", async () => {
      const { username, password } = randomUser();
      const user = await userService.addUser({
        username,
        password,
        email: "test@email.com",
      });
      const credentials = {
        id: user.id,
        email: "new@email.com",
        password,
      };
      await authService.updateCredentials(credentials);
      const updated = await userService.findByEmail(credentials.email);
      expect(updated?.email).toBe(credentials.email);
    });
    it("should update the password if the password is correct", async () => {
      const { username, password, email } = randomUser();
      const user = await userService.addUser({
        username,
        password,
        email,
      });
      const credentials = {
        id: user.id,
        email,
        password,
        newPassword: "newpassword",
      };
      await authService.updateCredentials(credentials);
      const updated = await authService.loginUser({
        username,
        password: credentials.newPassword,
      });
      expect(updated.username).toEqual(username);
    });
  });
});
