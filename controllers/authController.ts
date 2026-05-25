import config from "../utils/config.ts";
import { UnauthorizedError } from "../utils/errors.ts";
import userService from "../services/userService.ts";
import type { Request, Response, NextFunction } from "express";
import authService from "../services/authService.ts";
import {
  loginSchema,
  passwordSchema,
  updateCredentialsSchema,
  userSchema,
} from "../utils/schemas.ts";
import { getCurrentUserId, withAuth } from "../utils/auth.ts";
import type {
  LoginPayload,
  NewUser,
  UpdateCredentialsPayload,
  UserDTO,
} from "../types.ts";

const signup = async (
  request: Request<unknown, unknown, NewUser>,
  response: Response<UserDTO>,
  next: NextFunction,
) => {
  await withAuth(
    () => {
      const newUser = userSchema.parse(request.body);
      return userService.addUser(newUser);
    },
    response,
    next,
    201,
  );
};
const login = async (
  request: Request<unknown, unknown, LoginPayload>,
  response: Response<UserDTO>,
  next: NextFunction,
) => {
  await withAuth(
    () => {
      const user = loginSchema.parse(request.body);
      return authService.loginUser(user);
    },
    response,
    next,
  );
};
const refresh = async (
  request: Request,
  response: Response<{ accessToken: string }>,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    const refreshToken = request?.cookies?.refreshToken as string;
    if (!refreshToken) throw new UnauthorizedError();
    const accessToken = await authService.createAccessToken(refreshToken);
    response.json({ accessToken });
  } catch (e) {
    next(e);
  }
};
const logout = (_request: Request, response: Response) => {
  response.clearCookie("refreshToken");
  response.json({ ok: true });
};
const deleteProfile = async (
  request: Request<unknown, unknown, { password: string }>,
  response: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const password = passwordSchema.parse(request.body?.password);
    await authService.deleteProfile({ id: userId, password });
    response.clearCookie("refreshToken");
    response.json({ ok: true });
  } catch (e: unknown) {
    next(e);
  }
};
const updateCredentials = async (
  request: Request<unknown, unknown, UpdateCredentialsPayload>,
  response: Response<UserDTO>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const payload = updateCredentialsSchema.parse({
      ...request.body,
      id: userId,
    });
    const updatedUser = await authService.updateCredentials(payload);
    response.json(updatedUser as UserDTO);
  } catch (e) {
    next(e);
  }
};
const oauthCallback = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    if (!request.user) throw new UnauthorizedError();
    const refreshToken = await authService.createRefreshToken(request.user.id);
    response.cookie("refreshToken", refreshToken, config.COOKIE_OPTIONS);
    response.redirect(config.CLIENT_URL);
  } catch (e) {
    next(e);
  }
};

export default {
  signup,
  login,
  refresh,
  logout,
  oauthCallback,
  updateCredentials,
  deleteProfile,
};
