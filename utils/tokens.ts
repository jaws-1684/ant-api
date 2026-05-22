import jwt from "jsonwebtoken";
import config from "./config.ts";

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, config.JWT_SECRET as string, {
    expiresIn: "15m",
  });
};
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};
