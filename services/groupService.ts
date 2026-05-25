import Chat from "../models/chatModel.ts";
import type { ChatDocument, ChatServiceParams, UpdateGroup } from "../types.ts";

const addGroup = async ({
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
const addToGroup = async ({ id, userId }: ChatServiceParams) => {
  const group = await Chat.findOneAndUpdate(
    { _id: id, isGroup: true },
    { $push: { participants: userId } },
    { returnDocument: "after" }
  ).orFail();
  return group;
};
const deleteGroup = async ({ id, userId }: ChatServiceParams) => {
  return Chat.findOneAndUpdate({
    _id: id,
    admin: userId,
    isGroup: true,
  }, 
  { closed: true },
  { returnDocument: "after" }
).orFail();
};
const searchGroups = async (query: string) => {
  return Chat.find({
    isGroup: true,
    closed: false,
    name: { $regex: query, $options: 'i' }
  }).select('name participants');
};
const updateGroup = async (admin: string, update: UpdateGroup): Promise<ChatDocument> => {
  return Chat.findOneAndUpdate(
    { _id: update.id, admin, isGroup: true },
    { $set: update },
    { returnDocument: "after" },
  ).orFail();
};
export default { 
  searchGroups,
  addGroup,
  deleteGroup,
  updateGroup,
  addToGroup
};