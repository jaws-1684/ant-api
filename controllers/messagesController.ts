import messageService from "../services/messageService.ts";
import type { MessageDTO, NewMessage, UpdateMessage } from "../types.ts";
import type { Response, Request, NextFunction } from "express";
import { getCurrentUserId } from "../utils/auth.ts";
import {
  messageSchema,
  updateMessageSchema,
  objectIdSchema,
} from "../utils/schemas.ts";
import io, { broadcastMessage } from "../utils/socket.ts";
const createMessage = async (
  request: Request<unknown, unknown, NewMessage>,
  response: Response<MessageDTO>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const message = messageSchema.parse({ ...request.body, userId });
    const newMessage = await messageService.addMessage(message);
    broadcastMessage("message:new", newMessage);
    response.status(201).send(newMessage);
  } catch (e: unknown) {
    next(e);
  }
};

const deleteMessage = async (
  request: Request<{ id: string }>,
  response: Response<MessageDTO>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const messageId = objectIdSchema.parse(request.params.id);
    const deletedMessage = await messageService.deleteMessage({
      id: messageId,
      userId,
    });
    broadcastMessage("message:updated", deletedMessage);
    response.send(deletedMessage);
  } catch (e: unknown) {
    next(e);
  }
};
const updateMessage = async (
  request: Request<{ id: string }, unknown, UpdateMessage>,
  response: Response<MessageDTO>,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(request);
    const message = updateMessageSchema.parse({
      ...request.body,
      id: request.params?.id,
      userId,
    });
    const updatedMessage = await messageService.updateMessage(message);
    broadcastMessage("message:updated", updatedMessage);
    response.send(updatedMessage);
  } catch (e: unknown) {
    next(e);
  }
};

export default { createMessage, deleteMessage, updateMessage };
