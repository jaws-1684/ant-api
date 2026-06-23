import type { NewMessage, MessageDTO, UpdateMessage, MessageDocument } from "../types.ts";
import Message from "../models/messageModel.ts";
import Notification from "../models/notificationModel.ts";
import Chat from "../models/chatModel.ts";
import socketService from "./socketService.ts";
import { withMessageDTO } from "../utils/dto.ts";

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

const _add = async (newMessage: NewMessage): Promise<MessageDocument> => {
  const chat = await Chat.findOne({
    _id: newMessage.chatId,
    participants: newMessage.userId,
  }).orFail();
  const message = await new Message(newMessage).save();
  const notification = await Notification.findOneAndUpdate(
      { chatId: newMessage.chatId, userId: newMessage.userId },
      { "$inc": { newMessages: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  await Chat.updateOne(
  { _id: chat._id },
  { $addToSet: { notifications: notification._id }, lastMessage: message }
);
  return message;
};
const _update = async (
  updateMessage: UpdateMessage,
): Promise<MessageDocument> => {
  const message = await Message.findOne({
    _id: updateMessage.id,
    userId: updateMessage.userId,
  }).orFail();
  message.isEdited = true;
  message.content = updateMessage.content;
  const updated = await message.save();
  return updated;
};
const _delete = async ({ id, userId }: MessageServiceParams) => {
  const deleted = await Message.findOneAndUpdate(
    { _id: id, userId },
    { softDeleted: true },
    { returnDocument: "after" },
  ).orFail();
  return deleted;
};
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
const addMessage = withMessageDTO(
  _add, 
  (message: MessageDTO) => socketService.broadcastMessage("message:new", message)
);
const updateMessage = withMessageDTO(
  _update, 
  (message: MessageDTO) => socketService.broadcastMessage("message:updated", message)
);
const deleteMessage = withMessageDTO(
  _delete, 
  (message: MessageDTO) => socketService.broadcastMessage("message:updated", message)
);
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
