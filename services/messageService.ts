import type { NewMessage, MessageDTO, UpdateMessage, MessageDocument } from "../types.ts";
import Message from "../models/messageModel.ts";
import Notification from "../models/notificationModel.ts";
import Chat from "../models/chatModel.ts";
import socketService from "./socketService.ts";

interface MessageServiceParams {
  id: string;
  userId: string;
}
interface GetMessagesParams {
  chatId: string;
  userId: string;
  limit?: number;
  offset?: number;
  page?: number | null;
}

const LIMIT = 50;
const OFFSET = 0;
const PAGE = null;

const getMessages = async ({
  chatId,
  userId,
  page = PAGE,
  limit = LIMIT,
  offset = OFFSET,
}: GetMessagesParams): Promise<MessageDTO[]> => {
  if (page) {
    offset = (page - 1) * limit;
  }
  await Chat.findOne({ _id: chatId, participants: userId }).orFail();
  const messages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  return messages.map(m => m.toJSON());
};
const addMessage = async (newMessage: NewMessage): Promise<MessageDocument> => {
   await Chat.findOne({
    _id: newMessage.chatId,
    participants: newMessage.userId,
  }).orFail();
  const message = await new Message(newMessage).save();
  await Notification.findOneAndUpdate(
      { chatId: newMessage.chatId, userId: newMessage.userId },
      { "$inc": { newMessages: 1 } },
      { upsert: true },
    );
  await socketService.broadcastMessage("message:new", message);
  return message;
};
const updateMessage = async (
  updateMessage: UpdateMessage,
): Promise<MessageDocument> => {
  const message = await Message.findOne({
    _id: updateMessage.id,
    userId: updateMessage.userId,
  }).orFail();
  message.isEdited = true;
  message.content = updateMessage.content;
  const updated = await message.save();
  await socketService.broadcastMessage("message:updated", updated);
  return updated;
};
const deleteMessage = async ({ id, userId }: MessageServiceParams) => {
  const deleted = await Message.findOneAndUpdate(
    { _id: id, userId },
    { softDeleted: true },
    { returnDocument: "after" },
  ).orFail();
  await socketService.broadcastMessage("message:updated", deleted);
  return deleted;
};
const findMessage = async ({ id, userId }: MessageServiceParams) => {
  return Message.findOne({ _id: id, userId });
};
const insertMessages = async (messages: NewMessage[]) => {
  return Message.insertMany(messages);
};
const dropMessages = async () => Message.deleteMany({});
export default {
  getMessages,
  addMessage,
  dropMessages,
  deleteMessage,
  findMessage,
  updateMessage,
  insertMessages,
};
