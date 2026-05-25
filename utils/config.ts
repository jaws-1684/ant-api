import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const env = process.env as Record<PropertyKey, string>;
const MONGODB_URI =
  env.NODE_ENV == "test"
    ? env.TEST_MONGODB_URI
    : env.MONGODB_URI;
const REDIS_URL = env.NODE_ENV === "production"
    ? env.REDIS_URL
    : env.DEVELOPMENT_REDIS_URL;    
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const CLIENT_URL = env.CLIENT_URL || "http://localhost:5173";
export default {
  PORT: env.PORT || 3001,
  MONGODB_URI,
  REDIS_URL,
  BASE_URL: env.BASE_URL,
  JWT_SECRET: env.JWT_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
  CLIENT_URL,
  ALLOWED_ORIGINS: [CLIENT_URL],
  CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET: env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
  cookieOptions,
};
