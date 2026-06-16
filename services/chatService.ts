import Chat from "../models/chatModel.ts";
import Notification from "../models/notificationModel.ts";
import type { ChatDocument, ChatDTO, ChatServiceParams } from "../types.ts";
import { withChatDTO, toChatDTO } from "../utils/dto.ts";
import socketService from "./socketService.ts";
interface ParticipantsTuple {
  participants: readonly [string, string];
}
type IsGroup = { group?: true | false };
const _add = async ({
  participants,
}: ParticipantsTuple) => {
  const chat = await findByParticipants({ participants });
  if (chat) return chat;
  return new Chat({ participants }).save();
};
const _del = async ({ id, userId }: ChatServiceParams) => {
  return await Chat.findOneAndUpdate(
    { _id: id, participants: userId },
    { $push: { deletedFor: userId } },
    { returnDocument: "after" },
  ).orFail();
};
const _mark = async ({ id, userId }: ChatServiceParams) => {
  const chat = await Chat.findOne({ _id: id }).orFail();
  const notification = await Notification.findOne({ chatId: id, userId: { $ne: userId } });
  if (!notification || notification.newMessages === 0) return chat;
  await Notification.findOneAndUpdate(
    { chatId: id, userId: { $ne: userId }, newMessages: { $ne: 0 }  },
    { newMessages: 0 },
    { upsert: true },
  );
  const marked = await Chat.findOneAndUpdate(
    { _id: id, participants: userId },
    { $set: { [`lastReadAt.${userId}`]: new Date() } },
    { returnDocument: "after" },
  );
  return marked as ChatDocument;
};

const getChats = async (userId: string, { group }: IsGroup = { group: false }): Promise<ChatDTO[]> => {
  const chats = await Chat.find({
    participants: userId,
    deletedFor: { $nin: [userId] },
    isGroup: group,
    closed: false
  });
  const dtos = await Promise.all(chats.map((c) => toChatDTO(c)));
  return toSorted(dtos); 
};
const addChat = withChatDTO(
  _add, 
  (chat: ChatDTO) => socketService.broadcastChat("chat:new", chat));  
const deleteChat = withChatDTO(_del);
const markAsRead = withChatDTO(
  _mark, 
  (chat: ChatDTO) => socketService.broadcastChat("chat:updated", chat)
);
const toSorted = (chats: ChatDTO[]) => {
  return chats.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt?.getTime() ?? 0;
    const bTime = b.lastMessage?.createdAt?.getTime() ?? 0;
    return bTime - aTime;
  });
};
const findById = async (id: string): Promise<null | ChatDocument> =>
  await Chat.findById(id);
const findUserChats = async (userId: string) => {
  return Chat.find({ user: userId });
};
const findOneUserChat = async ({ id, userId }: ChatServiceParams) => {
  return Chat.findOne({ _id: id, participants: userId }).orFail();
};
const findByParticipants = async ({ participants }: ParticipantsTuple) => {
  return Chat.findOne({
    participants: { $all: participants },
  });
};
const dropChats = async () => Chat.deleteMany({});
export default {
  addChat,
  deleteChat,
  dropChats,
  findById,
  findByParticipants,
  findUserChats,
  findOneUserChat,
  markAsRead,
  getChats,
  toChatDTO
};
