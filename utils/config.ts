import dotenv from "dotenv";
dotenv.config({ path: ".env" });


const env = process.env as Record<PropertyKey, string>;
const NODE_ENV = env.NODE_ENV;
const TEST_ENV = NODE_ENV == "test";
const PRODUCTION_ENV = NODE_ENV == "production";
const DEV_ENV = NODE_ENV == "development";
const MONGODB_URI =
  TEST_ENV
    ? env.TEST_MONGODB_URI
    : env.MONGODB_URI;
const REDIS_URL = PRODUCTION_ENV
    ? env.REDIS_URL
    : env.DEVELOPMENT_REDIS_URL;    
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: PRODUCTION_ENV,
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
  COOKIE_OPTIONS,
  NODE_ENV,
  TEST_ENV,
  PRODUCTION_ENV,
  DEV_ENV
};
