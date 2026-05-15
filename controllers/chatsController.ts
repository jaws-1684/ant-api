import type { ChatDTO, MessageDTO } from "../types/index.ts";
import type { Response, Request, NextFunction } from 'express';
import { pageSchema, objectIdSchema } from "../utils/schemas.ts";
import { getCurrentUserId } from "../utils/auth.ts";
import messageService from "../services/messageService.ts";
import chatService from "../services/chatService.ts";


const getMessages = async (request: Request<{ id: string }>, response: Response<MessageDTO[]>, next: NextFunction) => {
    try {
        const chatId = objectIdSchema.parse(request.params.id)
        const page = pageSchema.parse(request.query.page);
        const userId = getCurrentUserId(request);
        const messages = await messageService.getMessages({ chatId, userId, page });
        await chatService.markAsRead({ id: chatId, userId })
        response.send(messages);
    } catch (e) {
        next(e);
    };
};
const getChats = async (request: Request, response: Response<ChatDTO[]>, next: NextFunction) => {
    try {
        const userId = getCurrentUserId(request)
        const chats = await chatService.getChats(userId);
        response.send(chats);
    } catch (e) {
        next(e);
    };
};

const createChat = async (
  request: Request<unknown, unknown, { friendId: string }>, 
  response: Response<ChatDTO>, 
  next: NextFunction
) => {
  try {
    const userId = getCurrentUserId(request);
    const friendId = objectIdSchema.parse(request.body.friendId)
    const newChat = await chatService.addChat({ participants: [ userId, friendId ]});
    response.status(201).send(newChat);
  } catch(e: unknown) {
    next(e);
  }
}

const deleteChat = async (
  request: Request<{ id: string }>, 
  response: Response<ChatDTO>, 
  next: NextFunction
) => {
  try {
    const userId = getCurrentUserId(request);
    const chatId = objectIdSchema.parse(request.params.id);
    const deletedChat = await chatService.deleteChat({ id: chatId, userId });
    response.send(deletedChat);
  } catch(e: unknown) {
    next(e);
  }
}

export default {
    getMessages,
    getChats,
    createChat,
    deleteChat
};