import type { NextFunction, Response, Request } from "express";
import type { AuthenticatedRequest, UserDocument, UserDTO } from "../types.ts";
import authService from "../services/authService.ts";
import config from "./config.ts";
import userService from "../services/userService.ts";
import bcrypt from "bcrypt";
import { ForbiddenError, InvalidCredentialsError } from "./errors.ts";

const SALT_ROUNDS = 10;
export const withAuth = async (
  fn: () => Promise<UserDocument>,
  response: Response<UserDTO>,
  next: NextFunction,
  status = 200,
) => {
  try {
    const user = await fn();
    const refreshToken = await authService.createRefreshToken(user.id);
    response.cookie("refreshToken", refreshToken, config.cookieOptions);
    response.status(status).json(user);
  } catch (e: unknown) {
    next(e);
  }
};
export const getCurrentUserId = (
  request: Request<unknown, unknown, unknown>,
) => {
  const autRequest = request as AuthenticatedRequest;
  return autRequest.user._id.toString();
};
export const authorizedUser = async ({
  id,
  password,
}: {
  id: string;
  password: string;
}): Promise<UserDocument> => {
  const user = await userService.findById(id);
  if (!user) throw new ForbiddenError();
  const match = await matchPassword(password, user.password!);
  if (isMatch(match)) return user;
  throw match.error as Error;
};

export const hashPassword = async (plainTextPassword: string) => {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
};
export const matchPassword = async (
  plainTextPassword: string,
  hashedPassword: string,
) => {
  const match = await bcrypt.compare(plainTextPassword, hashedPassword);
  if (!match) return { ok: false, error: new InvalidCredentialsError() };
  return { ok: true };
};
export const isMatch = (match: {
  ok: true | false;
  error?: InvalidCredentialsError;
}) => {
  if (match.ok) return true;
  return false;
};
