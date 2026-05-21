import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.ts";
import passport from "../utils/passport.ts";
import { UnauthorizedError, toAppError } from "./errors.ts";

const requestLogger = (request: Request, _: Response, next: NextFunction) => {
  logger.info("[Method]:", request.method);
  logger.info("[Path]:  ", request.path);
  logger.info("[Body]:  ", JSON.stringify(request.body));
  logger.info("---");
  next();
};

const unknownEndpoint = (_request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (error && error instanceof Error) {
    logger.error(error.message);

    const appError = toAppError(error);

    if (appError) {
      const { error, status } = appError.toObject();
      return response.status(status).json({ error });
    }
  }
  return next(error);
};

const authMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: Error, user: Express.User) => {
      if (err || !user) {
        return next(new UnauthorizedError());
      }
      request.user = user;
      return next();
    },
  )(request, response, next);
};

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  authMiddleware,
};
