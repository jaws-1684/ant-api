import express from "express";
import db from "./utils/db.ts";
import middleware from "./utils/middleware.ts";
import cors from "cors";
import passport from "passport";
import messageRouter from "./routes/messageRouter.ts";
import authRouter from "./routes/authRouter.ts";
import chatRouter from "./routes/chatRouter.ts";
import cloudinaryRouter from "./routes/cloudinaryRouter.ts";
import cookieParser from "cookie-parser";
import "./utils/errors.ts";
import cloudinary from "./utils/cloudinary.ts";
import searchRouter from "./routes/searchRouter.ts";
import groupRouter from "./routes/groupRouter.ts";
import config from "./utils/config.ts";
import redis from "./utils/redis.ts";

const app = express();

const options: cors.CorsOptions = {
  origin: config.ALLOWED_ORIGINS,
};
cloudinary.config();
redis.config();
await db.connect();
app.use(cors(options));
app.use(passport.initialize());
app.use(cookieParser());
// app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/api/auth", authRouter);
app.use(middleware.authMiddleware);
app.use("/api/messages", messageRouter);
app.use("/api/chats", chatRouter);
app.use("/api/groups", groupRouter);
app.use("/api/cloudinary", cloudinaryRouter);
app.use("/api/search", searchRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
