import mongoose from "mongoose";
import logger from "./logger.ts";
import config from "./config.ts";

import Message from "../models/messageModel.ts";
import Chat from "../models/chatModel.ts";
import User from "../models/userModel.ts";

import messageEntries from "../data/messageEntries.ts";
import userEntries from "../data/userEntries.ts";
import bcrypt from "bcrypt";
try {
  await mongoose.connect(config.MONGODB_URI, { family: 4 });
  logger.info("connected to MongoDB");
} catch (e) {
  if (e instanceof Error) {
    logger.error("error connection to MongoDB:", e.message);
  }
}

const Models = [Message, Chat, User];

await Promise.all(
  Models.map(async (model) => {
    await model.deleteMany();
    console.log(`[Deleted] ${model.modelName} entries`);
  }),
);

try {
  const uEntries = await Promise.all(
    userEntries.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 0),
      authProvider: "local",
      refreshToken: (Math.random() + 1).toString(36).substring(7),
    })),
  );

  const users = await User.insertMany(uEntries);
  console.log("[Seed] users");
  // first user oliver.smith@gmail.com password123
  const [senderId, receiverId] = [users[0], users[1]].map((u) => u.id);
  const { id: chatId } = await new Chat({
    participants: [senderId, receiverId],
  }).save();
  console.log("[Seed] chats");

  const senderMessages = messageEntries
    .slice(0, messageEntries.length / 2)
    .map((content) => {
      return {
        userId: senderId,
        chatId,
        content,
      };
    });
  await Message.insertMany(senderMessages);

  const receiverMessages = messageEntries
    .slice(messageEntries.length / 2)
    .map((content) => {
      return {
        userId: receiverId,
        chatId,
        content,
      };
    });
  await Message.insertMany(receiverMessages);
  console.log("[Seed] messages");
} catch (e) {
  console.log(e);
}

await mongoose.connection.close();
console.log("Mongoose connection closed");
