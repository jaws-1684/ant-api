import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.ts";

const requestLogger = (request: Request, _: Response, next: NextFunction) => {
    logger.info('Method:', request.method);
    logger.info('Path:  ', request.path);
    logger.info('Body:  ', JSON.stringify(request.body));
    logger.info('---');
    next();
};

const unknownEndpoint = (_request: Request, response: Response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error: Error, _request: Request, response: Response, next: NextFunction) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
  return;
};

export default {
    requestLogger,
    unknownEndpoint,
    errorHandler
};


