import type { ChatDTO, GroupPayload } from "../types.ts";
import type { Response, Request, NextFunction } from "express";
import { groupSchema, objectIdSchema, updateGroupSchema } from "../utils/schemas.ts";
import { getCurrentUserId } from "../utils/auth.ts";
import chatService from "../services/chatService.ts";
import groupService from "../services/groupService.ts";

const getGroups = async (
  request: Request,
  response: Response<ChatDTO[]>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const groups = await chatService.getChats(userId, { group: true });
    response.send(groups);
  } catch (e: unknown) {
    next(e);
  }
};
const createGroup = async (
  request: Request<unknown, unknown, GroupPayload>,
  response: Response<ChatDTO>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const newGroup = groupSchema.parse(request?.body);
    const group = await groupService.addGroup({
      ...newGroup,
      admin: userId,
    });
    response.status(201).send(group);
  } catch (e) {
    next(e);
  }
};
const joinGroup = async (
  request: Request<{ id: string }>,
  response: Response<ChatDTO>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const id = objectIdSchema.parse(request.params?.id);
    const group = await groupService.addToGroup({ userId, id });
    response.status(201).send(group);
  } catch (e) {
    next(e);
  }
};
const updateGroup = async (
  request: Request<{id: string}, unknown, GroupPayload>,
  response: Response<ChatDTO>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const update = updateGroupSchema.parse({ ...request?.body, id: request.params?.id });
    const group = await groupService.updateGroup(userId, update);
    response.send(group);
  } catch (e) {
    next(e);
  }
};
const deleteGroup = async (
  request: Request<{ id: string }>,
  response: Response<ChatDTO>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const id = objectIdSchema.parse(request.params?.id);
    const deleted = await groupService.deleteGroup({ id, userId });
    response.send(deleted);
  } catch (e) {
    next(e);
  }
};

export default { 
    getGroups, 
    createGroup, 
    deleteGroup,
    updateGroup,
    joinGroup 
};