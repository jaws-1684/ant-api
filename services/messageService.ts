import type { NewMessage, MessageDTO, UpdateMessage } from "../types/index.ts";
import Message from "../models/messageModel.ts";
import Chat from "../models/chatModel.ts";

interface MessageServiceParams {
    id: string
    userId: string
}
interface GetMessagesParams {
    chatId: string
    userId: string
    limit?: number
    offset?: number
    page?: number | null
}

const LIMIT = 50;
const OFFSET = 0;
const PAGE = null;

const getMessages = async ({ chatId, userId, page=PAGE, limit=LIMIT, offset=OFFSET }: GetMessagesParams): Promise<MessageDTO[]> => {
    if (page) {
        offset = (page-1)*limit
    }
    await Chat.findOne({ _id: chatId, participants: userId }).orFail();
    const messages = await Message.find({ chatId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit) 
    return messages.map(message => {
        if(message.softDeleted) {
            return {...message.toJSON(), content: "This message was deleted" }
        } 
        return message.toJSON()
    });
};
const addMessage = async (newMessage: NewMessage): Promise<MessageDTO> => {
    await Chat.findOne({ _id: newMessage.chatId, participants: newMessage.userId }).orFail();
    return new Message(newMessage).save();
};
const updateMessage = async (updateMessage: UpdateMessage): Promise<MessageDTO> => {
    const message = await Message.findOne({ _id: updateMessage.id, userId: updateMessage.userId }).orFail();
    message.isEdited = true;
    message.content = updateMessage.content;
    return message.save()
};
const deleteMessage = async ({ id, userId }: MessageServiceParams) => {
    return Message.findOneAndUpdate(
        { _id: id, userId }, 
        { softDeleted: true },
        { returnDocument: "after" }
    ).orFail();
}
const findMessage = async ({ id, userId }: MessageServiceParams) => {
    return Message.findOne({ _id: id, userId });
}
const insertMessages = async (messages: NewMessage[]) => {
    return Message.insertMany(messages);
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
