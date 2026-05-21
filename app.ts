import express from 'express';
import db from './utils/db.ts';
import middleware from './utils/middleware.ts';
import cors from "cors";
import passport from 'passport';
import messageRouter from "./routes/messageRouter.ts";
import authRouter from './routes/authRouter.ts';
import chatsRouter from './routes/chatRouter.ts'
import cookieParser from 'cookie-parser';
import './utils/errors.ts'


const app = express();
const allowedOrigins = ['http://localhost:5173'];

const options: cors.CorsOptions = {
  origin: allowedOrigins 
};


await db.connect();
app.use(cors(options));
app.use(passport.initialize());
app.use(cookieParser());
// app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/auth', authRouter);
app.use(middleware.authMiddleware);
app.use('/api/messages', messageRouter);
app.use('/api/chats', chatsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
