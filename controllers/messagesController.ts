import messageService from '../services/messageService.ts';
import type { MessageDTO, MessagePayload } from "../types/index.ts";
import type { Response, Request, NextFunction } from 'express';
import { getCurrentUserId } from '../controllers/auth.ts';
import { parseId, parseMessage, parseUpdateMessage } from '../utils/parsers.ts';


const createMessage = async (
  request: Request<unknown, unknown, MessagePayload>, 
  response: Response<MessageDTO>, 
  next: NextFunction
) => {
  try {
    const currentUserId = getCurrentUserId(request);
    const messagePayload = parseMessage(request.body)
   
    const message = {
      ...messagePayload,
      user: currentUserId,
    };
    const newMessage = await messageService.addMessage(message);
    response.status(201).send(newMessage);
  } catch(e: unknown) {
    next(e);
  }
}

const deleteMessage = async (
  request: Request, 
  response: Response<MessageDTO>, 
  next: NextFunction
) => {
  try {
    const currentUserId = getCurrentUserId(request);
    const messageId = parseId(request.params.id);
    const deletedMessage = await messageService.deleteMessage({ id: messageId, userId: currentUserId });
    response.status(200).send(deletedMessage);
  } catch(e: unknown) {
    next(e);
  }
}
const updateMessage = async (
  request: Request, 
  response: Response<MessageDTO>, 
  next: NextFunction
) => {
    try {
    const currentUserId = getCurrentUserId(request);
    const messageId = parseId(request.params.id);
    const messagePayload = parseUpdateMessage(request.body)
   
    const message = {
      ...messagePayload,
      user: currentUserId,
      id: messageId
    };
    const updatedMessage = await messageService.updateMessage(message);
    response.status(200).send(updatedMessage);
  } catch(e: unknown) {
    next(e);
  }
}

export default { createMessage, deleteMessage, updateMessage }