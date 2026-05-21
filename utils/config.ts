import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const MONGODB_URI =
  process.env.NODE_ENV == "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export default {
  PORT: process.env.PORT || 3001,
  MONGODB_URI,
  BASE_URL: process.env.BASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  cookieOptions,
};
