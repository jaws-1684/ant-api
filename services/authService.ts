import jwt from "jsonwebtoken";
import config from "../utils/config.ts";
import userService from "./userService.ts";
import {
  ForbiddenError,
  type InvalidCredentialsError,
} from "../utils/errors.ts";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.ts";
import type {
  LoginPayload,
  UpdateCredentialsPayload,
  UserDocument,
} from "../types.ts";
import { authorizedUser, hashPassword, matchPassword } from "../utils/auth.ts";
const createAccessToken = async (refreshToken: string): Promise<string> => {
  const decoded = jwt.verify(
    refreshToken,
    config.JWT_REFRESH_SECRET as string,
  ) as { userId: string };
  const user = await userService.findById(decoded.userId);
  if (!user || user.refreshToken !== refreshToken) throw new ForbiddenError();
  return generateAccessToken(user.id);
};
const createRefreshToken = async (userId: string): Promise<string> => {
  const refreshToken = generateRefreshToken(userId);
  await userService.updateRefreshToken({ id: userId, refreshToken });
  return refreshToken;
};
const loginUser = async (loginUser: LoginPayload): Promise<UserDocument> => {
  const user = loginUser.email
    ? await userService.findByEmail(loginUser.email)
    : await userService.findByUsername(loginUser.username!);
  const password = loginUser.password;
  if (!user || user.deleted) {
    const dummyHash =
      "$2b$10$invalidhashtopreventtimingattacks000000000000000000000";
    const match = (await matchPassword(password, dummyHash)) as {
      ok: false;
      error: InvalidCredentialsError;
    };
    throw match.error;
  }
  return authorizedUser({ id: user.id, password });
};
const updateCredentials = async (
  updateUserCredentials: UpdateCredentialsPayload,
): Promise<UserDocument | null> => {
  const { id, email, password, newPassword } = updateUserCredentials;
  const user = await authorizedUser({ id, password });

  if (email !== undefined) user.email = email;
  if (newPassword !== undefined)
    user.password = await hashPassword(newPassword);

  return user.save();
};
const deleteProfile = async (
  deleteUser: Pick<UpdateCredentialsPayload, "id" | "password">,
): Promise<void> => {
  const user = await authorizedUser(deleteUser);
  user.deleted = true;
  await user.save();
};

export default {
  createAccessToken,
  createRefreshToken,
  loginUser,
  updateCredentials,
  deleteProfile,
};
