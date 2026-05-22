import jwt from "jsonwebtoken";
import config from "./config.ts";

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: "15m",
  });
};
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
