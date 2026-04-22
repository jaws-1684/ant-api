import express from 'express';
import mongoose from 'mongoose';
import config from './utils/config.ts';
import logger from './utils/logger.ts';
import middleware from './utils/middleware.ts';
import cors from "cors";
import messageRouter from "./routes/messages.ts";


const app = express();
const allowedOrigins = ['http://localhost:5173'];

const options: cors.CorsOptions = {
  origin: allowedOrigins 
};

app.use(cors(options));
logger.info('connecting to', config.MONGODB_URI as string)

mongoose
  .connect(config.MONGODB_URI as string, { family: 4 })
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    if (error instanceof Error) {
        logger.error('error connection to MongoDB:', error.message);
    }
  });

// app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/messages', messageRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
