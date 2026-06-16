import Chat from "../models/chatModel.ts";
import type { ChatDocument, ChatServiceParams, UpdateGroup, ChatDTO } from "../types.ts";
import { withChatDTO } from "../utils/dto.ts";
import socketService from "./socketService.ts";

const _add = async ({
  participants,
  name,
  admin,
}: {
  participants: string[];
  name: string;
  admin: string;
}): Promise<ChatDocument> => {
  return new Chat({ participants, name, admin, isGroup: true }).save();
};
const _join = async ({ id, userId }: ChatServiceParams) => {
  const group = await Chat.findOneAndUpdate(
    { _id: id, isGroup: true },
    { $push: { participants: userId } },
    { returnDocument: "after" }
  ).orFail();
  return group;
};
const _update = async ({ admin, update }: { admin: string, update: UpdateGroup }): Promise<ChatDocument> => {
  return Chat.findOneAndUpdate(
    { _id: update.id, admin, isGroup: true },
    { $set: update },
    { returnDocument: "after" },
  ).orFail();
};
const _delete = async ({ id, userId }: ChatServiceParams) => {
  return Chat.findOneAndUpdate({
    _id: id,
    admin: userId,
    isGroup: true,
  }, 
  { closed: true },
  { returnDocument: "after" }
).orFail();
};
const addGroup = withChatDTO(_add);
const addToGroup = withChatDTO(_join);
const updateGroup = withChatDTO(
  _update, 
  (chat: ChatDTO) => socketService.broadcastChat("chat:updated", chat)
);
const deleteGroup = withChatDTO(
  _delete,
  (chat: ChatDTO) => socketService.broadcastChat("chat:updated", chat)
);
const searchGroups = async (query: string) => {
  return Chat.find({
    isGroup: true,
    closed: false,
    name: { $regex: query, $options: 'i' }
  }).select('name participants');
};

export default { 
  searchGroups,
  addGroup,
  deleteGroup,
  updateGroup,
  addToGroup
};