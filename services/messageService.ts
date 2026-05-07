import type { NewMessage, MessageDTO, UpdateMessage } from "../types/index.ts";
import Message from "../models/message.ts";
import Chat from "../models/chat.ts";


const getMessages = async ({ chatId, userId }: { chatId: string, userId: string }): Promise<MessageDTO[]> => {
    const chat = await Chat.findOne({ _id: chatId, participants: userId }).orFail();
    return Message.find({ chat: chat._id });
};
const addMessage = async (newMessage: NewMessage): Promise<MessageDTO> => {
    await Chat.findOne({ _id: newMessage.chat, participants: newMessage.user }).orFail();
    return new Message(newMessage).save();
};
const updateMessage = async (updateMessage: UpdateMessage): Promise<MessageDTO> => {
    const message = await Message.findOne({ _id: updateMessage.id, user: updateMessage.user }).orFail();
    message.content = updateMessage.content;
    return await message.save()
};
const deleteMessage = async ({ id, userId }: { id: string, userId: string }) => {
    await Message.deleteOne({ _id: id, user: userId }).orFail();
}
const findMessage = async ({ id, userId }: { id: string, userId: string }) => {
    return Message.findOne({ _id: id, user: userId });
}
const insertMessages = async (messages: NewMessage[]) => {
    return await Message.insertMany(messages);
}

const dropMessages = async () => Message.deleteMany({});
export default {
    getMessages,
    addMessage,
    dropMessages,
    deleteMessage,
    findMessage,
    updateMessage,
    insertMessages
};
