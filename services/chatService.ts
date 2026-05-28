import Chat from "../models/chatModel.ts";
import Message from "../models/messageModel.ts";
import Notification from "../models/notificationModel.ts";
import User from "../models/userModel.ts";
import type { ChatDocument, ChatDTO, ChatServiceParams, ReturnedChat } from "../types.ts";
import { withDTO } from "../utils/serializers.ts";
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
const toDTO = async <T extends ChatDocument>(doc: T): Promise<ChatDTO> => {
  const lastMessage = await Message.findOne({ _id: doc.lastMessage });
  const notifications = await Notification.find({ chatId: doc._id });
  const participants = await User.find({ '_id': { $in: doc.participants } });
  const chat = doc.toJSON() as ReturnedChat & { id: string };  
  return {
    ...chat,
    notifications: notifications.map(n => n.toJSON()),
    participants: participants.map(p => ({ ...p.toJSON(), id: p._id.toString() })),
    lastMessage: lastMessage?.toJSON()
  };
};
const getChats = async (userId: string, { group }: IsGroup = { group: false }): Promise<ChatDTO[]> => {
  const chats = await Chat.find({
    participants: userId,
    deletedFor: { $nin: [userId] },
    isGroup: group,
    closed: false
  });
  const dtos = await Promise.all(chats.map((c) => toDTO(c)));
  return toSorted(dtos); 
};
//add broadcastings late and mutations if needed
const addChat = withDTO(_add, toDTO);  
const deleteChat = withDTO(_del, toDTO);
const markAsRead = withDTO(_mark, toDTO);
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
  toDTO
};
