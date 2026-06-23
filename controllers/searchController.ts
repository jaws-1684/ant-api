import type { Request, Response, NextFunction } from "express";
import userService from "../services/userService.ts";
import groupService from "../services/groupService.ts";
import { stringSchema } from "../utils/schemas.ts";

const searchUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = stringSchema.parse(request?.query.query);
    const users = await userService.searchUsers(query);
    response.send(users);
  } catch (e) {
    next(e);
  }
};

const searchGroups = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = stringSchema.parse(request?.query.query);
    const groups = await groupService.searchGroups(query);
    response.send(groups);
  } catch (e) {
    next(e);
  }
};

export default { searchUsers, searchGroups };