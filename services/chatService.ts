import Chat from "../models/chatModel.ts";
import Message from "../models/messageModel.ts";
import type { ChatDocument, ChatDTO, MessageDocument } from "../types.ts";

interface ChatServiceParams {
  id: string;
  userId: string;
}
interface ParticipantsTuple {
  participants: readonly [string, string];
}

const getChats = async (userId: string): Promise<ChatDTO[]> => {
  const chats = await Chat.find({
    participants: userId,
    deletedFor: { $nin: [userId] },
  }).populate("participants");

  const chatsWithUnread = await Promise.all(
    chats.map(async (chat: ChatDocument) => {
      const lastRead = chat.lastReadAt?.get(userId) ?? new Date(0);
      const [lastMessage, unread] = await getUnreadMessages({
        id: chat.id,
        userId,
        lastRead,
      });
      return { ...chat.toJSON(), id: chat.id, unread, lastMessage };
    }),
  );

  return chatsWithUnread.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt?.getTime() ?? 0;
    const bTime = b.lastMessage?.createdAt?.getTime() ?? 0;
    return bTime - aTime;
  });
};

const addChat = async ({
  participants,
}: ParticipantsTuple): Promise<ChatDocument> => {
  const chat = await findByParticipants({ participants });
  if (chat) return chat;
  return new Chat({ participants }).save();
};
const deleteChat = async ({ id, userId }: ChatServiceParams) => {
  return Chat.findOneAndUpdate(
    { _id: id, participants: userId },
    { $push: { deletedFor: userId } },
    { returnDocument: "after" },
  ).orFail();
};
const markAsRead = async ({
  id,
  userId,
}: ChatServiceParams): Promise<ChatDocument> => {
  return Chat.findOneAndUpdate(
    { _id: id, participants: userId },
    { $set: { [`lastReadAt.${userId}`]: new Date() } },
    { returnDocument: "after" },
  )
    .orFail()
    .populate("participants");
};
const getUnreadMessages = async ({
  id,
  userId,
  lastRead,
}: ChatServiceParams & { lastRead: NativeDate }): Promise<
  [MessageDocument | null, number]
> => {
  return Promise.all([
    Message.findOne({ chatId: id }).sort({ createdAt: -1 }).limit(1),
    Message.countDocuments({
      chatId: id,
      userId: { $ne: userId },
      createdAt: { $gt: lastRead },
    }),
  ]);
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
};
