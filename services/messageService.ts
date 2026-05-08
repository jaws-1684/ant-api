import type { NewMessage, MessageDTO, UpdateMessage } from "../types/index.ts";
import Message from "../models/messageModel.ts";
import Chat from "../models/chatModel.ts";

interface MessageServiceParams {
    id: string,
    userId: string
}
const getMessages = async ({ chatId, userId }: { chatId: string, userId: string }): Promise<MessageDTO[]> => {
    const chat = await Chat.findOne({ _id: chatId, participants: userId }).orFail();
    const messages = await Message.find({ chatId: chat._id });
    return messages.map(message => {
        if(message.softDeleted) {
            return {...message, content: "This message was deleted" }
        } 
        return message
    });
};
const addMessage = async (newMessage: NewMessage): Promise<MessageDTO> => {
    await Chat.findOne({ _id: newMessage.chatId, participants: newMessage.userId }).orFail();
    return new Message(newMessage).save();
};
const updateMessage = async (updateMessage: UpdateMessage): Promise<MessageDTO> => {
    const message = await Message.findOne({ _id: updateMessage.id, user: updateMessage.userId }).orFail();
    message.isEdited = true;
    message.content = updateMessage.content;
    return await message.save()
};
const deleteMessage = async ({ id, userId }: MessageServiceParams) => {
    return await Message.findOneAndUpdate({ _id: id, userId }, { softDeleted: true }).orFail();
}
const findMessage = async ({ id, userId }: MessageServiceParams) => {
    return Message.findOne({ _id: id, userId });
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
